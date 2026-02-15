/**
 * PHASE S8.9 - Stock Error Detection & Reconciliation Service
 * Inspired by Boogit's auto-detection of stock inconsistencies
 * 
 * Features:
 * - Automatic detection of negative stock
 * - Scriptic vs. Fizic reconciliation
 * - Variance analysis and alerts
 * - Suggested corrections
 * - Stock movement audit trail
 */

import { Database } from 'sqlite3';

export interface StockError {
  errorId: string;
  errorType: 'NEGATIVE_STOCK' | 'LARGE_VARIANCE' | 'MISSING_MOVEMENT' | 'DUPLICATE_MOVEMENT' | 'EXPIRED_PRODUCT';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  ingredientId: number;
  ingredientName: string;
  ingredientCode?: string;
  warehouseId: number;
  warehouseName: string;
  
  // Current state
  currentStock: number;           // Scriptic (theoretical)
  physicalStock?: number | null;  // Fizic (actual counted)
  variance?: number | null;       // Difference
  variancePercentage?: number | null;
  
  // Additional context
  lastMovementDate?: string | null;
  lastInventoryDate?: string | null;
  expiryDate?: string | null;
  
  // Error details
  errorMessage: string;
  suggestedAction: string;
  detectedAt: string;  // ISO 8601
  
  // Resolution
  resolved: boolean;
  resolvedAt?: string | null;
  resolvedByUserId?: number | null;
  resolvedByName?: string | null;
  resolutionNotes?: string | null;
}

export interface ReconciliationReport {
  reportId: string;
  warehouseId: number;
  warehouseName: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  
  // Summary
  totalIngredients: number;
  ingredientsWithErrors: number;
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  
  // Errors
  errors: StockError[];
  
  // Totals
  totalVarianceValue: number;  // RON
  totalVariancePercentage: number;
}

export interface StockMovementAudit {
  movementId: number;
  ingredientId: number;
  ingredientName: string;
  warehouseId: number;
  movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  unit: string;
  documentType?: string | null;
  documentNumber?: string | null;
  movementDate: string;
  createdByUserId: number;
  createdByName: string;
  notes?: string | null;
}

export class StockErrorDetectionService {
  private db: Database;
  
  // Thresholds for error detection
  private readonly NEGATIVE_STOCK_THRESHOLD = 0;
  private readonly VARIANCE_PERCENTAGE_HIGH = 20;  // 20%
  private readonly VARIANCE_PERCENTAGE_MEDIUM = 10; // 10%
  private readonly DAYS_WITHOUT_MOVEMENT_WARNING = 90;
  private readonly DAYS_UNTIL_EXPIRY_WARNING = 7;
  
  constructor(db: Database) {
    this.db = db;
  }
  
  /**
   * Run comprehensive stock error detection
   */
  async detectStockErrors(warehouseId?: number): Promise<StockError[]> {
    const errors: StockError[] = [];
    
    // 1. Detect negative stock
    const negativeStockErrors = await this.detectNegativeStock(warehouseId);
    errors.push(...negativeStockErrors);
    
    // 2. Detect large variances (scriptic vs. fizic)
    const varianceErrors = await this.detectLargeVariances(warehouseId);
    errors.push(...varianceErrors);
    
    // 3. Detect expired or expiring products
    const expiryErrors = await this.detectExpiringProducts(warehouseId);
    errors.push(...expiryErrors);
    
    // 4. Detect stale stock (no movement for long time)
    const staleStockErrors = await this.detectStaleStock(warehouseId);
    errors.push(...staleStockErrors);
    
    return errors;
  }
  
  /**
   * Detect negative stock levels
   */
  private async detectNegativeStock(warehouseId?: number): Promise<StockError[]> {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          si.id as ingredientId,
          i.name as ingredientName,
          i.code as ingredientCode,
          si.warehouse_id as warehouseId,
          w.name as warehouseName,
          si.quantity as currentStock,
          si.unit,
          si.updated_at as lastMovementDate
        FROM stock_items si
        JOIN ingredients i ON i.id = si.ingredient_id
        LEFT JOIN warehouses w ON w.id = si.warehouse_id
        WHERE si.quantity < ?
      `;
      
      const params: any[] = [this.NEGATIVE_STOCK_THRESHOLD];
      
      if (warehouseId) {
        query += ' AND si.warehouse_id = ?';
        params.push(warehouseId);
      }
      
      query += ' ORDER BY si.quantity ASC';
      
      this.db.all(query, params, (err, rows: any[]) => {
        if (err) return reject(err);
        
        const errors: StockError[] = rows.map(row => ({
          errorId: `NEG-${row.ingredientId}-${row.warehouseId}-${Date.now()}`,
          errorType: 'NEGATIVE_STOCK',
          severity: 'HIGH',
          ingredientId: row.ingredientId,
          ingredientName: row.ingredientName,
          ingredientCode: row.ingredientCode,
          warehouseId: row.warehouseId,
          warehouseName: row.warehouseName,
          currentStock: row.currentStock,
          errorMessage: `Stoc negativ detectat: ${row.currentStock} ${row.unit}`,
          suggestedAction: 'Verificați mișcările de stoc și corectați cu un NIR sau ajustare de inventar.',
          detectedAt: new Date().toISOString(),
          resolved: false,
          lastMovementDate: row.lastMovementDate
        }));
        
        resolve(errors);
      });
    });
  }
  
  /**
   * Detect large variances between scriptic and fizic
   */
  private async detectLargeVariances(warehouseId?: number): Promise<StockError[]> {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          si.id as ingredientId,
          i.name as ingredientName,
          i.code as ingredientCode,
          si.warehouse_id as warehouseId,
          w.name as warehouseName,
          si.quantity as currentStock,
          inv.physical_quantity as physicalStock,
          inv.counted_at as lastInventoryDate,
          si.unit
        FROM stock_items si
        JOIN ingredients i ON i.id = si.ingredient_id
        LEFT JOIN warehouses w ON w.id = si.warehouse_id
        LEFT JOIN (
          SELECT 
            ingredient_id,
            warehouse_id,
            physical_quantity,
            counted_at,
            ROW_NUMBER() OVER (PARTITION BY ingredient_id, warehouse_id ORDER BY counted_at DESC) as rn
          FROM inventory_counts
        ) inv ON inv.ingredient_id = si.id AND inv.warehouse_id = si.warehouse_id AND inv.rn = 1
        WHERE inv.physical_quantity IS NOT NULL
          AND ABS(si.quantity - inv.physical_quantity) > 0
      `;
      
      const params: any[] = [];
      
      if (warehouseId) {
        query += ' AND si.warehouse_id = ?';
        params.push(warehouseId);
      }
      
      this.db.all(query, params, (err, rows: any[]) => {
        if (err) return reject(err);
        
        const errors: StockError[] = rows
          .map(row => {
            const variance = row.currentStock - row.physicalStock;
            const variancePercentage = row.physicalStock !== 0 
              ? Math.abs((variance / row.physicalStock) * 100) 
              : 100;
            
            let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
            if (variancePercentage >= this.VARIANCE_PERCENTAGE_HIGH) {
              severity = 'HIGH';
            } else if (variancePercentage >= this.VARIANCE_PERCENTAGE_MEDIUM) {
              severity = 'MEDIUM';
            } else {
              return null; // Skip low variances
            }
            
            return {
              errorId: `VAR-${row.ingredientId}-${row.warehouseId}-${Date.now()}`,
              errorType: 'LARGE_VARIANCE' as const,
              severity,
              ingredientId: row.ingredientId,
              ingredientName: row.ingredientName,
              ingredientCode: row.ingredientCode,
              warehouseId: row.warehouseId,
              warehouseName: row.warehouseName,
              currentStock: row.currentStock,
              physicalStock: row.physicalStock,
              variance,
              variancePercentage,
              lastInventoryDate: row.lastInventoryDate,
              errorMessage: `Varianță mare detectată: ${variance.toFixed(2)} ${row.unit} (${variancePercentage.toFixed(1)}%)`,
              suggestedAction: `Verificați consumurile și intrările. Dacă inventarul fizic este corect, faceți o ajustare de stoc.`,
              detectedAt: new Date().toISOString(),
              resolved: false
            };
          })
          .filter(e => e !== null) as StockError[];
        
        resolve(errors);
      });
    });
  }
  
  /**
   * Detect expiring or expired products
   */
  private async detectExpiringProducts(warehouseId?: number): Promise<StockError[]> {
    return new Promise((resolve, reject) => {
      const today = new Date();
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + this.DAYS_UNTIL_EXPIRY_WARNING);
      
      let query = `
        SELECT 
          si.id as ingredientId,
          i.name as ingredientName,
          i.code as ingredientCode,
          si.warehouse_id as warehouseId,
          w.name as warehouseName,
          si.quantity as currentStock,
          si.unit,
          lot.expiry_date as expiryDate
        FROM stock_items si
        JOIN ingredients i ON i.id = si.ingredient_id
        LEFT JOIN warehouses w ON w.id = si.warehouse_id
        LEFT JOIN (
          SELECT 
            ingredient_id,
            warehouse_id,
            expiry_date,
            ROW_NUMBER() OVER (PARTITION BY ingredient_id, warehouse_id ORDER BY expiry_date ASC) as rn
          FROM stock_lots
          WHERE quantity > 0
        ) lot ON lot.ingredient_id = si.id AND lot.warehouse_id = si.warehouse_id AND lot.rn = 1
        WHERE lot.expiry_date IS NOT NULL
          AND lot.expiry_date <= ?
          AND si.quantity > 0
      `;
      
      const params: any[] = [warningDate.toISOString().split('T')[0]];
      
      if (warehouseId) {
        query += ' AND si.warehouse_id = ?';
        params.push(warehouseId);
      }
      
      this.db.all(query, params, (err, rows: any[]) => {
        if (err) return reject(err);
        
        const errors: StockError[] = rows.map(row => {
          const expiryDate = new Date(row.expiryDate);
          const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          const severity = daysUntilExpiry < 0 ? 'HIGH' : daysUntilExpiry <= 3 ? 'MEDIUM' : 'LOW';
          
          let message = '';
          let action = '';
          
          if (daysUntilExpiry < 0) {
            message = `Produs expirat de ${Math.abs(daysUntilExpiry)} zile`;
            action = 'URGENT: Scoateți produsul din stoc și înregistrați ca pierdere/waste.';
          } else {
            message = `Produs expiră în ${daysUntilExpiry} zile`;
            action = `Prioritizați consumul sau vânzarea. Expiră pe ${expiryDate.toLocaleDateString('ro-RO')}.`;
          }
          
          return {
            errorId: `EXP-${row.ingredientId}-${row.warehouseId}-${Date.now()}`,
            errorType: 'EXPIRED_PRODUCT' as const,
            severity,
            ingredientId: row.ingredientId,
            ingredientName: row.ingredientName,
            ingredientCode: row.ingredientCode,
            warehouseId: row.warehouseId,
            warehouseName: row.warehouseName,
            currentStock: row.currentStock,
            expiryDate: row.expiryDate,
            errorMessage: message,
            suggestedAction: action,
            detectedAt: new Date().toISOString(),
            resolved: false
          };
        });
        
        resolve(errors);
      });
    });
  }
  
  /**
   * Detect stock without movement for a long time
   */
  private async detectStaleStock(warehouseId?: number): Promise<StockError[]> {
    return new Promise((resolve, reject) => {
      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - this.DAYS_WITHOUT_MOVEMENT_WARNING);
      
      let query = `
        SELECT 
          si.id as ingredientId,
          i.name as ingredientName,
          i.code as ingredientCode,
          si.warehouse_id as warehouseId,
          w.name as warehouseName,
          si.quantity as currentStock,
          si.unit,
          si.updated_at as lastMovementDate
        FROM stock_items si
        JOIN ingredients i ON i.id = si.ingredient_id
        LEFT JOIN warehouses w ON w.id = si.warehouse_id
        WHERE si.updated_at < ?
          AND si.quantity > 0
      `;
      
      const params: any[] = [staleDate.toISOString()];
      
      if (warehouseId) {
        query += ' AND si.warehouse_id = ?';
        params.push(warehouseId);
      }
      
      this.db.all(query, params, (err, rows: any[]) => {
        if (err) return reject(err);
        
        const errors: StockError[] = rows.map(row => {
          const lastMovement = new Date(row.lastMovementDate);
          const daysWithoutMovement = Math.floor((Date.now() - lastMovement.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            errorId: `STALE-${row.ingredientId}-${row.warehouseId}-${Date.now()}`,
            errorType: 'MISSING_MOVEMENT' as const,
            severity: 'LOW',
            ingredientId: row.ingredientId,
            ingredientName: row.ingredientName,
            ingredientCode: row.ingredientCode,
            warehouseId: row.warehouseId,
            warehouseName: row.warehouseName,
            currentStock: row.currentStock,
            lastMovementDate: row.lastMovementDate,
            errorMessage: `Nicio mișcare de stoc de ${daysWithoutMovement} zile`,
            suggestedAction: 'Verificați dacă produsul este încă utilizat. Considerați promovare sau eliminare din meniu.',
            detectedAt: new Date().toISOString(),
            resolved: false
          };
        });
        
        resolve(errors);
      });
    });
  }
  
  /**
   * Generate comprehensive reconciliation report
   */
  async generateReconciliationReport(
    warehouseId: number,
    startDate: string,
    endDate: string
  ): Promise<ReconciliationReport> {
    const errors = await this.detectStockErrors(warehouseId);
    
    // Get warehouse name
    const warehouse: any = await new Promise((resolve, reject) => {
      this.db.get('SELECT name FROM warehouses WHERE id = ?', [warehouseId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
    
    // Count errors by type and severity
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    
    errors.forEach(error => {
      errorsByType[error.errorType] = (errorsByType[error.errorType] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });
    
    // Calculate total variance value (placeholder - would need pricing data)
    const totalVarianceValue = 0;
    const totalVariancePercentage = 0;
    
    return {
      reportId: `RECON-${warehouseId}-${Date.now()}`,
      warehouseId,
      warehouseName: warehouse?.name || 'Unknown',
      startDate,
      endDate,
      generatedAt: new Date().toISOString(),
      totalIngredients: 0, // Would need to query total ingredients
      ingredientsWithErrors: new Set(errors.map(e => e.ingredientId)).size,
      totalErrors: errors.length,
      errorsByType,
      errorsBySeverity,
      errors,
      totalVarianceValue,
      totalVariancePercentage
    };
  }
  
  /**
   * Resolve a stock error
   */
  async resolveError(
    errorId: string,
    userId: number,
    userName: string,
    notes: string
  ): Promise<void> {
    // In a real implementation, would store error resolutions in database
    // For now, this is a placeholder
    console.log(`Resolved error ${errorId} by ${userName}: ${notes}`);
  }
  
  /**
   * Get stock movement audit trail for an ingredient
   */
  async getMovementAudit(
    ingredientId: number,
    warehouseId: number,
    startDate?: string,
    endDate?: string
  ): Promise<StockMovementAudit[]> {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          sm.id as movementId,
          sm.ingredient_id as ingredientId,
          i.name as ingredientName,
          sm.warehouse_id as warehouseId,
          sm.movement_type as movementType,
          sm.quantity,
          sm.unit,
          sm.document_type as documentType,
          sm.document_number as documentNumber,
          sm.movement_date as movementDate,
          sm.created_by_user_id as createdByUserId,
          u.name as createdByName,
          sm.notes
        FROM stock_movements sm
        JOIN ingredients i ON i.id = sm.ingredient_id
        LEFT JOIN users u ON u.id = sm.created_by_user_id
        WHERE sm.ingredient_id = ? AND sm.warehouse_id = ?
      `;
      
      const params: any[] = [ingredientId, warehouseId];
      
      if (startDate) {
        query += ' AND sm.movement_date >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND sm.movement_date <= ?';
        params.push(endDate);
      }
      
      query += ' ORDER BY sm.movement_date DESC, sm.id DESC';
      
      this.db.all(query, params, (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows as StockMovementAudit[]);
      });
    });
  }
}

const dbPromise = require('../../database');

/**
 * Equipment Calibration Service
 * Manages calibration schedules and records for HACCP equipment
 */
class CalibrationService {
    /**
     * Schedule calibration for equipment
     * @param {Object} calibrationData - Calibration schedule data
     * @returns {Promise<number>} Calibration schedule ID
     */
    static async scheduleCalibration(calibrationData) {
        const {
            equipmentId,
            calibrationType, // 'temperature', 'weight', 'pressure', 'time'
            frequency, // 'daily', 'weekly', 'monthly', 'quarterly', 'annually'
            nextDueDate,
            assignedTo,
            criticalEquipment = false
        } = calibrationData;

        const db = await dbPromise;

        const scheduleId = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO equipment_calibration_schedule (
                    equipment_id, calibration_type, frequency, next_due_date,
                    assigned_to, critical_equipment, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'scheduled', datetime('now'))`,
                [equipmentId, calibrationType, frequency, nextDueDate, assignedTo, criticalEquipment ? 1 : 0],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        console.log(`📅 [CALIBRATION] Scheduled ${calibrationType} calibration for equipment ${equipmentId}`);

        return scheduleId;
    }

    /**
     * Record calibration result
     * @param {Object} calibrationData - Calibration result data
     * @returns {Promise<number>} Calibration record ID
     */
    static async recordCalibration(calibrationData) {
        const {
            equipmentId,
            calibrationType,
            performedBy,
            referenceValue,
            measuredValue,
            deviation,
            withinTolerance,
            adjustmentMade = false,
            adjustmentDetails = null,
            certificateNumber = null,
            notes = null
        } = calibrationData;

        const db = await dbPromise;

        const recordId = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO equipment_calibration_records (
                    equipment_id, calibration_type, performed_by, performed_at,
                    reference_value, measured_value, deviation, within_tolerance,
                    adjustment_made, adjustment_details, certificate_number, notes
                ) VALUES (?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?)`,
                [equipmentId, calibrationType, performedBy, referenceValue, measuredValue,
                    deviation, withinTolerance ? 1 : 0, adjustmentMade ? 1 : 0,
                    adjustmentDetails, certificateNumber, notes],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        // Update equipment status
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE compliance_equipment 
                 SET last_calibration = datetime('now'),
                     calibration_status = ?
                 WHERE id = ?`,
                [withinTolerance ? 'valid' : 'out_of_tolerance', equipmentId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Update schedule
        await this.updateCalibrationSchedule(equipmentId, calibrationType);

        // Alert if out of tolerance
        if (!withinTolerance) {
            console.warn(`⚠️ [CALIBRATION] Equipment ${equipmentId} OUT OF TOLERANCE! Deviation: ${deviation}`);
            await this.createCalibrationAlert(equipmentId, calibrationType, deviation);
        } else {
            console.log(`✅ [CALIBRATION] Equipment ${equipmentId} calibrated successfully`);
        }

        return recordId;
    }

    /**
     * Update calibration schedule after calibration
     * @param {number} equipmentId - Equipment ID
     * @param {string} calibrationType - Calibration type
     * @returns {Promise<void>}
     */
    static async updateCalibrationSchedule(equipmentId, calibrationType) {
        const db = await dbPromise;

        // Get current schedule
        const schedule = await new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM equipment_calibration_schedule 
                 WHERE equipment_id = ? AND calibration_type = ? AND status = 'scheduled'`,
                [equipmentId, calibrationType],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!schedule) return;

        // Calculate next due date based on frequency
        const frequencyDays = {
            'daily': 1,
            'weekly': 7,
            'monthly': 30,
            'quarterly': 90,
            'annually': 365
        };

        const days = frequencyDays[schedule.frequency] || 30;
        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + days);

        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE equipment_calibration_schedule 
                 SET next_due_date = ?, last_completed = datetime('now')
                 WHERE id = ?`,
                [nextDueDate.toISOString(), schedule.id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    /**
     * Create calibration alert
     * @param {number} equipmentId - Equipment ID
     * @param {string} calibrationType - Calibration type
     * @param {number} deviation - Deviation value
     * @returns {Promise<void>}
     */
    static async createCalibrationAlert(equipmentId, calibrationType, deviation) {
        const db = await dbPromise;

        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO calibration_alerts (
                    equipment_id, calibration_type, deviation, severity, 
                    created_at, status
                ) VALUES (?, ?, ?, ?, datetime('now'), 'active')`,
                [equipmentId, calibrationType, deviation,
                    Math.abs(deviation) > 2 ? 'critical' : 'warning'],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    /**
     * Get overdue calibrations
     * @returns {Promise<Array>} Overdue calibrations
     */
    static async getOverdueCalibrations() {
        const db = await dbPromise;

        return new Promise((resolve, reject) => {
            db.all(
                `SELECT s.*, e.name as equipment_name, e.location
                 FROM equipment_calibration_schedule s
                 JOIN compliance_equipment e ON s.equipment_id = e.id
                 WHERE s.status = 'scheduled' 
                 AND date(s.next_due_date) <= date('now')
                 ORDER BY s.critical_equipment DESC, s.next_due_date ASC`,
                [],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });
    }

    /**
     * Get calibration history for equipment
     * @param {number} equipmentId - Equipment ID
     * @param {number} limit - Number of records to return
     * @returns {Promise<Array>} Calibration history
     */
    static async getCalibrationHistory(equipmentId, limit = 10) {
        const db = await dbPromise;

        return new Promise((resolve, reject) => {
            db.all(
                `SELECT r.*, u.username as performed_by_name
                 FROM equipment_calibration_records r
                 LEFT JOIN users u ON r.performed_by = u.id
                 WHERE r.equipment_id = ?
                 ORDER BY r.performed_at DESC
                 LIMIT ?`,
                [equipmentId, limit],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });
    }

    /**
     * Generate calibration certificate
     * @param {number} recordId - Calibration record ID
     * @returns {Promise<Object>} Certificate data
     */
    static async generateCertificate(recordId) {
        const db = await dbPromise;

        const record = await new Promise((resolve, reject) => {
            db.get(
                `SELECT r.*, e.name as equipment_name, e.serial_number, e.manufacturer,
                        u.username as performed_by_name
                 FROM equipment_calibration_records r
                 JOIN compliance_equipment e ON r.equipment_id = e.id
                 LEFT JOIN users u ON r.performed_by = u.id
                 WHERE r.id = ?`,
                [recordId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!record) {
            throw new Error(`Calibration record #${recordId} not found`);
        }

        const certificate = {
            certificateNumber: record.certificate_number || `CAL-${Date.now()}`,
            equipmentName: record.equipment_name,
            serialNumber: record.serial_number,
            manufacturer: record.manufacturer,
            calibrationType: record.calibration_type,
            calibrationDate: record.performed_at,
            performedBy: record.performed_by_name,
            referenceValue: record.reference_value,
            measuredValue: record.measured_value,
            deviation: record.deviation,
            withinTolerance: record.within_tolerance === 1,
            adjustmentMade: record.adjustment_made === 1,
            adjustmentDetails: record.adjustment_details,
            validUntil: this.calculateValidUntil(record.performed_at, 'monthly'),
            notes: record.notes
        };

        return certificate;
    }

    /**
     * Calculate valid until date
     * @param {string} calibrationDate - Calibration date
     * @param {string} frequency - Calibration frequency
     * @returns {string} Valid until date
     */
    static calculateValidUntil(calibrationDate, frequency) {
        const date = new Date(calibrationDate);
        const frequencyDays = {
            'daily': 1,
            'weekly': 7,
            'monthly': 30,
            'quarterly': 90,
            'annually': 365
        };

        const days = frequencyDays[frequency] || 30;
        date.setDate(date.getDate() + days);

        return date.toISOString();
    }

    /**
     * Test calibration procedure
     * @param {number} equipmentId - Equipment ID to test
     * @returns {Promise<Object>} Test results
     */
    static async testCalibrationProcedure(equipmentId) {
        console.log(`🧪 [CALIBRATION TEST] Starting calibration test for equipment ${equipmentId}`);

        const startTime = Date.now();

        // Record test calibration
        const recordId = await this.recordCalibration({
            equipmentId,
            calibrationType: 'temperature',
            performedBy: 1,
            referenceValue: 4.0,
            measuredValue: 4.1,
            deviation: 0.1,
            withinTolerance: true,
            adjustmentMade: false,
            certificateNumber: `TEST-${Date.now()}`,
            notes: 'Automated calibration test'
        });

        // Generate certificate
        const certificate = await this.generateCertificate(recordId);

        const totalTime = Date.now() - startTime;

        console.log(`✅ [CALIBRATION TEST] Test completed in ${totalTime}ms`);

        return {
            success: true,
            recordId,
            certificate,
            totalTimeMs: totalTime,
            performance: totalTime < 1000 ? 'EXCELLENT' : totalTime < 3000 ? 'GOOD' : 'NEEDS IMPROVEMENT'
        };
    }
}

module.exports = CalibrationService;

/**
 * FAZA MT.6 - Branding Controller
 * 
 * Handles CRUD operations for tenant_branding.
 */

const { dbPromise } = require('../../../database');

/**
 * GET /api/config/branding
 * Get branding config for current tenant
 */
async function getBranding(req, res, next) {
  try {
    const tenantId = req.tenantId || 1; // Fallback to default tenant
    const db = await dbPromise;
    
    const branding = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM tenant_branding WHERE tenant_id = ?`,
        [tenantId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!branding) {
      // Return default branding
      const defaultColors = { primary: '#3B82F6', secondary: '#10B981' };
      return res.json({
        success: true,
        branding: {
          tenant_id: tenantId,
          brand_name: 'Restaurant App',
          logo_url: null,
          favicon_url: null,
          colors: defaultColors,
          font_family: 'Inter, sans-serif',
          font_size_base: '16px',
          layout_type: 'default',
          custom_css: null,
        },
      });
    }
    
    // Parse colors JSON if it's a string
    let colors = {};
    if (branding.colors) {
      try {
        colors = typeof branding.colors === 'string' ? JSON.parse(branding.colors) : branding.colors;
      } catch (e) {
        colors = {};
      }
    }
    
    res.json({
      success: true,
      branding: {
        ...branding,
        colors,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/config/branding
 * Update branding config
 */
async function updateBranding(req, res, next) {
  try {
    const tenantId = req.tenantId || 1;
    const {
      brand_name,
      logo_url,
      favicon_url,
      primary_color, // For backward compatibility
      secondary_color, // For backward compatibility
      font_family,
      font_size_base,
      layout_type,
      custom_css,
      colors, // Preferred: JSON object with primary, secondary, etc.
    } = req.body;
    
    const db = await dbPromise;
    
    // Check if branding exists
    const existing = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM tenant_branding WHERE tenant_id = ?', [tenantId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Build colors JSON from either colors object or individual color fields
    let colorsJson;
    if (colors) {
      colorsJson = JSON.stringify(colors);
    } else if (primary_color || secondary_color) {
      colorsJson = JSON.stringify({
        primary: primary_color || '#3B82F6',
        secondary: secondary_color || '#10B981',
      });
    } else {
      colorsJson = JSON.stringify({ primary: '#3B82F6', secondary: '#10B981' });
    }
    
    if (existing) {
      // Update
      const updates = [];
      const params = [];
      
      if (brand_name !== undefined) {
        updates.push('brand_name = ?');
        params.push(brand_name);
      }
      if (logo_url !== undefined) {
        updates.push('logo_url = ?');
        params.push(logo_url);
      }
      if (favicon_url !== undefined) {
        updates.push('favicon_url = ?');
        params.push(favicon_url);
      }
      // Note: primary_color and secondary_color are stored in colors JSON, not as separate columns
      if (font_family !== undefined) {
        updates.push('font_family = ?');
        params.push(font_family);
      }
      if (font_size_base !== undefined) {
        updates.push('font_size_base = ?');
        params.push(font_size_base);
      }
      if (layout_type !== undefined) {
        updates.push('layout_type = ?');
        params.push(layout_type);
      }
      if (custom_css !== undefined) {
        updates.push('custom_css = ?');
        params.push(custom_css);
      }
      if (colors !== undefined) {
        updates.push('colors = ?');
        params.push(colorsJson);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updates.push('updated_at = datetime(\'now\')');
      params.push(tenantId);
      
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE tenant_branding SET ${updates.join(', ')} WHERE tenant_id = ?`,
          params,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    } else {
      // Create
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO tenant_branding 
           (tenant_id, brand_name, logo_url, favicon_url, primary_color, secondary_color, 
            font_family, font_size_base, layout_type, custom_css, colors, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            tenantId,
          brand_name || 'Restaurant App',
          logo_url || null,
          favicon_url || null,
          font_family || 'Inter, sans-serif',
            font_size_base || '16px',
            layout_type || 'default',
            custom_css || null,
            colorsJson,
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    // Return updated branding
    const branding = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM tenant_branding WHERE tenant_id = ?', [tenantId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    let parsedColors = {};
    if (branding?.colors) {
      try {
        parsedColors = typeof branding.colors === 'string' ? JSON.parse(branding.colors) : branding.colors;
      } catch (e) {
        parsedColors = {};
      }
    }
    
    res.json({
      success: true,
      branding: {
        ...branding,
        colors: parsedColors,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/config/branding/upload-logo
 * Upload logo file (handled by multer middleware)
 */
async function uploadLogo(req, res, next) {
  try {
    // This would be handled by multer middleware
    // For now, return the file URL
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    res.json({ success: true, logo_url: fileUrl });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBranding,
  updateBranding,
  uploadLogo,
};


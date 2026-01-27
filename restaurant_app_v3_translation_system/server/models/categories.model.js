// Categories Model
// Purpose: Product category management (hierarchical)
// Created: 21 Oct 2025, 21:35
// Part of: BATCH #9 - Categories Module

const BaseModel = require('./base.model');

class CategoriesModel extends BaseModel {
    constructor() {
        super('product_categories');
    }

    async findActive() {
        return await this.findAll({ is_active: 1 }, { orderBy: 'sort_order' });
    }

    async findByName(name) {
        return await this.findOne({ name });
    }

    async findRootCategories() {
        return await this.findAll(
            { parent_id: null, is_active: 1 },
            { orderBy: 'sort_order' }
        );
    }

    async findChildren(parentId) {
        return await this.findAll(
            { parent_id: parentId, is_active: 1 },
            { orderBy: 'sort_order' }
        );
    }

    async nameExists(name, excludeId = null) {
        const existing = await this.findByName(name);
        if (!existing) return false;
        if (excludeId && existing.id === excludeId) return false;
        return true;
    }

    async createCategory(data) {
        if (await this.nameExists(data.name)) {
            throw new Error(`Category with name "${data.name}" already exists`);
        }

        // If parent_id specified, verify parent exists
        if (data.parent_id) {
            const parent = await this.findById(data.parent_id);
            if (!parent) {
                throw new Error(`Parent category with ID ${data.parent_id} not found`);
            }
        }

        const categoryData = {
            name: data.name,
            name_en: data.name_en || null,
            parent_id: data.parent_id || null,
            icon: data.icon || null,
            sort_order: data.sort_order || 0,
            is_active: data.is_active !== undefined ? data.is_active : 1,
            created_at: new Date().toISOString()
        };

        return await this.create(categoryData);
    }

    async updateCategory(id, data) {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error(`Category with ID ${id} not found`);
        }

        if (data.name && data.name !== existing.name) {
            if (await this.nameExists(data.name, id)) {
                throw new Error(`Category with name "${data.name}" already exists`);
            }
        }

        if (data.parent_id) {
            if (data.parent_id === id) {
                throw new Error('Category cannot be its own parent');
            }

            const parent = await this.findById(data.parent_id);
            if (!parent) {
                throw new Error(`Parent category with ID ${data.parent_id} not found`);
            }

            // Check for circular reference
            if (await this.wouldCreateCircularReference(id, data.parent_id)) {
                throw new Error('This would create a circular reference in the category hierarchy');
            }
        }

        return await this.update(id, data);
    }

    async wouldCreateCircularReference(categoryId, newParentId) {
        let currentParentId = newParentId;
        const visited = new Set();

        while (currentParentId) {
            if (currentParentId === categoryId) {
                return true;
            }

            if (visited.has(currentParentId)) {
                return true; // Already visited, infinite loop
            }

            visited.add(currentParentId);
            const parent = await this.findById(currentParentId);
            currentParentId = parent ? parent.parent_id : null;
        }

        return false;
    }

    async getTree() {
        const allCategories = await this.findActive();
        const tree = [];

        // Build tree structure
        const buildTree = (parentId = null) => {
            return allCategories
                .filter(cat => cat.parent_id === parentId)
                .map(cat => ({
                    ...cat,
                    children: buildTree(cat.id)
                }));
        };

        return buildTree();
    }

    async getStatistics() {
        const all = await this.findAll();
        const active = all.filter(c => c.is_active === 1);
        const roots = all.filter(c => c.parent_id === null);
        
        return {
            total: all.length,
            active: active.length,
            inactive: all.length - active.length,
            root_categories: roots.length
        };
    }

    async getWithProductCounts() {
        const db = require('../config/database');
        return await db.all(`
            SELECT 
                c.*,
                COUNT(p.id) as product_count
            FROM product_categories c
            LEFT JOIN products p ON p.category_id = c.id AND p.is_available = 1
            WHERE c.is_active = 1
            GROUP BY c.id
            ORDER BY c.sort_order, c.name
        `);
    }
}

module.exports = new CategoriesModel();


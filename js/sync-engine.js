/**
 * Howayda CMS - Static Data Engine
 * Reads published catalog content from data/catalog.json and keeps local drafts in localStorage.
 */

const SyncEngine = {
    config: {
        get apiBase() {
            return '';
        }
    },

    async safeParseJson(response) {
        try {
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        } catch (e) {
            console.error('JSON parse error:', e);
            return null;
        }
    },

    async fetchCatalogFile() {
        const cacheBuster = `t=${Date.now()}`;
        const res = await fetch(`data/catalog.json?${cacheBuster}`);
        if (!res.ok) throw new Error(`catalog.json error: ${res.status}`);
        const data = await this.safeParseJson(res);
        if (!data) return {};
        return Array.isArray(data) ? { products: data } : data;
    },

    async fetchItems(category = 'products') {
        const cacheBuster = `t=${Date.now()}`;

        try {
            const catalog = await this.fetchCatalogFile();
            if (Array.isArray(catalog[category])) {
                const items = catalog[category];
                this.cacheItems(category, items);
                return items;
            }
        } catch (err) {
            console.warn(`Static catalog fetch failed for ${category}:`, err.message);
        }

        return JSON.parse(localStorage.getItem(`howayda_${category}`) || localStorage.getItem(category) || '[]');
    },

    cacheItems(category, items) {
        localStorage.setItem(`howayda_${category}`, JSON.stringify(items));
        if (category === 'products') localStorage.setItem('products', JSON.stringify(items));
    },

    async fetchProducts() {
        const products = await this.fetchItems('products');
        return { products, sha: null };
    },

    async saveItem(category, item) {
        const key = category === 'products' ? 'products' : `howayda_${category}`;
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = items.findIndex(existing => existing.id === item.id);
        if (idx >= 0) items[idx] = item;
        else items.unshift(item);
        this.cacheItems(category, items);
        if (category !== 'products') localStorage.setItem(key, JSON.stringify(items));
        return item;
    },

    async deleteItem(category, itemId) {
        const key = category === 'products' ? 'products' : `howayda_${category}`;
        const items = JSON.parse(localStorage.getItem(key) || '[]').filter(item => item.id !== itemId);
        this.cacheItems(category, items);
        if (category !== 'products') localStorage.setItem(key, JSON.stringify(items));
        return { ok: true };
    },

    async commitProducts(products, action = 'update', singleProduct = null) {
        if (singleProduct) {
            if (action === 'delete') return await this.deleteItem('products', singleProduct.id);
            return await this.saveItem('products', singleProduct);
        }
        this.cacheItems('products', Array.isArray(products) ? products : []);
        return { ok: true };
    }
};

window.SyncEngine = SyncEngine;
window.safeParseJson = SyncEngine.safeParseJson.bind(SyncEngine);

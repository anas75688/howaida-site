/**
 * Antigravity Dynamic Configuration
 * Handles environment-specific settings (Development vs. Production)
 */

const CONFIG = {
    // Detect if we are running on localhost, 127.0.0.1, or local file system
    get isLocal() {
        return window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:';
    },

    // Static-site compatibility. Kept so older admin code can read CONFIG.API_BASE_URL.
    get API_BASE_URL() {
        return '';
    },

    // Storage Keys
    STORAGE_KEYS: {
        PRODUCTS: 'products',
        COLLECTIONS: 'howayda_collections',
        TESTIMONIALS: 'howayda_testimonials',
        FEATURED: 'howayda_featured'
    }
};

// Log configuration status
console.log(`🚀 Running in ${CONFIG.isLocal ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
console.log(`📡 API Base URL: ${CONFIG.API_BASE_URL}`);

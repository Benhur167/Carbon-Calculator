/**
 * API base URL — shared by app.js, api-warmup.js, export.js.
 * Local dev: http://127.0.0.1:5000/api when opened from localhost.
 * Override: ?api=http://127.0.0.1:5000/api or localStorage carbonApiBase
 */
(function (global) {
    const RENDER_API = 'https://carboncalculator-2eak.onrender.com/api';

    function normalizeApiBase(raw) {
        if (!raw) return '';
        let s = String(raw).trim().replace(/\/+$/, '');
        if (!/\/api$/i.test(s)) {
            s += '/api';
        }
        return s;
    }

    function resolveApiBaseUrl() {
        if (global.__CARBON_API_BASE__) {
            return normalizeApiBase(global.__CARBON_API_BASE__);
        }
        try {
            const qs = new URLSearchParams(global.location.search || '');
            const fromQuery = qs.get('api');
            if (fromQuery) {
                const normalized = normalizeApiBase(fromQuery);
                global.localStorage.setItem('carbonApiBase', normalized);
                return normalized;
            }
        } catch (_e) {
            /* ignore */
        }
        try {
            const stored = global.localStorage.getItem('carbonApiBase');
            if (stored) return normalizeApiBase(stored);
        } catch (_e2) {
            /* ignore */
        }
        const host = (global.location && global.location.hostname) || '';
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'http://127.0.0.1:5000/api';
        }
        return RENDER_API;
    }

    function getApiRootUrl() {
        return resolveApiBaseUrl().replace(/\/api\/?$/i, '') + '/';
    }

    global.resolveApiBaseUrl = resolveApiBaseUrl;
    global.getApiRootUrl = getApiRootUrl;
    global.CARBON_RENDER_API_BASE = RENDER_API;
})(typeof window !== 'undefined' ? window : globalThis);

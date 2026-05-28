/**
 * Wake the API as soon as the login page loads (Render cold start).
 */
(function (global) {
    const getRoot = () =>
        typeof global.getApiRootUrl === 'function'
            ? global.getApiRootUrl()
            : 'https://carboncalculator-2eak.onrender.com/';

    let lastPingAt = 0;
    const MIN_PING_INTERVAL_MS = 8000;

    function pingBackend() {
        const now = Date.now();
        if (now - lastPingAt < MIN_PING_INTERVAL_MS) {
            return;
        }
        lastPingAt = now;
        fetch(getRoot(), { method: 'GET', mode: 'cors', cache: 'no-store' }).catch(function () {});
    }

    function bindLoginFieldWarmup() {
        const fields = ['loginEmail', 'loginPassword'];
        let inputTimer = null;

        function onInputActivity() {
            clearTimeout(inputTimer);
            inputTimer = setTimeout(pingBackend, 350);
        }

        fields.forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('focus', pingBackend);
            el.addEventListener('input', onInputActivity);
        });
    }

    global.wakeRenderBackend = pingBackend;

    pingBackend();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindLoginFieldWarmup);
    } else {
        bindLoginFieldWarmup();
    }
})(typeof window !== 'undefined' ? window : globalThis);

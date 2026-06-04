/**
 * In-app dialogs titled "Notification" (replaces browser alert/confirm/prompt).
 */
(function (global) {
    const DIALOG_TITLE = 'Notification';

    let dialogQueue = Promise.resolve();

    function enqueue(task) {
        const run = dialogQueue.then(task);
        dialogQueue = run.catch(() => {});
        return run;
    }

    function isPortuguese() {
        return global.appState?.currentLanguage === 'pt';
    }

    function labelCancel() {
        return isPortuguese() ? 'Cancelar' : 'Cancel';
    }

    /**
     * @param {string} message
     * @param {{ confirm?: boolean, input?: string, password?: boolean }} mode
     * @returns {Promise<boolean|void|string|null>}
     */
    function openAppDialog(message, mode = {}) {
        return enqueue(() => new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'app-dialog-overlay widget-modal';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'appDialogTitle');

            const hasInput = Object.prototype.hasOwnProperty.call(mode, 'input');
            const isConfirm = !!mode.confirm;
            const inputType = mode.password ? 'password' : 'text';
            const inputHtml = hasInput
                ? `<input type="${inputType}" class="app-dialog-input" autocomplete="off" />`
                : '';

            overlay.innerHTML = `
                <div class="widget-modal-content app-dialog-content">
                    <div class="widget-modal-header">
                        <h3 id="appDialogTitle">${DIALOG_TITLE}</h3>
                    </div>
                    <div class="widget-modal-body">
                        <p class="app-dialog-message"></p>
                        ${inputHtml}
                    </div>
                    <div class="widget-modal-footer">
                        ${isConfirm || hasInput ? `<button type="button" class="btn-secondary app-dialog-cancel">${labelCancel()}</button>` : ''}
                        <button type="button" class="btn-primary app-dialog-ok">OK</button>
                    </div>
                </div>`;

            overlay.querySelector('.app-dialog-message').textContent = String(message ?? '');

            const inputEl = overlay.querySelector('.app-dialog-input');
            if (inputEl) {
                inputEl.value = String(mode.input ?? '');
            }

            const finish = (value) => {
                document.removeEventListener('keydown', onKeydown);
                overlay.remove();
                resolve(value);
            };

            const onKeydown = (e) => {
                if (!document.body.contains(overlay)) return;
                if (e.key === 'Escape') {
                    if (isConfirm) finish(false);
                    else if (hasInput) finish(null);
                    else finish();
                } else if (e.key === 'Enter') {
                    if (hasInput) {
                        e.preventDefault();
                        finish(inputEl ? inputEl.value : '');
                    } else if (!isConfirm) {
                        finish();
                    } else {
                        finish(true);
                    }
                }
            };

            overlay.querySelector('.app-dialog-ok')?.addEventListener('click', () => {
                if (isConfirm) finish(true);
                else if (hasInput) finish(inputEl ? inputEl.value : '');
                else finish();
            });

            overlay.querySelector('.app-dialog-cancel')?.addEventListener('click', () => {
                if (isConfirm) finish(false);
                else if (hasInput) finish(null);
            });

            overlay.addEventListener('click', (e) => {
                if (e.target !== overlay) return;
                if (isConfirm) finish(false);
                else if (hasInput) finish(null);
            });

            document.addEventListener('keydown', onKeydown);
            document.body.appendChild(overlay);

            if (inputEl) {
                setTimeout(() => {
                    inputEl.focus();
                    inputEl.select();
                }, 0);
            } else {
                overlay.querySelector('.app-dialog-ok')?.focus();
            }
        }));
    }

    function showAppAlert(message) {
        return openAppDialog(message);
    }

    function showAppConfirm(message) {
        return openAppDialog(message, { confirm: true });
    }

    function showAppPrompt(message, defaultValue = '') {
        return openAppDialog(message, { input: defaultValue });
    }

    function showAppPasswordPrompt(message) {
        return openAppDialog(message, { input: '', password: true });
    }

    global.showAppAlert = showAppAlert;
    global.showAppConfirm = showAppConfirm;
    global.showAppPrompt = showAppPrompt;
    global.showAppPasswordPrompt = showAppPasswordPrompt;

    global.alert = function (message) {
        showAppAlert(message);
    };
}(typeof window !== 'undefined' ? window : global));

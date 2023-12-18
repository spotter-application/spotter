const { invoke } = window.__TAURI__.tauri;
const globalShortcut = window.__TAURI__.globalShortcut;

async function registerShortcut() {
  try {
    await globalShortcut.register('Control+Cmd+Space', () => {
      log('Global hotkey activated!');
      invoke("show_app");
      // Add the action you want to perform
    });
    log('Global hotkey registered!');
  } catch (e) {
    log('Failed to register global hotkey:', e);
  }
}

registerShortcut();

async function hideApp() {
  await invoke("hide_app");
}

function log(message) {
    invoke('log_message', { message: message });
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("test123");
  log("test")
  document.querySelector("#query-input").addEventListener("keydown", (e) => {
    log(e.key);
    if (e.key !== "Escape") {
      return;
    }

    e.preventDefault();
    hideApp();
  });
});


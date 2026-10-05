window.pointers = window.pointers || {};
window.pointers.run = window.pointers.run instanceof Set ? window.pointers.run : new Set();
window.pointers.cache = window.pointers.cache instanceof Map ? window.pointers.cache : new Map();
window.pointers.status = window.pointers.status || '';
window.pointers.record = (element, name, value) => {
  window.pointers.cache.set(element, { name, value });
};
window.pointers.inject = code => chrome.runtime.sendMessage({ method: 'inject-unprotected', code });

const setEnabled = enabled => {
  if ((window.pointers.status === 'ready') === enabled) {
    return;
  }

  if (enabled) {
    window.pointers.status = 'ready';
    for (const script of document.querySelectorAll('script.arclck')) {
      script.dispatchEvent(new Event('install'));
    }
    chrome.runtime.sendMessage({
      method: 'inject',
      files: ['user-select.js', 'styles.js', 'mouse.js', 'listen.js']
    });
    return;
  }

  window.pointers.status = 'removed';
  for (const cleanup of window.pointers.run) {
    cleanup();
  }
  window.pointers.run = new Set();
  for (const script of document.querySelectorAll('script.arclck')) {
    script.dispatchEvent(new Event('remove'));
  }
  for (const [element, { name, value }] of window.pointers.cache) {
    element.style[name] = value;
  }
  window.pointers.cache = new Map();
};

const target = window.__rightClickEnableTarget;
delete window.__rightClickEnableTarget;
setEnabled(typeof target === 'boolean' ? target : window.pointers.status !== 'ready');

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');
  const notify = message => {
    clearTimeout(notify.id);
    toast.textContent = message;
    notify.id = setTimeout(() => {
      toast.textContent = '';
    }, 2000);
  };

  chrome.storage.local.get({ hostnames: [] }, prefs => {
    document.getElementById('whitelist').value = prefs.hostnames.join(', ');
  });

  document.getElementById('save').addEventListener('click', () => {
    const hostnames = document.getElementById('whitelist').value
      .split(/\s*,\s*/)
      .map(hostname => {
        hostname = hostname.trim();
        if (hostname && hostname.startsWith('http')) {
          try {
            return new URL(hostname).origin;
          } catch (error) {
            console.error(error);
            return '';
          }
        }
        return hostname;
      })
      .filter((hostname, index, list) => hostname && list.indexOf(hostname) === index);
    chrome.storage.local.set({ monitor: hostnames.length > 0, hostnames });
    document.getElementById('whitelist').value = hostnames.join(', ');
    notify('Options saved');
  });

  document.getElementById('reset').addEventListener('click', event => {
    if (event.detail === 1) {
      notify('Double-click to reset!');
    } else {
      localStorage.clear();
      chrome.storage.local.clear(() => {
        chrome.permissions.remove({ origins: ['http://*/*', 'https://*/*'] }, () => {
          chrome.runtime.reload();
          window.close();
        });
      });
    }
  });

  const check = () => chrome.permissions.contains(
    { origins: ['http://*/*', 'https://*/*'] },
    granted => {
      const whitelist = document.getElementById('whitelist');
      if (whitelist) {
        whitelist.disabled = granted === false;
      }
    }
  );
  check();

  document.getElementById('subframe').onclick = () => {
    chrome.permissions.request({ origins: ['http://*/*', 'https://*/*'] }, granted => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        notify(lastError.message);
      } else {
        notify(granted ? 'Permission granted' : 'Permission denied');
      }
      check();
    });
  };

  document.getElementById('no-subframe').onclick = () => {
    chrome.permissions.remove({ origins: ['http://*/*', 'https://*/*'] }, granted => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        notify(lastError.message);
      } else {
        notify('Permission removed');
      }
      check();
    });
  };

  for (const anchor of document.querySelectorAll('[data-href]')) {
    if (!anchor.hasAttribute('href')) {
      anchor.href = chrome.runtime.getManifest().homepage_url + '#' + anchor.dataset.href;
    }
  }

  if (!chrome.runtime.getManifest().update_url) {
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
      debugPanel.style.display = 'block';
      initDebugPanel();
    }
  }
});

function initDebugPanel() {
  const log = (message, type = 'info') => {
    const logDiv = document.getElementById('debug-logs');
    const logContent = document.getElementById('debug-log-content');
    if (!logDiv || !logContent) return;
    logDiv.style.display = 'block';
    const logEntry = document.createElement('div');
    logEntry.className = `debug-log ${type}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContent.appendChild(logEntry);
    logContent.scrollTop = logContent.scrollHeight;
    if (logContent.children.length > 20) {
      logContent.removeChild(logContent.firstChild);
    }
  };

  const loadStorageData = () => chrome.storage.local.get(null, data => {
    const storageDiv = document.getElementById('debug-storage');
    const keySelect = document.getElementById('debug-key-select');
    if (!storageDiv || !keySelect) return;
    storageDiv.textContent = JSON.stringify(data, null, 2);
    keySelect.innerHTML = '<option value="">Выберите ключ...</option>';
    Object.keys(data).forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = key;
      keySelect.appendChild(option);
    });
  });

  document.getElementById('debug-key-select').addEventListener('change', event => {
    const key = event.target.value;
    const editValue = document.getElementById('debug-edit-value');
    if (!key) {
      editValue.value = '';
      return;
    }
    chrome.storage.local.get(key, data => {
      editValue.value = Object.prototype.hasOwnProperty.call(data, key)
        ? JSON.stringify(data[key], null, 2)
        : '';
    });
  });

  document.getElementById('debug-export-data').addEventListener('click', () => {
    chrome.storage.local.get(null, data => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `rightclick-enable-backup-${Date.now()}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      log('Данные экспортированы', 'success');
    });
  });

  document.getElementById('debug-clear-all').addEventListener('click', () => {
    if (confirm('⚠️ ВНИМАНИЕ!\n\nВы собираетесь удалить ВСЕ настройки расширения.\n\nЭто действие невозможно отменить!\n\nПродолжить?')) {
      chrome.storage.local.get(['hostnames', 'monitor'], saved => {
        chrome.storage.local.clear(() => {
          chrome.storage.local.set({
            hostnames: saved.hostnames || [],
            monitor: saved.monitor || false,
            popupShowCount: 0,
            hasVoted: false
          }, () => {
            log('✅ ВСЕ НАСТРОЙКИ СБРОШЕНЫ! Расширение перезагружено', 'success');
            setTimeout(() => {
              chrome.runtime.reload();
              window.location.reload();
            }, 1000);
          });
        });
      });
    }
  });

  document.getElementById('debug-delete-key').addEventListener('click', () => {
    const key = document.getElementById('debug-key-select').value;
    if (key && confirm(`Удалить ключ "${key}"?`)) {
      chrome.storage.local.remove(key, () => {
        log(`Ключ "${key}" удален`, 'success');
        loadStorageData();
      });
    }
  });

  document.getElementById('debug-save-value').addEventListener('click', () => {
    const key = document.getElementById('debug-key-select').value;
    const valueText = document.getElementById('debug-edit-value').value;
    if (!key) {
      alert('Выберите ключ для редактирования');
      return;
    }
    try {
      const value = valueText.trim() ? JSON.parse(valueText) : null;
      chrome.storage.local.set({ [key]: value }, () => {
        log(`Ключ "${key}" обновлен`, 'success');
        loadStorageData();
      });
    } catch (error) {
      alert(`Ошибка парсинга JSON: ${error.message}`);
      log(`Ошибка JSON: ${error.message}`, 'error');
    }
  });

  document.getElementById('debug-refresh').addEventListener('click', () => {
    loadStorageData();
    log('Данные обновлены', 'info');
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      log(`Storage изменен: ${Object.keys(changes).join(', ')}`, 'info');
      setTimeout(loadStorageData, 100);
    }
  });

  loadStorageData();
  log('Отладочная панель инициализирована', 'success');
}

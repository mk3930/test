self.importScripts('./context.js');

const g = id => chrome.i18n.getMessage(id);
const notify = message => chrome.notifications.create({
  title: chrome.runtime.getManifest().name,
  message,
  type: 'basic',
  iconUrl: '/data/icons/48.png'
});

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: 'http://multiplication-flash-cards.tilda.ws/right-click-enable' });
  }
});

const setIcon = enabled => chrome.action.setIcon({
  path: enabled ? {
    '16': '/data/icons/active/16.png',
    '32': '/data/icons/active/32.png',
    '48': '/data/icons/active/48.png'
  } : {
    '16': '/data/icons/16.png',
    '32': '/data/icons/32.png',
    '48': '/data/icons/48.png'
  }
});

const applyToTab = async (tabId, enabled) => {
  await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    func: target => {
      window.__rightClickEnableTarget = target;
    },
    args: [enabled]
  });
  await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    injectImmediately: true,
    files: ['/data/inject/core.js']
  });
};

const applyToAllTabs = async enabled => {
  const tabs = await chrome.tabs.query({});
  await Promise.allSettled(tabs.map(tab => applyToTab(tab.id, enabled)));
};

const syncGlobalState = async () => {
  const { enabled = false } = await chrome.storage.local.get({ enabled: false });
  setIcon(enabled);
  await applyToAllTabs(enabled);
};

chrome.runtime.onStartup.addListener(syncGlobalState);
chrome.storage.local.get({ enabled: false }, ({ enabled }) => setIcon(enabled));
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get({ enabled: false }, ({ enabled }) => {
      if (enabled) {
        applyToTab(tabId, true).catch(() => {});
      }
    });
  }
});

chrome.runtime.setUninstallURL('https://clevermathgames.com/right-click-enable-uninstall/', () => {
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError);
  }
});

const toggleGlobalState = async () => {
  try {
    const { enabled = false } = await chrome.storage.local.get({ enabled: false });
    const nextEnabled = !enabled;
    await chrome.storage.local.set({ enabled: nextEnabled });
    setIcon(nextEnabled);
    await applyToAllTabs(nextEnabled);
  } catch (error) {
    console.error('Error toggling extension:', error);
  }
};

chrome.action.onClicked.addListener(toggleGlobalState);

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.method === 'status') {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      func: () => window.pointers.status
    }, results => response(results[0]?.result));
    return true;
  }

  if (request.method === 'inject') {
    for (const file of request.files) {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id, frameIds: [sender.frameId] },
        injectImmediately: true,
        files: ['/data/inject/' + file]
      });
    }
  } else if (request.method === 'inject-unprotected') {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id, frameIds: [sender.frameId] },
      injectImmediately: true,
      func: code => {
        const script = document.createElement('script');
        script.classList.add('arclck');
        script.textContent = 'document.currentScript.dataset.injected = true;' + code;
        document.documentElement.appendChild(script);
        if (script.dataset.injected !== 'true') {
          const fallback = document.createElement('script');
          fallback.classList.add('arclck');
          fallback.src = 'data:text/javascript;charset=utf-8;base64,' + btoa(code);
          document.documentElement.appendChild(fallback);
          script.remove();
        }
      },
      args: [request.code],
      world: 'MAIN'
    });
  } else if (request.method === 'simulate-click') {
    applyToTab(sender.tab.id, true).catch(error => console.warn(error));
  }
});

{
  const observe = () => chrome.storage.local.get({ monitor: false, hostnames: [] }, async prefs => {
    await chrome.scripting.unregisterContentScripts();
    if (prefs.monitor && prefs.hostnames.length) {
      const matches = new Set();
      for (const hostname of prefs.hostnames) {
        matches.add(hostname);
      }
      for (let match of matches) {
        if (!match.includes(':')) {
          match = '*://' + match;
        }
        if (!match.endsWith('*')) {
          match += match.endsWith('/') ? '*' : '/*';
        }
        const id = (Math.random() + 1).toString(36).substring(7);
        chrome.scripting.registerContentScripts([{
          allFrames: true,
          matchOriginAsFallback: true,
          runAt: 'document_start',
          id: 'monitor-' + id,
          js: ['/data/monitor.js'],
          matches: [match]
        }]).catch(error => {
          console.error(error);
          notify(g('bg_e_1') + `: ${match}:` + error.message);
        });
      }
    }
  });
  observe();
  chrome.storage.onChanged.addListener(prefs => {
    if ((prefs.monitor && prefs.monitor.newValue !== prefs.monitor.oldValue) ||
        (prefs.hostnames && prefs.hostnames.newValue !== prefs.hostnames.oldValue)) {
      observe();
    }
    if (prefs.monitor) {
      permission();
    }
  });
}

const permission = () => chrome.permissions.contains({
  origins: ['http://*/*', 'https://*/*']
}, granted => {
  chrome.contextMenus.update('inject-sub', {
    enabled: granted === false,
    title: g('bg_context_1') + (granted ? ' ' + g('bg_context_2') : '')
  });
});

const hasPermission = () => chrome.permissions.contains({
  origins: ['http://*/*', 'https://*/*']
}, granted => {
  chrome.contextMenus.update('inject-sub', {
    enabled: granted === false,
    title: g('bg_context_1') + (granted ? ' ' + g('bg_context_2') : '')
  });
});

{
  const callback = () => {
    chrome.contextMenus.create({ id: 'contact-support', title: 'Contact support', contexts: ['action'] });
    chrome.contextMenus.create({ id: 'separator-1', type: 'separator', contexts: ['action'] });
    chrome.contextMenus.create({ id: 'add-to-whitelist', title: g('bg_context_3'), contexts: ['action'] });
    chrome.contextMenus.create({
      id: 'inject-sub',
      title: g('bg_context_4'),
      contexts: ['action']
    }, () => {
      chrome.runtime.lastError;
      hasPermission();
    });
    chrome.contextMenus.create({ id: 'test', title: g('bg_context_5'), contexts: ['action'] });
    chrome.contextMenus.create({
      id: 'exclude-site',
      title: g('bg_context_6') || 'Do not activate on this site',
      type: 'checkbox',
      checked: false,
      contexts: ['action']
    });
  };
  chrome.runtime.onInstalled.addListener(callback);
}

chrome.contextMenus.onShown.addListener((info, tab) => {
  if (!info.menuIds.includes('exclude-site')) {
    return;
  }

  let hostname;
  try {
    hostname = new URL(tab?.url || info.pageUrl).hostname;
  } catch (error) {
    hostname = '';
  }

  chrome.storage.local.get({ excludedHostnames: [] }, prefs => {
    chrome.contextMenus.update('exclude-site', {
      checked: prefs.excludedHostnames.includes(hostname)
    });
    chrome.contextMenus.refresh();
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'contact-support') {
    chrome.tabs.create({ url: 'https://onlineapp.pro/paywall/237/customer-portal/get?tab=support', index: tab.index + 1 });
  } else if (info.menuItemId === 'test') {
    chrome.tabs.create({ url: 'https://webbrowsertools.com/test-right-click', index: tab.index + 1 });
  } else if (info.menuItemId === 'inject-sub') {
    chrome.permissions.request({ origins: ['http://*/*', 'https://*/*'] }, hasPermission);
  } else if (info.menuItemId === 'exclude-site') {
    let hostname;
    try {
      const url = new URL(tab?.url || info.pageUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return;
      }
      hostname = url.hostname;
    } catch (error) {
      return;
    }

    chrome.storage.local.get({ excludedHostnames: [] }, prefs => {
      const excludedHostnames = prefs.excludedHostnames.includes(hostname)
        ? prefs.excludedHostnames.filter(value => value !== hostname)
        : [...prefs.excludedHostnames, hostname];
      chrome.storage.local.set({ excludedHostnames });
    });
  } else {
    const url = tab.url || info.pageUrl;
    if (url.startsWith('http')) {
      const { hostname } = new URL(url);
      chrome.storage.local.get({ hostnames: [] }, prefs => {
        chrome.storage.local.set({
          hostnames: [...prefs.hostnames, hostname].filter((value, index, list) => value && list.indexOf(value) === index)
        });
      });
      chrome.permissions.contains({ origins: ['http://*/*', 'https://*/*'] }, granted => {
        if (granted) {
          chrome.storage.local.set({ monitor: true });
          notify(`"${hostname}" is added to the list`);
        } else {
          notify(g('bg_msg_1'));
          setTimeout(() => chrome.runtime.openOptionsPage(), 3000);
        }
      });
    } else {
      notify(g('bg_e_2') + ': ' + url);
    }
  }
});

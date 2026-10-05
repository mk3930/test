'use strict';function formatDate(timestamp){const date=new Date(timestamp);return date.toLocaleString('ru-RU',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',timeZoneName:'short'});}
function formatTimeDifference(ms){const seconds=Math.floor(ms/1000);const minutes=Math.floor(seconds/60);const hours=Math.floor(minutes/60);const days=Math.floor(hours/24);if(days>0){return`${days} дн. ${hours % 24} ч. ${minutes % 60} мин.`;}else if(hours>0){return`${hours} ч. ${minutes % 60} мин. ${seconds % 60} сек.`;}else if(minutes>0){return`${minutes} мин. ${seconds % 60} сек.`;}else{return`${seconds} сек.`;}}
function formatTimeAgo(timestamp){const now=Date.now();const diff=now-timestamp;if(diff<60000){return'только что';}else if(diff<3600000){const minutes=Math.floor(diff/60000);return`${minutes} ${getRussianNoun(minutes, 'минуту', 'минуты', 'минут')} назад`;}else if(diff<86400000){const hours=Math.floor(diff/3600000);return`${hours} ${getRussianNoun(hours, 'час', 'часа', 'часов')} назад`;}else{const days=Math.floor(diff/86400000);return`${days} ${getRussianNoun(days, 'день', 'дня', 'дней')} назад`;}}
function getRussianNoun(number,one,two,five){let n=Math.abs(number);n%=100;if(n>=5&&n<=20){return five;}
n%=10;if(n===1){return one;}
if(n>=2&&n<=4){return two;}
return five;}
function updateTrialInfo(installDate,newUser){const TRIAL_IN_MS=7*24*60*60*1000;const now=Date.now();const statusElement=document.getElementById('debug-trial-status');const dateElement=document.getElementById('debug-install-date');const elapsedElement=document.getElementById('debug-time-elapsed');const remainingElement=document.getElementById('debug-time-remaining');if(!installDate){if(statusElement){statusElement.textContent='❓ Не установлена';statusElement.style.color='#6c757d';}
if(dateElement)dateElement.textContent='Не установлена';if(elapsedElement)elapsedElement.textContent='Нет данных';if(remainingElement)remainingElement.textContent='Нет данных';return;}
const installDateObj=new Date(installDate);const timeElapsed=now-installDate;const trialEndDate=installDate+TRIAL_IN_MS;const timeRemaining=Math.max(0,trialEndDate-now);if(dateElement){dateElement.textContent=`${formatDate(installDate)} (${formatTimeAgo(installDate)})`;}
if(elapsedElement){elapsedElement.textContent=formatTimeDifference(timeElapsed);}
if(!newUser){if(statusElement){statusElement.textContent='✅ Бессрочный доступ (старый пользователь)';statusElement.style.color='#28a745';}
if(remainingElement){remainingElement.textContent='∞ (без ограничений)';remainingElement.style.color='#28a745';}}else if(timeElapsed<TRIAL_IN_MS){const daysLeft=Math.ceil(timeRemaining/(24*60*60*1000));if(statusElement){statusElement.textContent=`⏳ Триал активен (осталось ${daysLeft} ${getRussianNoun(daysLeft, 'день', 'дня', 'дней')})`;statusElement.style.color='#17a2b8';}
if(remainingElement){remainingElement.textContent=formatTimeDifference(timeRemaining);remainingElement.style.color='#17a2b8';}}else{if(statusElement){statusElement.textContent='⛔ Триал завершен';statusElement.style.color='#dc3545';}
if(remainingElement){remainingElement.textContent='Истек '+formatDate(trialEndDate);remainingElement.style.color='#dc3545';}}
const trialInfoBlock=document.getElementById('debug-trial-info');if(trialInfoBlock){if(!newUser){trialInfoBlock.style.borderLeftColor='#28a745';trialInfoBlock.style.backgroundColor='#e8f5e9';}else if(timeElapsed<TRIAL_IN_MS){trialInfoBlock.style.borderLeftColor='#17a2b8';trialInfoBlock.style.backgroundColor='#e3f2fd';}else{trialInfoBlock.style.borderLeftColor='#dc3545';trialInfoBlock.style.backgroundColor='#fdeaea';}}}
function addCustomDateButtonHandler(){const customDateBtn=document.getElementById('debug-set-custom-date');if(customDateBtn){customDateBtn.addEventListener('click',()=>{const dialog=document.createElement('div');dialog.style.cssText=`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      `;dialog.innerHTML=`
        <div style="
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        ">
          <h3 style="margin-top: 0;">Установить произвольную дату установки</h3>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
              Дата и время:
            </label>
            <input type="datetime-local" id="custom-date-input" 
              value="${new Date().toISOString().slice(0, 16)}"
              style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">
              Статус пользователя:
            </label>
            <select id="custom-user-status" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              <option value="new">Новый пользователь (с триалом)</option>
              <option value="old">Старый пользователь (бессрочный доступ)</option>
            </select>
          </div>
          
          <div style="margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
            <strong>Быстрый выбор:</strong>
            <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
              <button class="quick-date" data-days="-1">Вчера</button>
              <button class="quick-date" data-days="-3">3 дня назад</button>
              <button class="quick-date" data-days="-7">7 дней назад (конец триала)</button>
              <button class="quick-date" data-days="-8">8 дней назад (триал истек)</button>
              <button class="quick-date" data-days="-30">30 дней назад</button>
            </div>
          </div>
          
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="cancel-custom-date" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Отмена
            </button>
            <button id="save-custom-date" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Сохранить
            </button>
          </div>
        </div>
      `;document.body.appendChild(dialog);dialog.querySelectorAll('.quick-date').forEach(btn=>{btn.addEventListener('click',()=>{const days=parseInt(btn.dataset.days);const date=new Date();date.setDate(date.getDate()+days);document.getElementById('custom-date-input').value=date.toISOString().slice(0,16);});});dialog.querySelector('#cancel-custom-date').addEventListener('click',()=>{document.body.removeChild(dialog);});dialog.querySelector('#save-custom-date').addEventListener('click',()=>{const dateInput=document.getElementById('custom-date-input');const userStatus=document.getElementById('custom-user-status').value;const selectedDate=new Date(dateInput.value);if(isNaN(selectedDate.getTime())){alert('Пожалуйста, выберите корректную дату');return;}
chrome.storage.local.set({installDate:selectedDate.getTime(),newUser:userStatus==='new',isPaywallGetUserRunning:false},()=>{const logDiv=document.getElementById('debug-logs');const logContent=document.getElementById('debug-log-content');if(logDiv&&logContent){const logEntry=document.createElement('div');logEntry.className=`debug-log success`;logEntry.textContent=`[${new Date().toLocaleTimeString()}] Дата установки установлена на: ${formatDate(selectedDate.getTime())}`;logContent.appendChild(logEntry);logContent.scrollTop=logContent.scrollHeight;}
if(typeof loadStorageData==='function'){loadStorageData();}
document.body.removeChild(dialog);});});dialog.addEventListener('click',(e)=>{if(e.target===dialog){document.body.removeChild(dialog);}});});}}
document.addEventListener('DOMContentLoaded',()=>{const toast=document.getElementById('toast');const notify=msg=>{clearTimeout(notify.id);toast.textContent=msg;notify.id=setTimeout(()=>toast.textContent='',2000);};chrome.storage.local.get({'hostnames':[]},prefs=>{document.getElementById('whitelist').value=prefs.hostnames.join(', ');});document.getElementById('save').addEventListener('click',()=>{const hostnames=document.getElementById('whitelist').value.split(/\s*,\s*/).map(s=>{s=s.trim();if(s&&s.startsWith('http')){try{return(new URL(s)).origin;}
catch(e){console.error(e);return'';}}
return s;}).filter((s,i,l)=>s&&l.indexOf(s)===i);chrome.storage.local.set({'monitor':hostnames.length>0,hostnames});document.getElementById('whitelist').value=hostnames.join(', ');notify('Options saved');});document.getElementById('reset').addEventListener('click',e=>{if(e.detail===1){notify('Double-click to reset!');}
else{localStorage.clear();chrome.storage.local.clear(()=>{chrome.permissions.remove({origins:["http://*/*","https://*/*"]},()=>{chrome.runtime.reload();window.close();});});}});const check=()=>chrome.permissions.contains({origins:["http://*/*","https://*/*"]},granted=>{const whitelist=document.getElementById('whitelist');if(whitelist){whitelist.disabled=granted===false;}});check();document.getElementById('subframe').onclick=()=>{chrome.permissions.request({origins:["http://*/*","https://*/*"]},granted=>{const lastError=chrome.runtime.lastError;if(lastError){notify(lastError.message);}
else{notify(granted?'Permission granted':'Permission denied');}
check();});};document.getElementById('no-subframe').onclick=()=>{chrome.permissions.remove({origins:["http://*/*","https://*/*"]},granted=>{const lastError=chrome.runtime.lastError;if(lastError){notify(lastError.message);}
else{notify('Permission removed');}
check();});};for(const a of[...document.querySelectorAll('[data-href]')]){if(a.hasAttribute('href')===false){a.href=chrome.runtime.getManifest().homepage_url+'#'+a.dataset.href;}}
const manifest=chrome.runtime.getManifest();const isLocalInstall=!manifest.update_url;if(isLocalInstall){const debugPanel=document.getElementById('debug-panel');if(debugPanel){debugPanel.style.display='block';initDebugPanel();}}});function initDebugPanel(){const log=(message,type='info')=>{const logDiv=document.getElementById('debug-logs');const logContent=document.getElementById('debug-log-content');if(!logDiv||!logContent)return;logDiv.style.display='block';const logEntry=document.createElement('div');logEntry.className=`debug-log ${type}`;logEntry.textContent=`[${new Date().toLocaleTimeString()}] ${message}`;logContent.appendChild(logEntry);logContent.scrollTop=logContent.scrollHeight;if(logContent.children.length>20){logContent.removeChild(logContent.firstChild);}};function loadStorageData(){chrome.storage.local.get(null,(data)=>{const storageDiv=document.getElementById('debug-storage');const keySelect=document.getElementById('debug-key-select');if(!storageDiv||!keySelect)return;const formatted=JSON.stringify(data,null,2).replace(/\\n/g,'\n').replace(/\\"/g,'"');storageDiv.textContent=formatted;updateTrialInfo(data.installDate,data.newUser);keySelect.innerHTML='<option value="">Выберите ключ...</option>';Object.keys(data).forEach(key=>{const option=document.createElement('option');option.value=key;option.textContent=key;keySelect.appendChild(option);});keySelect.addEventListener('change',()=>{const key=keySelect.value;const editValue=document.getElementById('debug-edit-value');if(editValue){if(key&&data[key]){editValue.value=JSON.stringify(data[key],null,2);}else{editValue.value='';}}});});}
const endTrialBtn=document.getElementById('debug-end-trial');if(endTrialBtn){endTrialBtn.addEventListener('click',()=>{const installDate=Date.now()-(8*24*60*60*1000);chrome.storage.local.set({installDate:installDate,newUser:true,isPaywallGetUserRunning:false},()=>{log(`Триал завершен! Установлена дата: ${formatDate(installDate)}`,'success');loadStorageData();});});}
const resetTrialBtn=document.getElementById('debug-reset-trial');if(resetTrialBtn){resetTrialBtn.addEventListener('click',()=>{const installDate=Date.now();chrome.storage.local.set({installDate:installDate,newUser:true,isPaywallGetUserRunning:false},()=>{log(`Триал сброшен! Новая дата установки: ${formatDate(installDate)}`,'success');loadStorageData();});});}
addCustomDateButtonHandler();const testPaywallBtn=document.getElementById('debug-test-paywall');if(testPaywallBtn){testPaywallBtn.addEventListener('click',async()=>{try{const tabs=await chrome.tabs.query({active:true,currentWindow:true});if(tabs[0]){await chrome.scripting.executeScript({target:{tabId:tabs[0].id},func:()=>{if(typeof paywall!=='undefined'){return paywall.getUser();}
return Promise.reject('Paywall не загружен');}}).then(results=>{const userData=results[0]?.result;log(`Paywall.getUser() результат: ${JSON.stringify(userData)}`,'info');}).catch(error=>{log(`Ошибка paywall: ${error.message || error}`,'error');});}}catch(error){log(`Ошибка: ${error.message}`,'error');}});}
const openPaywallBtn=document.getElementById('debug-open-paywall');if(openPaywallBtn){openPaywallBtn.addEventListener('click',()=>{chrome.tabs.create({url:chrome.runtime.getURL('paywall.html')});log('Открываю страницу оплаты','info');});}
const exportBtn=document.getElementById('debug-export-data');if(exportBtn){exportBtn.addEventListener('click',()=>{chrome.storage.local.get(null,(data)=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`rightclick-enable-backup-${Date.now()}.json`;a.click();URL.revokeObjectURL(url);log('Данные экспортированы','success');});});}
const clearAllBtn=document.getElementById('debug-clear-all');if(clearAllBtn){clearAllBtn.addEventListener('click',()=>{if(confirm('⚠️ ВНИМАНИЕ!\n\nВы собираетесь удалить ВСЕ настройки расширения.\n\nЭто действие невозможно отменить!\n\nПродолжить?')){chrome.storage.local.get(['hostnames','monitor'],(saved)=>{chrome.storage.local.clear(()=>{chrome.storage.local.set({hostnames:saved.hostnames||[],monitor:saved.monitor||false,popupShowCount:0,hasVoted:false},()=>{log('✅ ВСЕ НАСТРОЙКИ СБРОШЕНЫ! Расширение перезагружено','success');setTimeout(()=>{chrome.runtime.reload();window.location.reload();},1000);});});});}});}
const deleteKeyBtn=document.getElementById('debug-delete-key');if(deleteKeyBtn){deleteKeyBtn.addEventListener('click',()=>{const key=document.getElementById('debug-key-select')?.value;if(key&&confirm(`Удалить ключ "${key}"?`)){chrome.storage.local.remove(key,()=>{log(`Ключ "${key}" удален`,'success');loadStorageData();});}});}
const saveValueBtn=document.getElementById('debug-save-value');if(saveValueBtn){saveValueBtn.addEventListener('click',()=>{const key=document.getElementById('debug-key-select')?.value;const valueText=document.getElementById('debug-edit-value')?.value;if(!key){alert('Выберите ключ для редактирования');return;}
try{const value=valueText.trim()?JSON.parse(valueText):null;chrome.storage.local.set({[key]:value},()=>{log(`Ключ "${key}" обновлен`,'success');loadStorageData();});}catch(error){alert(`Ошибка парсинга JSON: ${error.message}`);log(`Ошибка JSON: ${error.message}`,'error');}});}
const refreshBtn=document.getElementById('debug-refresh');if(refreshBtn){refreshBtn.addEventListener('click',()=>{loadStorageData();log('Данные обновлены','info');});}
chrome.storage.onChanged.addListener((changes,namespace)=>{if(namespace==='local'){log(`Storage изменен: ${Object.keys(changes).join(', ')}`,'info');setTimeout(loadStorageData,100);}});const trialUpdateInterval=setInterval(()=>{chrome.storage.local.get(['installDate','newUser'],(data)=>{updateTrialInfo(data.installDate,data.newUser);});},30000);window.addEventListener('beforeunload',()=>{clearInterval(trialUpdateInterval);});loadStorageData();log('Отладочная панель инициализирована','success');}
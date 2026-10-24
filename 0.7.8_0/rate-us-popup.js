function createRatePopup(extensionVersion,extensionName){const containerId='right-click-enable-rate-us-stars-container';if(document.getElementById(containerId))return;(async()=>{const storage=await chrome.storage.local.get(['hasVoted','popupShowCount']);if(storage.hasVoted){return;}
let showCount=storage.popupShowCount||0;const shouldShowPopup=showCount===0||(showCount>0&&showCount%3===0);showCount++;await chrome.storage.local.set({popupShowCount:showCount});if(!shouldShowPopup){return;}
createPopupUI();function createPopupUI(){const container=document.createElement('div');container.id=containerId;container.style.cssText=`
                position: fixed; top: 150px; right: 20px; z-index: 1000;
            `;const shadowRoot=container.attachShadow({mode:'open'});const style=document.createElement('style');style.textContent=`
                .rate-popup {
                    background: white; border: 1px solid #ccc; padding: 15px;
                    font-family: Arial, sans-serif; font-size: 14px; color: black;
                    border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    width: 220px; position: relative; text-align: center;
                }
                #close-button {
                    position: absolute; top: 5px; right: 8px;
                    background: none; border: none; font-size: 16px; cursor: pointer;
                    color: #666;
                }
                .header {
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 12px; gap: 8px;
                }
                .header img { width: 24px; height: 24px; }
                .header h3 { 
                    color: black; font-size: 14px; margin: 0; 
                    font-weight: 600;
                }
                .full-stars { margin: 10px 0; }
                .full-stars .rating-group { display: inline-flex; }
                .full-stars input { position: absolute; left: -9999px; }
                .full-stars label { margin: 0; cursor: pointer; }
                .full-stars label a svg { 
                    margin: 0 2px; height: 28px; width: 28px; 
                    fill: #ff8400; transition: fill 0.3s; 
                }
                .full-stars input:checked ~ label a svg { fill: #ffc711; }
                .full-stars .rating-group:hover label a svg { fill: #ff8400; }
                .full-stars .rating-group input:hover ~ label a svg { fill: #ffc711; }
                .rate-us-text { 
                    font-size: 13px; margin-bottom: 8px; color: #666;
                    font-weight: 500;
                }
            `;const starConfig=[{id:1,action:'bug',disabled:true,checked:true},{id:2,action:'bug'},{id:3,action:'bug'},{id:4,action:'review'},{id:5,action:'review'}];const popup=document.createElement('div');popup.className='rate-popup';popup.innerHTML=getPopupHTML();shadowRoot.appendChild(style);shadowRoot.appendChild(popup);document.body.appendChild(container);setupEventListeners();setTimeout(()=>cleanupPopup(),30000);function generateStar(config){const disabledAttr=config.disabled?'disabled':'';const checkedAttr=config.checked?'checked':'';return`
                    <input name="fst" id="fst-${config.id}" value="${config.id}" 
                           type="radio" ${disabledAttr} ${checkedAttr}>
                    <label for="fst-${config.id}">
                        <a href="#" class="star-link" data-action="${config.action}" data-star="${config.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"/>
                            </svg>
                        </a>
                    </label>
                `;}
function getPopupHTML(){const starsHTML=starConfig.map(generateStar).join('');return`
                    <button id="close-button">&times;</button>
                    <div class="header">
                        <img src="http://clevermathgames.com/wp-content/uploads/2024/06/32.png" alt="Extension Icon">
                        <h3>Rate Right Click Enable</h3>
                    </div>
                    <div class="full-stars">
                        <div class="rate-us-text">How would you rate this extension?</div>
                        <div class="rating-group">
                            ${starsHTML}
                        </div>
                    </div>
                `;}
function setupEventListeners(){const handlers={'close-button':cleanupPopup};Object.entries(handlers).forEach(([id,handler])=>{const element=shadowRoot.getElementById(id);if(element)element.onclick=handler;});setupStarLinks();}
function setupStarLinks(){shadowRoot.querySelectorAll('.star-link').forEach(link=>{link.onclick=async(e)=>{e.preventDefault();const action=e.currentTarget.dataset.action;await chrome.storage.local.set({hasVoted:true});if(action==='review'){window.open('https://chromewebstore.google.com/detail/right-click-enable/aegpaehcnpbhdmnghlnbnngogbfelnno/reviews','_blank');}else{openBugReport();}
cleanupPopup();};});}
async function openBugReport(){window.open('https://clevermathgames.com/right-click-enable-feedback/','_blank');}
function cleanupPopup(){if(container&&document.body.contains(container)){container.remove();}}}})();}
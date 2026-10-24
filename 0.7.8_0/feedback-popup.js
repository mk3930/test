function createFeedbackPopup(extensionVersion,extensionName,debugUrl){const currentLocation=debugUrl?{host:new URL(debugUrl).host,href:debugUrl}:window.location;const containerId='right-click-enable-feedback-container';if(document.getElementById(containerId)){return;}
const container=document.createElement('div');container.id=containerId;container.style.position='fixed';container.style.top='150px';container.style.right='20px';container.style.zIndex='1000';const shadowRoot=container.attachShadow({mode:'open'});const feedbackPopup=document.createElement('div');feedbackPopup.id='feedback-popup';feedbackPopup.style.background='white';feedbackPopup.style.border='1px solid #ccc';feedbackPopup.style.padding='10px';feedbackPopup.style.fontFamily='Arial, sans-serif';feedbackPopup.style.fontSize='14px';feedbackPopup.style.color='black';feedbackPopup.style.borderRadius='8px';feedbackPopup.style.boxShadow='0px 0px 10px rgba(0,0,0,0.1)';feedbackPopup.style.width='250px';feedbackPopup.style.position='relative';feedbackPopup.style.display='flex';feedbackPopup.style.flexDirection='column';const style=document.createElement('style');style.textContent=`
        #close-button {
            position: absolute;
            top: 0;
            right: 0;
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
        }
        button:not(#close-button) {
            width: 100%;
            margin-top: 5px;
            padding: 8px 12px;
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 4px;
            color: #333;
            font-size: 14px;
            cursor: pointer;
            text-align: center;
            transition: background-color 0.2s;
        }
        button:not(#close-button):hover {
            background-color: #e8e8e8;
        }
        div.header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        img {
            width: 32px;
            height: 32px;
            margin-right: 10px;
        }
        h3 {
            color: black;
            font-size: 14px;
            margin: 0;
        }
        #contact-support-button {
            font-size: 13px;
            margin-top: 8px;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 6px 10px;
            color: #333;
            text-align: center;
            cursor: pointer;
        }
        #contact-support-button:hover {
            background-color: #e0e0e0;
        }
        .rate-footer {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #eee;
            font-size: 11px;
            color: #999;
        }
    `;feedbackPopup.innerHTML=`
        <button id="close-button">&times;</button>
        <div class="header">
            <img src="http://clevermathgames.com/wp-content/uploads/2024/06/32.png" alt="Extension Icon">
            <h3>Does the Right Click Enable extension work on this page?</h3>
        </div>
        <button id="good-button" class="feedback">👍 It works</button>
        <button id="bad-button" title="By clicking this button, you will send us the URL of this page.">👎 Report that it doesn't work</button>
        <button id="contact-support-button">❓ Contact Support</button>
        <button id="do-not-show-again-button">🛑 Do not show again</button>
        <div class="rate-footer">
            ${extensionName} v${extensionVersion}
        </div>
    `;shadowRoot.appendChild(style);shadowRoot.appendChild(feedbackPopup);document.body.appendChild(container);shadowRoot.getElementById('good-button').onclick=()=>{const currentUrl=currentLocation.host;chrome.storage.local.get({hiddenSites:[]},(data)=>{const hiddenSites=new Set(data.hiddenSites);hiddenSites.add(currentUrl);chrome.storage.local.set({hiddenSites:Array.from(hiddenSites)},()=>{console.log("Feedback popup hidden for this site.");});});cleanupPopup();if(window.createRatePopup){createRatePopup(extensionVersion,extensionName);}};shadowRoot.getElementById('bad-button').onclick=promptFeedbackType;shadowRoot.getElementById('do-not-show-again-button').onclick=()=>{chrome.storage.local.set({doNotShowRightClickEnableFeedBackPopup:true},()=>{console.log("Do not show again clicked");cleanupPopup();setTimeout(()=>{createInstructionPopup(extensionName);},300);});};shadowRoot.getElementById('close-button').onclick=cleanupPopup;shadowRoot.getElementById('contact-support-button').onclick=(e)=>{e.preventDefault();window.open('https://onlineapp.pro/paywall/237/customer-portal/get?tab=support','_blank');};let cleanupTimer=null;function cleanupPopup(){if(cleanupTimer){clearTimeout(cleanupTimer);cleanupTimer=null;}
const container=document.getElementById(containerId);if(container&&container.parentNode){container.remove();}}
function promptFeedbackType(){feedbackPopup.innerHTML=`
            <button id="close-button">&times;</button>
            <h3>The problem occurs with:</h3>
            <button id="text-issue">📄 Text</button>
            <button id="image-issue">🖼️ Image</button>
            <button id="video-issue">▶️ Video</button>
        `;shadowRoot.getElementById('close-button').onclick=cleanupPopup;shadowRoot.getElementById('text-issue').onclick=()=>promptSpecificFeedback('text');shadowRoot.getElementById('image-issue').onclick=()=>promptSpecificFeedback('image');shadowRoot.getElementById('video-issue').onclick=()=>promptSpecificFeedback('video');}
function promptSpecificFeedback(type){const feedbackTypes={text:{question:"What problem occurs with the text?",options:["Text cannot be selected","Menu does not appear","Cannot copy text","Another problem"]},image:{question:"What problem occurs with the image?",options:["Menu does not appear","Cannot save image as","Cannot copy image to clipboard","Another problem"]},video:{question:"What problem occurs with the video?",options:["Menu does not appear","Cannot save video as","Cannot save video frame as","Cannot copy video frame to clipboard","Another problem"]}};const{question,options}=feedbackTypes[type];feedbackPopup.innerHTML=`
            <button id="close-button">&times;</button>
            <h3>${question}</h3>
            ${options.map((option, index) => `<button class="problem-button"data-issue="${option}">${option}</button>`).join('')}
        `;shadowRoot.getElementById('close-button').onclick=cleanupPopup;Array.from(shadowRoot.querySelectorAll('.problem-button')).forEach(button=>{button.onclick=()=>submitFeedback(type,button.getAttribute('data-issue'));});}
function submitFeedback(issueType,issueDescription){const currentUrl=currentLocation.href;const dataToSend=`Extension: ${extensionName} v${extensionVersion}\nURL: ${currentUrl}\nProblem: ${issueDescription}`;const userConfirmed=window.confirm(`This feedback will be sent to developers:\n\n${dataToSend}\n\n`+"Ensure no sensitive data is included.\n\n"+"Continue sending?");if(userConfirmed){const data={name:extensionName,URL:currentUrl,version:extensionVersion,issueType:issueType,issueDescription:issueDescription};fetch('https://clevermathgames.com/wp-json/custom/v1/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(response=>response.json()).then(data=>{console.log('Feedback sent successfully:',data);}).catch((error)=>{console.error('Error sending feedback:',error);});}
cleanupPopup();}
cleanupTimer=setTimeout(cleanupPopup,30000);if(typeof window!=='undefined'){window.createInstructionPopup=createInstructionPopup;}}
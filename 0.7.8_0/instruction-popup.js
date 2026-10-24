function createInstructionPopup(extensionName){const containerId='right-click-enable-instruction-container';if(document.getElementById(containerId)){return;}
const container=document.createElement('div');container.id=containerId;container.style.position='fixed';container.style.top='150px';container.style.right='20px';container.style.zIndex='1001';container.style.fontFamily='Arial, sans-serif';container.style.fontSize='14px';const shadowRoot=container.attachShadow({mode:'open'});const instructionPopup=document.createElement('div');instructionPopup.id='instruction-popup';instructionPopup.style.background='white';instructionPopup.style.border='1px solid #4CAF50';instructionPopup.style.padding='20px';instructionPopup.style.color='black';instructionPopup.style.borderRadius='8px';instructionPopup.style.boxShadow='0px 0px 15px rgba(76, 175, 80, 0.2)';instructionPopup.style.width='320px';instructionPopup.style.position='relative';instructionPopup.style.display='flex';instructionPopup.style.flexDirection='column';instructionPopup.style.alignItems='center';const style=document.createElement('style');style.textContent=`
    #close-button {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
    }
    #close-button:hover {
        color: #333;
    }
    .instruction-image {
        width: 340px;
        height: 283px;
        margin-bottom: 20px;
    }
    .instruction-text {
        color: #333;
        font-size: 15px;
        text-align: center;
        line-height: 1.4;
        margin: 0;
    }
    .instruction-title {
        font-size: 18px;
        font-weight: bold;
        color: #4CAF50;
        margin-bottom: 15px;
        text-align: center;
    }
`;const imageUrl=chrome.runtime.getURL('right-click.png');instructionPopup.innerHTML=`
        <button id="close-button">&times;</button>
        <div class="instruction-title">${extensionName}</div>
        <img class="instruction-image" src="${imageUrl}" alt="Right click instruction">
        <p class="instruction-text">You can open the feedback window</p>
        <p class="instruction-text">by <b>right-clicking</b> on the extension icon</p>
    `;shadowRoot.appendChild(style);shadowRoot.appendChild(instructionPopup);document.body.appendChild(container);const img=shadowRoot.querySelector('.instruction-image');img.onerror=function(){console.error('Failed to load instruction image:',imageUrl);img.style.display='none';const errorText=document.createElement('div');errorText.textContent='📄';errorText.style.fontSize='48px';errorText.style.marginBottom='15px';img.parentNode.insertBefore(errorText,img.nextSibling);};shadowRoot.getElementById('close-button').onclick=()=>{const container=document.getElementById(containerId);if(container&&container.parentNode){container.remove();}
if(cleanupTimer){clearTimeout(cleanupTimer);}};let cleanupTimer=setTimeout(()=>{const container=document.getElementById(containerId);if(container&&container.parentNode){container.remove();}},15000);}
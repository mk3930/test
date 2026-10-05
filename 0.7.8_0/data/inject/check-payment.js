if(typeof window.isPaywallInjected==='undefined'){window.isPaywallInjected=true;}
async function isPaymentRequired(callback){try{const userData=await paywall.getUser();console.log('User Data:',userData);chrome.runtime.sendMessage({method:"paywall-getuser-completed"});if(userData.countryMatch!==true){return;}
if(userData.error==='Unauthorized'){callback();return;}
if(userData.paid!==true){callback();}}catch(error){console.error('Error fetching user data:',error);}}
function checkPayment(){if(window.pointers.status==='ready'){isPaymentRequired(()=>{chrome.runtime.sendMessage({method:"openPayWallTab"});});}else{chrome.runtime.sendMessage({method:"paywall-getuser-completed"});}}
checkPayment();
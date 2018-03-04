
addAlarmCheckOpenedTab();

function addAlarmCheckOpenedTab() {
	chrome.alarms.onAlarm.addListener(function( alarm ) {
		checkOpenedCoinfluxTab();
	});
	chrome.alarms.create('alarmCheckOpenedTab', {delayInMinutes: 10, periodInMinutes: 10});
}

function checkOpenedCoinfluxTab() {
	chrome.tabs.query({
		// looking for the coinflux tab
	    url: urlCoinflux,
	    currentWindow: true
	}, function(tabs) {
	    if (tabs.length == 0) {
	    		chrome.notifications.create( {
	    	        type: 'basic',
	    	        iconUrl: 'icons/iconCoinflux.png',
	    	        title: 'Coinflux tab is closed.',
	    	        message: 'Do you want to open it?',
	    	        buttons: [{
	    	            title: "Yes, get me there"
	    	        }, {
	    	            title: "Nope"
	    	        }],
	    	        priority: 0
    	     }, function(notificationId) {});
	    }
	});
}

chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
	chrome.tabs.create({ url: urlCoinflux },
    		function(tab) {
    			chrome.browserAction.setIcon({path: 'icons/iconCoinflux.png'});
    			queryCoinfluxTabForPrices();
    		}
    );
// if (notifId === myNotificationID) {
// if (btnIdx === 0) {
// window.open("...");
// } else if (btnIdx === 1) {
// saySorry();
// }
// }
}
);



var INTERVAL_CHECK_DEFAULT = 10;
var INTERVAL_NOTIFY_DEFAULT = 60;

chrome.storage.sync.get("intervalCheck", function(obj) {
	var intervalCheck = INTERVAL_CHECK_DEFAULT;
	if (obj != null && obj["intervalCheck"]!=null) {
		var intervalCheck = Number(obj["intervalCheck"]);
		if (isNaN(intervalCheck)) {
			intervalCheck = INTERVAL_CHECK_DEFAULT;
		}
	}
	
	addPriceNotifications(intervalCheck);
});


function addPriceNotifications(intervalCheck) {
	chrome.alarms.onAlarm.addListener(function( alarm ) {
		console.log("executing alarm");
		queryCoinfluxTabForPrices();
		
		var intervalNotify = INTERVAL_NOTIFY_DEFAULT;
		chrome.storage.sync.get("intervalNotify", function(obj) {
        		if (obj != null && obj["intervalNotify"]!=null) {
        			var intervalNotify = Number(obj["intervalNotify"]);
        			if (isNaN(intervalNotify)) {
        				intervalCheck = INTERVAL_NOTIFY_DEFAULT;
        			}
        		}
        		checkPrices(intervalNotify);
		});
	});
	chrome.alarms.create('alarmCheckPrices', {delayInMinutes: 1, periodInMinutes: intervalCheck});
	console.log("alarm added, recurence ["+intervalCheck+"] minutes");
}

function checkPrices(intervalNotify) {
	chrome.storage.sync.get('watchers', function(obj) {
		if (obj == null) {
			return;
		}
		var watchers = obj.watchers;
		if (watchers!=null && watchers.constructor === Array) {
			if (watchers.length > 0) {
			 	
		        for (var indx in watchers) {
			        	var watcher = watchers[indx];
			        	var coin = watcher.coin;
			        	var type = watcher.type;
			        	var priceLow = watcher.priceLow;
			        	var priceHigh = watcher.priceHigh;
			        	
			        	var currentPriceInCoinflux = getCurrentPriceInCoinflux(coin, type);
			        	currentPriceInCoinflux = currentPriceInCoinflux.replace(/,/g, '');
			        	currentPriceInCoinflux = parseFloat(currentPriceInCoinflux);
			        	
			        	if (currentPriceInCoinflux == null || isNaN(currentPriceInCoinflux)) {
			        		console.log("Could not check price for ["+coin+"]. Check if Coinflux tab is opened.");
			        		continue;
			        	}
			        	
			        	
			        	var isSkipNotification = watcher.lastNotificationTimestamp !=null && Math.round(+new Date()/1000/60) - watcher.lastNotificationTimestamp < intervalNotify;
//			        	if (isSkipNotification) {
//			        		chrome.notifications.create( {
//			        	        type: 'basic',
//			        	        iconUrl: 'icons/iconCoinflux.png',
//			        	        title: 'Skiping notification',
//			        	        message: 'Skiping notification',
//			        	        priority: 0
//			        	     }, function(notificationId) {});
//			        	}

			        	var notificationMessage = "";
			        	if (!isSkipNotification && priceLow <= currentPriceInCoinflux && currentPriceInCoinflux<=priceHigh) {
			        		var formatter = new Intl.NumberFormat('en-US');
			        		notificationMessage += coin + " is now at " + formatter.format(currentPriceInCoinflux) + " RON";
			        	}
			        	
			        	if (notificationMessage.length>0) {
			        		watcher.lastNotificationTimestamp = Math.round(+new Date()/1000/60);
			        		chrome.storage.sync.set({'watchers': watchers});
			        		
			        		chrome.notifications.create( {
			        			// type "list" can't be used on MacOs, as it
								// displays only the first message
			        	        type: 'basic',
			        	        iconUrl: 'icons/iconCoinflux.png',
			        	        title: 'Target price reached!',
			        	        message: notificationMessage,
			        	        priority: 1
			        	     }, function(notificationId) {});
			        	}
		        }
			}
		} else {
			console.log("watchers from storage is not an array");
		}
      });
}

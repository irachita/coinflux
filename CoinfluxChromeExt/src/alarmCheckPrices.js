
addPriceNotifications();

function addPriceNotifications() {
	chrome.alarms.onAlarm.addListener(function( alarm ) {
		console.log("executing alarm");
		queryCoinfluxTabForPrices();
		checkPrices();
	});
	chrome.alarms.create('alarmCheckPrices', {delayInMinutes: 10, periodInMinutes: 10});
	console.log("alarm added");
}

function checkPrices() {
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
			        	var notificationMessage = "";
			        	if (priceLow <= currentPriceInCoinflux && currentPriceInCoinflux<=priceHigh) {
			        		var formatter = new Intl.NumberFormat('en-US');
			        		notificationMessage += coin + " is now at " + formatter.format(currentPriceInCoinflux) + " RON";
			        	}
			        	
			        	if (notificationMessage.length>0) {
			        		chrome.notifications.create( {
			        			// type "list" can't be used on MacOs, as it displays only the first message
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

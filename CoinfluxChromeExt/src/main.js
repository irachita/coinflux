
var KEY_WATCHERS = 'watchers';
var MSG_NO_WATCHERS = 'Currently there are no watchers set.';

document.addEventListener('DOMContentLoaded', () => {
	queryCoinfluxTabForPrices(displayWatchers);
//	chrome.storage.sync.remove(KEY_WATCHERS);
	
	addDropdownEventListener();
	addWatcherBtnEventListener();
	addOpenCoinfluxBtnEventListener();
	
	displayIntervalSettings();
	addIntervalSettingsEventListener();
	
	addStorageListener();
	
});


function addDropdownEventListener() {
	var dropdownCoin = document.getElementById("dropdownCoin");
	var dropdownType = document.getElementById("dropdownType");
	dropdownCoin.addEventListener('change', function() {
		setInputPrice(dropdownCoin, dropdownType, inputPrice);
		setInputPriceRange();
    });
	dropdownType.addEventListener('change', function() {
		setInputPrice(dropdownCoin, dropdownType, inputPrice);
		setInputPriceRange();
	});

	var inputPrice = document.getElementById("inputPrice");
	inputPrice.addEventListener('change', function() {
		setInputPriceRange();
	});

	var precisionPrice = document.getElementById("precisionPrice");
	precisionPrice.addEventListener('change', function() {
		setInputPriceRange();
	});
}

function isInvalidWatcher() {
	var dropdownCoinVal = document.getElementById("dropdownCoin").value;
	var errMsg = "";
	if (dropdownCoin.value=="Select") {
		errMsg = "Select a coin";
	} else {
		var dropdownTypeVal = document.getElementById("dropdownType").value;
		if (dropdownTypeVal.value=="Type") {
			errMsg = "Select buy or sell";
		} else {
			var inputPriceString = document.getElementById("inputPrice").value;
			inputPriceString = inputPriceString.replace(/,/g, '');
			var inputPriceVal = Number(inputPriceString);
			if (inputPriceVal == 'NaN' || inputPriceVal ==0) {
				errMsg = "Invalid price";
			} else {
				var precisionPriceString = document.getElementById("precisionPrice").value;
				var precisionPriceVal = Number(precisionPriceString);
				if (precisionPriceVal == 'NaN' || precisionPriceVal==0) {
					errMsg = "Invalid precision";
				}
			}
		}
	}
	
	if (errMsg != "") {
		chrome.notifications.create({
	        type: 'basic',
	        iconUrl: 'icons/iconCoinflux.png',
	        title: 'Error',
	        message: errMsg
	 	}, function(notificationId) {});
		return true;
	}
	return false;
}

function addOpenCoinfluxBtnEventListener() {
	var btnOpenCoinflux = document.getElementById("btnOpenCoinfluxTab");
	btnOpenCoinflux.addEventListener('click', function() {
		chrome.tabs.create({ url: urlCoinflux },
	    		function(tab) {
	    			chrome.browserAction.setIcon({path: 'icons/iconCoinflux.png'});
	    			queryCoinfluxTabForPrices();
	    		}
	    );
	});
	
	chrome.tabs.query({
		// looking for the coinflux tab
        url: urlCoinflux,
        currentWindow: true
    }, function(tabs) {
    		var isBtnNeeded = tabs.length == 0;
        	btnOpenCoinflux.style.display= isBtnNeeded ? "block" : "none";
        	
        	var icon = isBtnNeeded ? 'icons/iconCoinflux_gray.png' : 'icons/iconCoinflux.png';
        	chrome.browserAction.setIcon({path: icon});
    });
}

function displayIntervalSettings() {
	var inputIntervalCheck = document.getElementById("intervalCheck");
	var inputIntervalNotify = document.getElementById("intervalNotify");
	
	chrome.storage.sync.get("intervalCheck", function(obj) {
		var intervalCheck = INTERVAL_CHECK_DEFAULT;
		if (obj != null && obj["intervalCheck"]!=null) {
			var intervalCheck = Number(obj["intervalCheck"]);
			if (isNaN(intervalCheck)) {
				intervalCheck = INTERVAL_CHECK_DEFAULT;
			}
		}
		
		inputIntervalCheck.value = intervalCheck;
	});
	chrome.storage.sync.get("intervalNotify", function(obj) {
		var intervalNotify = 60;
		if (obj != null && obj["intervalNotify"]!=null) {
			var intervalNotify = Number(obj["intervalNotify"]);
			if (isNaN(intervalNotify)) {
				intervalNotify = 60;
			}
		}
		
		inputIntervalNotify.value = intervalNotify;
	});
}

function addIntervalSettingsEventListener() {
	var inputIntervalCheck = document.getElementById("intervalCheck");
	inputIntervalCheck.addEventListener('change', function() {
		var intervalCheckAsString = inputIntervalCheck.value;
		var intervalCheck = Number(intervalCheckAsString);
		if (isNaN(intervalCheck)) {
			intervalCheck = INTERVAL_CHECK_DEFAULT;
		}
		inputIntervalCheck.value = intervalCheck;
		
		addPriceNotifications(intervalCheck);
		chrome.storage.sync.set({"intervalCheck": intervalCheck});
	});

	var inputIntervalNotify = document.getElementById("intervalNotify");
	inputIntervalNotify.addEventListener('change', function() {
		var intervalNotifyAsString = inputIntervalNotify.value;
		var intervalNotify = Number(intervalNotifyAsString);
		if (isNaN(intervalNotify)) {
			intervalNotify = 60;
		}
		inputIntervalNotify.value = intervalNotify;
		
		chrome.storage.sync.set({"intervalNotify": intervalNotify});
	});
}

function addWatcherBtnEventListener() {
	var btnWatcher = document.getElementById("btnWatcher");
	btnWatcher.addEventListener('click', function() {
		if (isInvalidWatcher()) {
			return;
		}
		var dropdownCoinVal = document.getElementById("dropdownCoin").value;
		var dropdownTypeVal = document.getElementById("dropdownType").value;
		
		var priceAsString = document.getElementById("inputPrice").value;
		priceAsString = priceAsString.replace(/,/g, '');
		var priceVal = parseFloat(priceAsString);
		
		var precisionPriceString = document.getElementById("precisionPrice").value;
		var precisionPriceVal = parseFloat(precisionPriceString);
		
		var inputPriceLow = document.getElementById("inputPriceLow");
		var inputPriceHigh = document.getElementById("inputPriceHigh");
		priceLow = parseFloat(inputPriceLow.value);
		priceHigh = parseFloat(inputPriceHigh.value);
		
		if (isNaN(precisionPriceVal)) {
			precisionPriceVal = 0;
		} else if (precisionPriceVal<0) {
			precisionPriceVal = Math.abs(precisionPriceVal);
		}
		
		if (isNaN(priceLow)) {
			priceLow = priceVal - (priceVal * precisionPriceVal  / 100);
			priceLow = priceLow.toFixed(0);
			priceLow = parseFloat(priceLow);
		}
		if (isNaN(priceHigh)) {
			priceHigh = priceVal + (priceVal * precisionPriceVal  / 100);
			priceHigh = priceHigh.toFixed(0);
			priceHigh = parseFloat(priceHigh);
		}
		
		chrome.storage.sync.get(KEY_WATCHERS, function(obj) {
			var watchers = obj.watchers; 
			if (watchers == null|| watchers.constructor !== Array || watchers.length == 0 ) {
				watchers = [];
			}
			
			var watcherExists = existsWatcher(watchers, dropdownCoinVal, dropdownTypeVal, priceLow, priceHigh);
			if (watcherExists) {
				chrome.notifications.create({
	        	        type: 'basic',
	        	        iconUrl: 'icons/iconCoinflux.png',
	        	        title: 'Error',
	        	        message: 'Value already exists'
        	     	}, function(notificationId) {});
			} else {
				watchers.push({coin:dropdownCoinVal, type:dropdownTypeVal, priceLow:priceLow,priceHigh:priceHigh });
				chrome.storage.sync.set({"watchers": watchers}, function() {
					console.log("watcher added");
				});
			}
	      });
	});
}

function existsWatcher(watchers, dropdownCoinVal, dropdownTypeVal, priceLow, priceHigh) {
	var watcherExists = false;
	for (var indx in watchers) {
        	var watcher = watchers[indx];
        	var inSameRange =  watcher.priceLow<=priceLow && priceHigh<=watcher.priceHigh;
        	if (watcher.coin==dropdownCoinVal && watcher.type==dropdownTypeVal && inSameRange) {
        		watcherExists = true;
        		break;
        	}
    }
	return watcherExists;
}

function addStorageListener() {
	var containerWatchers = document.getElementById("containerWatchers");
	chrome.storage.onChanged.addListener(function(changes, namespace) {
		if (changes.length == 0) {
			containerWatchers.innerHTML = MSG_NO_WATCHERS;
		} else {
	        for (key in changes) {
		        	if (key!==KEY_WATCHERS) {
		        		continue;
		        	}
		        	var watchers = changes[key].newValue;
		        	if (watchers.constructor === Array) {
		        		console.log("Displaying watchers");
		        		var content = buildWatchersTableHeader();
		        		content += buildWatchersTableRows(watchers);
		        		content +='</table>';
		        		containerWatchers.innerHTML=content;
		        		console.log("Finished displaying watchers");
		        	} else {
		        		console.log("watchers from storage is not an array");
		        	}
	        }
	        addListnerRemoveWatcher();
		}
      });
}

function setInputPrice(dropdownCoin, dropdownType, inputPrice) {
	coin = dropdownCoin.value;
	type = dropdownType.value;
	// eval not allowed in chrome extensions
	if (coin=='Btc' && type=='Buy') {
		inputPrice.value = priceBtcBuy;
	} else if (coin=='Btc' && type=='Sell') {
		inputPrice.value = priceBtcSell;		
	} else if (coin=='Eth' && type=='Buy') {
		inputPrice.value = priceEthBuy;
	} else if (coin=='Eth' && type=='Sell') {
		inputPrice.value = priceEthSell;		
	} else if (coin=='Ltc' && type=='Buy') {
		inputPrice.value = priceLtcBuy;
	} else if (coin=='Ltc' && type=='Sell') {
		inputPrice.value = priceLtcSell;		
	} else if (coin=='Etc' && type=='Buy') {
		inputPrice.value = priceEtcBuy;
	} else if (coin=='Etc' && type=='Sell') {
		inputPrice.value = priceEtcSell;		
	} 
	inputPrice.focus();
	inputPrice.select();
	
}

function setInputPriceRange() {
	var inputPriceString = document.getElementById("inputPrice").value;
	inputPriceString = inputPriceString.replace(/,/g, '');
	var priceVal = parseFloat(inputPriceString);
	if (priceVal !=null && !isNaN(inputPriceString)) {
		var precisionPriceString = document.getElementById("precisionPrice").value;
		var precisionPriceVal = parseFloat(precisionPriceString);
		precisionPriceVal = Math.abs(precisionPriceVal);
		if (isNaN(precisionPriceVal)) {
			precisionPriceVal = 0;
		}
		
		var priceValLow = priceVal;
		var priceValHigh = priceVal;
		priceValLow = priceVal - (priceVal * precisionPriceVal  / 100);
		priceValLow = priceValLow.toFixed(0);
		priceValLow = parseFloat(priceValLow);
		priceValHigh = priceVal + (priceVal * precisionPriceVal  / 100);
		priceValHigh = priceValHigh.toFixed(0);
		priceValHigh = parseFloat(priceValHigh);

		var inputPriceLow = document.getElementById("inputPriceLow");
		var inputPriceHigh = document.getElementById("inputPriceHigh");
		inputPriceLow.value = priceValLow;
		inputPriceHigh.value = priceValHigh;
	}
}


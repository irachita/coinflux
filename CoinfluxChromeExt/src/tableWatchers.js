function displayWatchers() {
	chrome.storage.sync.get(KEY_WATCHERS, function(obj) {
		if (obj == null) {
			containerWatchers.innerHTML = MSG_NO_WATCHERS;
			return;
		}
		var watchers = obj.watchers;
		if (watchers != null && watchers.constructor === Array) {
			if (watchers.length == 0) {
				containerWatchers.innerHTML = MSG_NO_WATCHERS;
			} else {
				console.log("Displaying watchers");
				var content = buildWatchersTableHeader();
				content += buildWatchersTableRows(watchers);
				content += '</table>';
				containerWatchers.innerHTML = content;
				console.log("Finished displaying watchers");
				addListnerRemoveWatcher();
			}
		} else {
			console.log("watchers from storage is not an array");
			containerWatchers.innerHTML = MSG_NO_WATCHERS;
		}
	});
}
function buildWatchersTableHeader() {
	var content = '<table class="tg">';
	content += '<tr>';
	content += '<th class="tgHeader">Coin</th>';
	content += '<th class="tgHeader">Type</th>';
	content += '<th class="tgHeader">Price now</th>';
	content += '<th class="tgHeader">Notify when btw.</th>';
	content += '<th></th>';
	content += '</tr>';
	return content;
}

function buildWatchersTableRows(watchers) {
	var content = "";
	for ( var indx in watchers) {
		var watcher = watchers[indx];

		var formatter = new Intl.NumberFormat('en-US');
		var priceLow = formatter.format(watcher.priceLow);
		var priceHigh = formatter.format(watcher.priceHigh);

		var quickSearch = watcher.coin + "/" + watcher.type + "/"
				+ watcher.priceLow + "/" + watcher.priceHigh;

		content += '<tr quickSearch="' + quickSearch + '">';
		var imgIcon = "<img style='vertical-align:middle;' src='"+chooseIcon(watcher.coin)+"'> ";
		content += '<td class="tgHeader" title="'+watcher.coin+'">' + imgIcon +'</td>';
		content += '<td class="tgType" id="priceSell">' + watcher.type
				+ '</td>';
		var currentPriceInCoinflux = getCurrentPriceInCoinflux(watcher.coin,
				watcher.type);
		content += '<td class="tgPrice" id="priceCoinflux">'
				+ currentPriceInCoinflux + '</td>';
		content += '<td class="tgPrice" id="priceBuy">' + priceLow
				+ ' - ' + priceHigh + '</td>';
		content += '<td><img src="icons/minus_button-16.png" quickSearch="'
				+ quickSearch + '"></td>';
		content += '</tr>';
	}
	return content;
}

function chooseIcon(coin) {
	var icon = "";
	switch (coin) {
	case "Btc":
		icon = "icons/btc-16.png";
		break
	case "Eth":
		icon = "icons/eth-16.png";
		break;
	case "Ltc":
		icon = "icons/ltc-16.png";
		break;
	case "Etc":
		icon = "icons/etc-16.png";
		break;
	default:
	}
	return icon;
}

function addListnerRemoveWatcher() {
	var list = document.getElementsByTagName("img");
	for (i = 0; i < list.length; i++) {
		var imgElem = list[i];
		var quickSearch = imgElem.getAttribute("quickSearch");
		if (quickSearch != null) {
			imgElem.addEventListener('click', function() {
				var quickSearch = this.getAttribute("quickSearch");
				var split = quickSearch.split("/");
				removeWatcher(split[0], split[1], split[2], split[3]);
			});
		}
	}
}

function removeWatcher(argCoin, argType, argPriceLow, argPriceHigh) {
	chrome.storage.sync.get(KEY_WATCHERS, function(obj) {
		if (obj == null) {
			return;
		}
		var watchers = obj.watchers;
		if (watchers != null && watchers.constructor === Array) {
			var notificationMessage = "";
			if (watchers.length > 0) {
				for (var indx in watchers) {
					var watcher = watchers[indx];

					var coin = watcher.coin;
					var type = watcher.type;
					var priceLow = watcher.priceLow;
					var priceHigh = watcher.priceHigh;

					var found = coin == argCoin && type == argType
							&& argPriceLow == priceLow
							&& argPriceHigh == priceHigh;
					if (found) {
						watchers.splice(indx, 1);
						chrome.storage.sync.set({
							"watchers" : watchers
						}, function() {
							console.log("watcher [" + argCoin + ", " + argType
									+ ", " + argPriceLow + ", " + argPriceHigh
									+ "] removed");
						});
						break;
					}
				}
			}
		} else {
			console.log("watchers from storage is not an array");
		}
	});
}
var urlCoinflux = "https://coinflux.com/sec/dashboard";
var xpathPricePrefix = "/html/body/div[2]/div/ui-view/div/div[1]/market-new/md-card/md-card-content/";
var xpathPriceBtcSell = xpathPricePrefix + "div[2]/h2[1]";
var xpathPriceBtcBuy = xpathPricePrefix + "div[3]/h2[1]";
var xpathPriceEthSell = xpathPricePrefix + "div[2]/h2[2]";
var xpathPriceEthBuy = xpathPricePrefix + "div[3]/h2[2]";
var xpathPriceLtcSell = xpathPricePrefix + "div[2]/h2[3]";
var xpathPriceLtcBuy = xpathPricePrefix + "div[3]/h2[3]";
var xpathPriceEtcSell = xpathPricePrefix + "div[2]/h2[4]";
var xpathPriceEtcBuy = xpathPricePrefix + "div[3]/h2[4]";

var priceBtcSell;
var priceBtcBuy;
var priceEthSell;
var priceEthBuy;
var priceLtcSell;
var priceLtcBuy;
var priceEtcSell;
var priceEtcBuy;

updateExtensionIcon();
queryCoinfluxTabForPrices();

function queryCoinfluxTabForPrices(callback) {
	chrome.tabs.query({
		// looking for the coinflux tab
		url: urlCoinflux,
		currentWindow: true
	}, function(tabs) {
		var pathIcon = 'icons/iconCoinflux_gray.png';
		if (tabs.length > 0) {
			var tab = tabs[0];
			getCoinfluxPrices(tab, callback);
			pathIcon = 'icons/iconCoinflux.png';
		}  
		chrome.browserAction.setIcon({path: pathIcon});
	});
}

function getCoinfluxPrices(tab, callback) {
	console.log("Begin retrieving prices");
	chrome.tabs.executeScript(tab.id, {
		code : jsCodeGetPrice(xpathPriceBtcSell)
	}, function(resultArr) {
		priceBtcSell = resultArr[0];
	});
	chrome.tabs.executeScript(tab.id, {
		code : jsCodeGetPrice(xpathPriceBtcBuy)
	}, function(resultArr) {
		priceBtcBuy = resultArr[0];
	});
	chrome.tabs.executeScript(tab.id, {
		code : jsCodeGetPrice(xpathPriceEthSell)
	}, function(resultArr) {
		priceEthSell = resultArr[0];
	});
	chrome.tabs.executeScript(tab.id, {
		code : jsCodeGetPrice(xpathPriceEthBuy)
	}, function(resultArr) {
		priceEthBuy = resultArr[0];
	});
	chrome.tabs.executeScript(tab.id, {
		code : jsCodeGetPrice(xpathPriceLtcSell)
	}, function(resultArr) {
		priceLtcSell = resultArr[0];
	});
	chrome.tabs.executeScript(tab.id, {
		code : jsCodeGetPrice(xpathPriceLtcBuy)
	}, function(resultArr) {
		priceLtcBuy = resultArr[0];
	});
	chrome.tabs.executeScript(tab.id, {
		code : jsCodeGetPrice(xpathPriceEtcSell)
	}, function(resultArr) {
		priceEtcSell = resultArr[0];
	});
	chrome.tabs.executeScript(tab.id, {
		code : jsCodeGetPrice(xpathPriceEtcBuy)
	}, function(resultArr) {
		priceEtcBuy = resultArr[0];
		if (callback) {
			callback();
		}
//		displayWatchers();
//		console.log("priceEtcBuy = " + priceEtcBuy);
	});
	console.log("Finished retrieving prices");
}

/**
 * a better solution would be to retrieve all at once, but the following code
 * doesn't return anything:
 * 
 * var xpath =
 * "/html/body/div[2]/div/ui-view/div/div[1]/market-new/md-card/md-card-content/div/h2[@class='md-title
 * hide-xs ng-binding' and
 * 
 * @hide-xs='']"; var line = 'var xpathPrice = "'+xpath+'";'; line+= 'var
 *                allPrices = [];'; line+= 'var xPathRes =
 *                document.evaluate(xpathPrice, document, null,
 *                XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);'; line+= 'var
 *                resultNext = xPathRes.iterateNext();'; line+= 'while
 *                (resultNext) {'; line+= '
 *                allPrices.push(resultNext.innerHTML)'; line+= ' resultNext =
 *                xPathRes.iterateNext()'; line+= '};' line+= 'return
 *                allPrices;';
 * 
 * @returns
 */
function jsCodeGetPrice(xpathPrice) {
	var line = 'var xpathPrice = "' + xpathPrice + '";';
	line += 'document.evaluate(xpathPrice, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerHTML;';
	return line;
}

function getCurrentPriceInCoinflux(coin, type) {
	var currentPriceInCoinflux;
	if (coin=='Btc' && type=='Buy') {
		currentPriceInCoinflux = priceBtcBuy;
	} else if (coin=='Btc' && type=='Sell') {
		currentPriceInCoinflux = priceBtcSell;		
	} else if (coin=='Eth' && type=='Buy') {
		currentPriceInCoinflux = priceEthBuy;
	} else if (coin=='Eth' && type=='Sell') {
		currentPriceInCoinflux = priceEthSell;		
	} else if (coin=='Ltc' && type=='Buy') {
		currentPriceInCoinflux = priceLtcBuy;
	} else if (coin=='Ltc' && type=='Sell') {
		currentPriceInCoinflux = priceLtcSell;		
	} else if (coin=='Etc' && type=='Buy') {
		currentPriceInCoinflux = priceEtcBuy;
	} else if (coin=='Etc' && type=='Sell') {
		currentPriceInCoinflux = priceEtcSell;		
	}
//	console.log("Price on coinflux = " + currentPriceInCoinflux);
	if (currentPriceInCoinflux == null) {
		currentPriceInCoinflux = "NaN";
	}

	return currentPriceInCoinflux;
}

function updateExtensionIcon() {
	chrome.tabs.query({
		// looking for the coinflux tab
		url: urlCoinflux,
		currentWindow: true
	}, function(tabs) {
		var pathIcon = 'icons/iconCoinflux_gray.png';
		if (tabs.length > 0) {
			pathIcon = 'icons/iconCoinflux.png';
		} 
		chrome.browserAction.setIcon({path: pathIcon});

	});
}
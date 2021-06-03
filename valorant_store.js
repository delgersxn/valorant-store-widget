// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: store-alt;

/*
 * Required Configurations!
 * To save yourself and me some time please make sure you READ and provide the correct information that is asked for.
 * Messing up any of the required configurations will cause the widget to produce countless errors.
 *
 * Once the THREE (3) required configurations are set correctly you can close out of this and the widget will work.
 * If you'd like to customize or tweak some aspects of this script take a look at the Optional Configurations section.
 * Or if you have understanding of JavaScript/Scriptable feel free to tear apart the source code and fit it to your liking.
 */

// REGION -- Set this to the same region that your Riot account is set too.
//
// North America 		= "NA"
// Europe 				= "EU"
// Republic of Korea 	= "KR"
// Asia-Pacific 		= "AP"
// Brazil 				= "BR"
// Latin America 		= "LATAM"
//
// Example: const REGION = "EU";
const REGION = "";

// USERNAME and PASSWORD -- Set these to your Riot login credentials.
//
// Example: const USERNAME = "AzureDiamond";
// Example: const PASSWORD = "Hunter2";
const USERNAME = "";
const PASSWORD = "";

// check to make sure user actually supplied their username, password, and region.
if (![REGION, USERNAME, PASSWORD].every(Boolean)) {
	throw new Error("Seems like you forgot to read the instructions... please make sure that you provide your Riot login credentials and region ID");
}

/* ------------------------------------- END OF REQUIRED CONFIGURATIONS! ------------------------------------- */

/*
 * Optional Configurations!
 * These are optional configurations you can set or tweak to change the look of the widget.
 * More options coming soon... well... maybe... idk...
 */

// GRADIENT_BACKGROUND -- Apply a gradient background to the widget. (true or false)
// If false, a solid color background will be applied to the widget(s) instead.
const GRADIENT_BACKGROUND = true;


// GRADIENT_BACKGROUND_COLORS -- The two colors that you would like to turn into a gradient.
const GRADIENT_BACKGROUND_COLORS = [new Color("#29323c"), new Color("#1c1c1c")];


// SOLID_BACKGROUND_COLOR -- The solid background color to be applied to the widgets.
const SOLID_BACKGROUND_COLOR = Color.black();

/* ------------------------------------- END OF OPTIONAL CONFIGURATIONS! ------------------------------------- */

/*
 * Developer/Testing Configurations!
 * These are test configurations you can use or set when testing the script within or outside of Scriptable.
 */

// change "preview" value to either "small", "medium", or "large" if you'd like to see the different widget sizes.
const DEV_ENV = {
	"preview": "large"
};
if (config.runsInApp) {	config.widgetFamily = DEV_ENV.preview; }

/* ------------------------------------- END OF DEVELOPER/TESTING CONFIGURATIONS! ------------------------------------- */

/**
 * Contains all the URLS for the used API endpoints and in-game assets.
 * @const {Object}
 */
const URLS = {
	authorization: "https://auth.riotgames.com/api/v1/authorization",
	entitlements: "https://entitlements.auth.riotgames.com/api/token/v1",
	userinfo: "https://auth.riotgames.com/userinfo",
	wallet: `https://pd.${REGION}.a.pvp.net/store/v1/wallet`,
	version: "https://valorant-api.com/v1/version",
	offers: `https://pd.${REGION}.a.pvp.net/store/v1/offers`,
	storefront: `https://pd.${REGION}.a.pvp.net/store/v2/storefront`,
	bundles: "https://valorant-api.com/v1/bundles",
	skinlevels: "https://valorant-api.com/v1/weapons/skinlevels",
	valorantPointsIcon: "https://media.valorant-api.com/currencies/85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741/displayicon.png",
	radianitePointsIcon: "https://media.valorant-api.com/currencies/e59aa87c-4cbf-517a-5983-6e81511be9b7/displayicon.png",
}

/**
 * Entry of the script that will set or preview the Widget.
 */
async function run() {
	const widget = await createWidget();

	if (!config.runsInWidget) {
		switch (DEV_ENV.preview) {
			case "small": await widget.presentSmall(); break;
			case "medium": await widget.presentMedium(); break;
			case "large": await widget.presentLarge(); break;
		}
	} else {
		Script.setWidget(widget);
	}
	Script.complete();
}

/**
 * Retrieves the desired image from the given URL and returns the response as an image.
 *
 * @param {string} url - The URL of the desired image.
 * @return {Promise} Response as an image.
 */
async function loadImage(url) {
	return await new Request(url).loadImage();
}

/**
 * Gets both the display name and image of the given weapon skin/bundle
 * from their respective Uuid. The retrieved information is gathered from https://valorant-api.com/.
 *
 * @param {string} skins - The four skins currently in the end-users store.
 * @param {string} bundleOffer - The current bundle in the end-users store.
 * @return {Object} JSON object that contains the proper names and images of the bundle/skins.
 */
async function getSkinData(skins, bundleOffer) {
	let skinData = {skins: []};
	// loop through the skin Uuid's and retrieve their proper name and display icon/image.
	for (let i = 0; i < skins.length; i++) {
		const skinReq = new Request(`${URLS.skinlevels}/${skins[i]}`);
		const skinRes = await skinReq.loadJSON();
		skinData.skins.push({displayName: skinRes.data.displayName, displayIcon: skinRes.data.displayIcon});
	}

	// obtain the proper bundle name and display icon/image
	const bundleReq = new Request(`${URLS.bundles}/${bundleOffer}`);
	const bundleRes = await bundleReq.loadJSON();
	skinData = { ...skinData, skinBundle: {displayName: bundleRes.data.displayName, displayIcon: bundleRes.data.displayIcon}};

	return skinData;
}

/**
 * Gets what currenty is offered in the end-users store.
 *
 * @param {string} accessToken - The access token used to call the API endpoints.
 * @param {string} entitlementsToken - The entitlements token which allows for permission to certain API endpoints (works alongside the access token).
 * @param {string} userID - The unique userid for the given account.
 * @return {string} Uuid's for each of the skins and current bundle offer.
 */
async function getStoreOffers(accessToken, entitlementsToken, userID) {
	const req = new Request(`${URLS.storefront}/${userID}`);
	req.headers = {
		"Content-Type": "application/json",
		"Authorization": `Bearer ${accessToken}`,
		"X-Riot-Entitlements-JWT": entitlementsToken,
	};
	const res = await req.loadJSON();
	return [res.SkinsPanelLayout.SingleItemOffers, res.FeaturedBundle.Bundle.DataAssetID];
}

/**
 * Gets the end-users Valorant and Radianite Point balance.
 *
 * @param {string} accessToken - The access token used to call the API endpoints.
 * @param {string} entitlementsToken - The entitlements token which allows for permission to certain API endpoints (works alongside the access token).
 * @param {string} userID - The unique userid for the given account.
 * @return {Object} Current balance of both Valorant and Radinite Points.
 */
async function getInGameBalances(accessToken, entitlementsToken, userID) {
	const req = new Request(`${URLS.wallet}/${userID}`);
	req.headers = {
		"Content-Type": "application/json",
		"Accept": "application/json",
		"X-Riot-Entitlements-JWT": entitlementsToken,
		"Authorization": `Bearer ${accessToken}`,
	};
	const res = await req.loadJSON();
	return { "Valorant Points": res.Balances["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"], "Radianite Points": res.Balances["e59aa87c-4cbf-517a-5983-6e81511be9b7"]};
}

/**
 * Gets the unique userid of the given Riot account.
 *
 * @param {string} accessToken - The access token used to call the API endpoints.
 * @param {string} entitlementsToken - The entitlements token which allows for permission to certain API endpoints (works alongside the access token).
 * @return {string} Userid for the given Riot account.
 */
async function getUserID(accessToken, entitlementsToken) {
	const req = new Request(URLS.userinfo);
	req.method = "POST";
	req.headers = {
		"Content-Type": "application/json",
		"Accept": "application/json",
		"Authorization": `Bearer ${accessToken}`,
		"X-Riot-Entitlements-JWT": entitlementsToken,
	};
	const res = await req.loadJSON();
	return res.sub;
}

/**
 * Gets both the Access Token and Entitlements Token.
 *
 * @param {string} type - The response type from the inital user authentication call.
 * @param {string} response - The full response data from the inital user authentication call.
 * @return {string} Access Token and Entitlements Token.
 */
async function getUserTokens(type, response) {
	// regex to single out the access token from the string.
	const retrieveAccessTokenRegex = /access_token=((?:[a-zA-Z]|\d|\.|-|_)*)/;

	// retrieve the Access Token.
	var accessToken = null;
	if (type === "auth") {
		const req = new Request(URLS.authorization);
		req.method = "PUT";
		req.headers = {
			"Content-Type": "application/json",
			"Accept": "application/json",
		};
		req.body = JSON.stringify({
			"type": "auth",
			"username": USERNAME,
			"password": PASSWORD,
		});
		const res = await req.loadJSON();

		if (res.response === undefined) {
			throw new Error("Failed to login! Please make sure that you provided your correct Riot login credentials.");
		}
		accessToken = res.response.parameters.uri.match(retrieveAccessTokenRegex)[1];
	} else {
		accessToken = response.response.parameters.uri.match(retrieveAccessTokenRegex)[1];
	}

	// retrieve the Entitlements Token.
	const req = new Request(URLS.entitlements);
	req.method = "POST";
	req.headers = {
		"Content-Type": "application/json",
		"Accept": "application/json",
		"Authorization": `Bearer ${accessToken}`,
	};
	const res = await req.loadJSON();

	// return the tokens.
	return [accessToken, res.entitlements_token];
}

/**
 * Initiates the user authentication login that will retrieve the users store data.
 *
 * @return {Object} JSON object that will contain the current store offers and current point balances.
 */
async function userLoginAuthentication() {
	const req = new Request(URLS.authorization);
	req.method = "POST";
	req.headers = {
		"Content-Type": "application/json",
		"Accept": "application/json",
	};
	req.body = JSON.stringify({
		"client_id": "play-valorant-web-prod",
		"nonce": "1",
		"redirect_uri": "https://playvalorant.com/opt_in",
		"response_type": "token id_token",
	});
	const res = await req.loadJSON();

	// success
	if (res.type === 'auth' || res.type === 'response') {
		// first get the users Acess Token and Entitlements Token which will allow access to the API endpoints.
		const [accessToken, entitlementsToken] = await getUserTokens(res.type, res);
		// obtain the users unique User ID of their Riot account.
		const userId = await getUserID(accessToken, entitlementsToken);
		// retrieve the users current store offerings.
		const [currentSkinOffers, currentBundleOffer] = await getStoreOffers(accessToken, entitlementsToken, userId);
		// obtain more information about the skins in the users shop (weapon skin name and display icon/image).
		const skinData = await getSkinData(currentSkinOffers, currentBundleOffer);
		// retrieve the users current amount of Valorant Points and Radianite Points.
		const currentBalances = await getInGameBalances(accessToken, entitlementsToken, userId);

		return {
			currentShopOfferings: skinData,
			currentPointBalances: currentBalances,
		};
	} else {
		throw new Error(`Failed to authenticate, Response Type ${res.type}`);
	}
}

/**
 * Creates a Stack that will contain the individual offer (weapon skin image and text)
 *
 * @param {Object} stack - The Stack in which to add the weapon skin stack.
 * @param {string} offerText - Text of offer (e.g. Prime Vandal).
 * @param {string} offerImage - Image of offer (e.g. https://media.valorant-api.com/weaponskinlevels/c9678d8c-4327-f397-b0ec-dca3c3d6fb15/displayicon.png)
 */
async function createWeaponSkinStack(stack, offerText, offerImage) {
	// create image stack that will house the image
	const verticalStack = stack.addStack();
	verticalStack.layoutVertically();
	verticalStack.addSpacer();
	const horizontalStack = verticalStack.addStack();
	horizontalStack.addSpacer();
	const contentStack = horizontalStack.addStack();
	horizontalStack.addSpacer();
	verticalStack.addSpacer();
	contentStack.addImage(await loadImage(offerImage));

	// set text under the image stack
	await addContentToStack(stack, offerText);
}

/**
 * Adds text or image to a desired Stack.
 *
 * @param {Object} stack - The Stack in which to add the content (text/image).
 * @param {string} text - Text to add.
 * @param {string} imageUrl - Image to add from a URL.
 */
async function addContentToStack(stack, text, imageUrl) {
	const contentStack = stack.addStack();
	// to show an image beside the text, this is used only atm to show the currency icons for valorant and radianite points.
	if (imageUrl) {
		const currencyIcon = contentStack.addImage(await loadImage(imageUrl));
		currencyIcon.imageSize = new Size(7,7);
	}
	contentStack.addSpacer(1);
	const amountText = contentStack.addText(text);
	amountText.font = Font.semiboldSystemFont(6);
	amountText.leftAlignText();
}

/**
 * Sets the header info to show both the users current Valorant and Radianite point balance.
 *
 * @param {Object} stack - The Stack in which to add the point balance text too.
 * @param {number} valorantPointBalance - Users current Valorant Point balance.
 * @param {number} radianitePointBalance - Users current Radianite Point balance.
 */
async function setHeaderInfo(stack, valorantPointBalance, radianitePointBalance) {
	await addContentToStack(stack, `${valorantPointBalance}`, URLS.valorantPointsIcon);
	await addContentToStack(stack, `${radianitePointBalance}`, URLS.radianitePointsIcon);
}

/**
 * Generates the whole VALORANT store layout, along with configuring
 * it to work with the three possible widget sizes.
 *
 * @param {Object} rootStack - The root stack of the ListWidget.
 * @param {Object} userStoreData - Contains all the needed user data (skins in shop and current balances).
 */
async function generateStoreLayout(rootStack, userStoreData) {
	await setHeaderInfo(rootStack, userStoreData.currentPointBalances["Valorant Points"], userStoreData.currentPointBalances["Radianite Points"]);
	const storeStack = rootStack.addStack();
	storeStack.centerAlignContent();
	storeStack.layoutVertically();

	switch (config.widgetFamily) {
		case "large": {
			const bundleOffer = await createWeaponSkinStack(storeStack, userStoreData.currentShopOfferings.skinBundle.displayName, userStoreData.currentShopOfferings.skinBundle.displayIcon);
			storeStack.addSpacer(12);
		} case "medium": case "small": {
			const gridStack = storeStack.addStack();
			const leftStoreColumnStack = gridStack.addStack();
			const rightStoreColumnStack = gridStack.addStack();
			leftStoreColumnStack.layoutVertically();
			rightStoreColumnStack.layoutVertically();

			for (let i = 0; i < userStoreData.currentShopOfferings.skins.length; i++) {
				if (i % 2 === 0) {
					await createWeaponSkinStack(leftStoreColumnStack, userStoreData.currentShopOfferings.skins[i].displayName, userStoreData.currentShopOfferings.skins[i].displayIcon);
				} else {
					await createWeaponSkinStack(rightStoreColumnStack, userStoreData.currentShopOfferings.skins[i].displayName, userStoreData.currentShopOfferings.skins[i].displayIcon);
				}
			}
		}
	}
}

/**
 * Creates/Builds the ListWidget and applys the the desired settings.
 *
 * @return {Object} The newly created ListWidget that contains the users shop offers.
 */
async function createWidget() {
	const listWidget = new ListWidget();
	listWidget.setPadding(12, 12, 12, 12);
	const rootStack = listWidget.addStack();
	rootStack.centerAlignContent();
	rootStack.layoutVertically();

	// apply the optional configurations
	if (GRADIENT_BACKGROUND) {
		const gradient = new LinearGradient();
		gradient.colors = GRADIENT_BACKGROUND_COLORS;
		gradient.locations = [0.0, 1.0];
		listWidget.backgroundGradient = gradient;
	} else {
		listWidget.backgroundColor = SOLID_BACKGROUND_COLOR;
	}

	// get users data (current store offerings and their current balances).
	const userData = await userLoginAuthentication();
	// generate the store layout that will be shown on the widget itself.
	await generateStoreLayout(rootStack, userData);

	return listWidget;
}

await run();

const crypto = require("crypto");
const http = require("http");
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
app.use(bodyParser.json());

// PAYMENT: Generate Payment Url
app.post("/generate-payment-url", async (req, res) => {
	console.log("\nPAYMENT REQUEST");

	// create a payment request
	const payReq = {
		amount: req.body.amount.toString(), // payment amount "250.00",
		hashCheck: "",
		isTest: true,
		notifyUrl: "https://my-api/payment/notify", // points to the "/payment/notify" endpoint created below
		optional1: "", // extra values as a "string" that you would like added
		optional2: "",
		optional3: "",
		optional4: "",
		payoutCurrencyCode: "ZAR", // only ZAR for now
		siteKey: "Site_One",
	};

	// concat all variable in payReq in alphabetical order.
	let concatStr = "";
	for (const [_, value] of Object.entries(payReq)) {
		concatStr += value.toString();
	}
	console.log(concatStr); // 250.00truehttps://my-api/payment/notifyZARSite_One

	// add your private key to the end of the concatStr
	concatStr += "my_very_secret_private_key"; // 250.00truehttps://my-api/payment/notifyZARSite_Onemy_very_secret_private_key

	// lowercase concatStr and generate a hash
	concatStr = concatStr.toLowerCase();
	console.log(concatStr); // 250.00truehttps://my-api/payment/notifyzarsite_onemy_very_secret_private_key

	const hashCheck = crypto.createHash("sha512").update(concatStr).digest("hex");
	console.log(hashCheck); // b35ba6af422150c0a14c9d3193f5ee43e0b1c8d200f2c17c9aceed8c6c665c5367643bd2fede1e7a5adb6f1e208681b85a7caa057a493745c035af7716ad3e8c

	// add hashCheck to the payReq object
	payReq.hashCheck = hashCheck;

	// send payment request to our API to generate a payment url
	const payRes = await fetch(
		"https://api.libex.ai/merchant/generate/payment-url",
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payReq),
		}
	);

	return res.status(payRes.status).send(await payRes.json()); // returns a (paymentUrl && paymentId) or error
});

// PAYMENT: Receive payment status notifications from PayX1
// This is the "notifyUrl" endpoint you set in the "payReq" sent to PayX1
app.post("/payment/notify", (req, res) => {
	console.log("\nPAYMENT NOTIFICATION RECEIVED!");
	console.log(req.body);

	let concatStr = "";
	concatStr += req.body.amount;
	concatStr += req.body.amountReceived;
	concatStr += req.body.isTest.toString();
	concatStr += req.body.optional1;
	concatStr += req.body.optional2;
	concatStr += req.body.optional3;
	concatStr += req.body.optional4;
	concatStr += req.body.paymentId;
	concatStr += req.body.payoutCurrencyCode;
	concatStr += req.body.siteKey;
	concatStr += req.body.status;
	concatStr += req.body.statusMessage;
	concatStr += "my_very_secret_private_key";

	concatStr = concatStr.toLowerCase();
	console.log(concatStr);

	const hashCheck = crypto.createHash("sha512").update(concatStr).digest("hex");
	console.log(hashCheck);
	if (req.body.hashCheck !== hashCheck) {
		console.log("HashCheck failed!");
		return res.status(401);
	}

	// use payment notification here ...

	console.log(req.body.status);
	return res.status(200);
});

// PAYOUTS: Submit a payout request
app.post("/payout", async (req, res) => {
	console.log("\nPAYOUT REQUEST");

	// create a payment request
	const payoutReq = {
		//address: "", // BTC / ETH / LBX chain address (not used at present)
		amount: req.body.amount.toString(), // payout amount "250.00"
		bankAccountNumber: req.body.bankAccountNumber, // "123456789" : to bank account number
		bankBranchCode: req.body.bankBranchCode, // "000000" : to bank branch code
		bankCode: req.body.bankCode, // "fnb" see bank codes for each supported bank below
		hashCheck: "",
		isInstantPayout: false,
		isTest: true,
		notifyUrl: "https://my-api/payout/notify", // points to the "/payout/notify" endpoint created below
		optional1: "", // extra values as a "string" that you would like added
		optional2: "",
		optional3: "",
		optional4: "",
		payoutCurrencyCode: "ZAR", // only ZAR for now,
		siteKey: "Site_One",
	};

	// concat all variable in payReq in alphabetical order.
	let concatStr = "";
	for (const [_, value] of Object.entries(payoutReq)) {
		concatStr += value.toString();
	}
	console.log(concatStr); // 250.0123456700000fnbfalsetruehttps://my-api/payout/notifyZARSite_One

	// add your private key to the end of the concatStr
	concatStr += "my_very_secret_private_key"; // 250.0123456700000fnbfalsetruehttps://my-api/payout/notifyZARSite_Onemy_very_secret_private_key

	// lowercase concatStr and generate a hash
	concatStr = concatStr.toLowerCase();
	console.log(concatStr); // 250.0123456700000fnbfalsetruehttps://my-api/payout/notifyzarsite_onemy_very_secret_private_key

	const hashCheck = crypto.createHash("sha512").update(concatStr).digest("hex");
	console.log(hashCheck); // 7dc285a54a74921ac3c99886806de3e41835d09cb9fac0b55f7fe6a154a8dc94386673c9c05570ad3d2779aa24c1eaade14fc1ba99de354e315fce07b415e0cb

	// add hashCheck to the payReq object
	payoutReq.hashCheck = hashCheck;

	// send payout request to our API to submit a payout
	const payoutRes = await fetch("https://api.libex.ai/merchant/payout", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payoutReq),
	});

	return res.status(payoutRes.status).send(await payoutRes.json()); // returns payoutId or error
});

// PAYOUT: Receive payout status notifications from PayX1
// This is the "notifyUrl" endpoint you set in the "payoutReq" sent to PayX1
app.post("/payout/notify", (req, res) => {
	console.log("\nPAYOUT NOTIFICATION RECEIVED!");
	console.log(req.body);

	let concatStr = "";
	concatStr += req.body.amount;
	concatStr += req.body.isInstantPayout.toString();
	concatStr += req.body.isTest.toString();
	concatStr += req.body.optional1;
	concatStr += req.body.optional2;
	concatStr += req.body.optional3;
	concatStr += req.body.optional4;
	concatStr += req.body.payoutCurrencyCode;
	concatStr += req.body.payoutId;
	concatStr += req.body.siteKey;
	concatStr += req.body.status;
	concatStr += req.body.statusMessage;
	concatStr += "my_very_secret_private_key";

	concatStr = concatStr.toLowerCase();
	console.log(concatStr);

	const hashCheck = crypto.createHash("sha512").update(concatStr).digest("hex");
	console.log(hashCheck);
	if (req.body.hashCheck !== hashCheck) {
		console.log("HashCheck failed!");
		return res.status(401);
	}

	// use payout notification here ...

	console.log(req.body.status);
	return res.status(200);
});

const server = http.createServer(app);
server.listen(process.env.PORT || 8080, () => {
	console.log(`Server started on port ${server.address().port}`);
});

// PAYOUT BANK CODES: 
// Up to date list at https://api.libex.ai/merchant/banks
const banks = [
	{
		code: "absa",
		name: "ABSA",
		branchCode: "632005",
	},
	{
		code: "capitec",
		name: "Capitec Bank",
		branchCode: "470010",
	},
	{
		code: "discovery",
		name: "Discovery Bank",
		branchCode: "679000",
	},
	{
		code: "fnb",
		name: "FNB",
		branchCode: "250655",
	},
	{
		code: "investec",
		name: "Investec",
		branchCode: "580105",
	},
	{
		code: "nedbank",
		name: "Nedbank",
		branchCode: "198765",
	},
	{
		code: "standard",
		name: "Standard Bank",
		branchCode: "051001",
	},
	{
		code: "african",
		name: "African Bank",
		branchCode: "430000",
	},
	{
		code: "albaraka",
		name: "Albaraka Bank",
		branchCode: "800000",
	},
	{
		code: "zero",
		name: "Bank Zero",
		branchCode: "888000",
	},
	{
		code: "bidvest",
		name: "Bidvest Bank",
		branchCode: "462005",
	},
	{
		code: "citi",
		name: "CitiBank",
		branchCode: "350005",
	},
	{
		code: "grobank",
		name: "Grobank",
		branchCode: "410506",
	},
	{
		code: "hsbc",
		name: "HSBC Bank",
		branchCode: "587000",
	},
	{
		code: "mercantile",
		name: "Mercantile Bank",
		branchCode: "450105",
	},
	{
		code: "olympus_mobile",
		name: "Olympus Mobile",
		branchCode: "585001",
	},
	{
		code: "rmb",
		name: "RMB",
		branchCode: "250655",
	},
	{
		code: "sasfin",
		name: "Sasfin Bank",
		branchCode: "683000",
	},
	{
		code: "standard_chartered",
		name: "Standard Chartered Bank",
		branchCode: "730020",
	},
	{
		code: "tyme",
		name: "TymeBank",
		branchCode: "678910",
	},
	{
		code: "ubank",
		name: "Ubank Limited",
		branchCode: "431010",
	},
];

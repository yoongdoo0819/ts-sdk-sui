import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFaucetHost, requestSuiFromFaucetV1 } from '@mysten/sui/faucet';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { Secp256r1Keypair } from '@mysten/sui/keypairs/secp256r1';
import { fromHex } from '@mysten/bcs';
import { MIST_PER_SUI } from '@mysten/sui/utils';
 
const TENSROFLOW_SUI_PACKAGE_ID = '0xf3d386954dad5e1aad298f9d3c2e962eff783461bfe0bd09ef4d466edebf7453';

const PRIVATE_KEY = "";

// async function main() {
if (!PRIVATE_KEY) {
	console.error("Please provide a PRIVATE_KEY in .env file");
}

const rpcUrl = getFullnodeUrl('mainnet');
const client = new SuiClient({ url: rpcUrl });

console.log("Initializing transaction block...");
const tx = new Transaction();

if (!tx.gas) {
	console.error("Gas object is not set correctly");
}
console.log("Building transaction block...");

/////////// sui tensor ///////////

// let init_result = tx.moveCall({
// 	target: `${TENSROFLOW_SUI_PACKAGE_ID}::inference_ptb::initialize`,
// 	// arguments: [
// 	// 	tx.pure.u64(0),
// 	// ],
// })

let input_mag = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 79, 44, 0, 0, 0, 0, 4, 89, 0, 0, 0, 0, 0, 59, 92, 43, 0, 0, 0, 0, 49, 89, 90, 30, 0, 0, 0, 0, 61, 81, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let input_sign  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// let input_mag = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 22, 46, 0, 0, 0, 0, 12, 8, 75, 0, 0, 0, 0, 0, 85, 30, 0, 0, 0, 0, 0, 60, 0, 0, 0, 0, 0, 0, 50, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0];
// let input_sign  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const scale = 2;

// tx.moveCall({
// 	target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_compute_chunk`,
// 	arguments: [
// 		tx.object("0x1db5ef659a874b769fb54d6da08f1514ccd8d30f456995c2eb3cb3bd0012f7be"),
// 		tx.object("0x08b795ce8b64264b304ccd60f8a4d45dcf3bed060b5d8fff34a98ca3c5b228cf"),
// 		tx.pure.string('dense1'),
// 		tx.pure.vector('u64', input_mag),
// 		tx.pure.vector('u64', input_sign),
// 		tx.pure.u64(14),
// 		tx.pure.u64(15),
// 	],
// })







let res1 = tx.moveCall({
	target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_finalize`,
	arguments: [
		tx.object("0x1db5ef659a874b769fb54d6da08f1514ccd8d30f456995c2eb3cb3bd0012f7be"),
		tx.object("0x08b795ce8b64264b304ccd60f8a4d45dcf3bed060b5d8fff34a98ca3c5b228cf"),
		tx.pure.string('dense1'),
	],
})

let res2 = tx.moveCall({
	target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_2`,
	arguments: [
		tx.object("0x1db5ef659a874b769fb54d6da08f1514ccd8d30f456995c2eb3cb3bd0012f7be"),
		res1[0],
		res1[1],
		res1[2],
	],
})

tx.moveCall({
	target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_3`,
	arguments: [
		tx.object("0x1db5ef659a874b769fb54d6da08f1514ccd8d30f456995c2eb3cb3bd0012f7be"),
		res2[0],
		res2[1],
		res2[2],
	],
})

console.log("Executing transaction block..."); 
const keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
const result = await client.signAndExecuteTransaction({
	transaction: tx,
	signer: keypair,
	options: {
		showEffects: true,
		showEvents: true,
		showObjectChanges: true,
	}
})

console.log("@@@@@@@@@@ RESULT @@@@@@@@@@");
console.log(result);
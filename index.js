import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFaucetHost, requestSuiFromFaucetV1 } from '@mysten/sui/faucet';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { Secp256r1Keypair } from '@mysten/sui/keypairs/secp256r1';
import { fromHex } from '@mysten/bcs';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import promptSync from 'prompt-sync';

const prompt = promptSync();

const network = "mainnet";
const TENSROFLOW_SUI_PACKAGE_ID = '0x15db7fc27e798491b9cef5d5e477f7870ecc04c279475f88531d0517881d6645';
const PRIVATE_KEY = "";

// 3
// let input_mag = [0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 85, 99, 17, 0, 0, 0, 3, 0, 56, 32, 0, 0, 0, 62, 93, 90, 0, 0, 0, 0, 0, 0, 99, 0, 0, 0, 90, 76, 94, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// let input_sign  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// 7
// let input_mag = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 39, 39, 39, 71, 0, 0, 0, 0, 0, 0, 54, 16, 0, 0, 3, 74, 52, 10, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 	0, 0];
// let input_sign  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; 

// 4
// let input_mag = [0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 66, 0, 0, 0, 99, 0, 0, 95, 0, 0, 0, 51, 60, 87, 99, 0, 0, 0, 6, 67, 0, 99, 2, 0, 0, 0, 0, 0, 33, 57, 0, 0, 0, 0, 0, 0, 0, 0];
// let input_sign  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// 0
// let input_mag = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32, 96, 1, 0, 0, 0, 33, 62, 29, 45, 0, 0, 0, 50, 0, 0, 88, 0, 0, 17, 0, 0, 54, 7, 0, 0, 11, 97, 86, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
// let input_sign  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// 6
let input_mag = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 79, 44, 0, 0, 0, 0, 4, 89, 0, 0, 0, 0, 0, 59, 92, 43, 0, 0, 0, 0, 49, 89, 90, 30, 0, 0, 0, 0, 61, 81, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let input_sign  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const scale = 2;

const rpcUrl = getFullnodeUrl(network);
const client = new SuiClient({ url: rpcUrl });

let SignedFixedGraph = ""; //"0xc01aae7a6c51c4632f292b6e6e24578f9028ba5a0a84e287b061f8aeedba443a";
let PartialDenses = ""; //"0x72ad5e743e25ed303d4feb248798197e7b5cfe3a152da91b5d160f691c7ce138";

// async function main() {
if (!PRIVATE_KEY) {
	console.error("Please provide a PRIVATE_KEY in .env file");
}

// async function init() {
	
// 	try {
// 		console.log("Initializing...");
// 		const tx = new Transaction();

// 		if (!tx.gas) {
// 			console.error("Gas object is not set correctly");
// 		}

// 		tx.moveCall({
// 			target: `${TENSROFLOW_SUI_PACKAGE_ID}::inference_ptb::initialize`,
// 		})

// 		console.log("Executing transaction block..."); 
// 		const keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
// 		console.log(rpcUrl)
// 		console.log(client)
// 		const result = await client.signAndExecuteTransaction({
// 			transaction: tx,
// 			signer: keypair,
// 			options: {
// 				showEffects: true,
// 				showEvents: true,
// 				showObjectChanges: true,
// 			}
// 		})

// 		console.log(result);
// 	} catch (error) {
// 		console.error("err", error)
// 	}
// }

// async function compute2() {
// 	const tx = new Transaction();

// 	if (!tx.gas) {
// 		console.error("Gas object is not set correctly");
// 	}

// 	let index = 0
// 	for (let i = 0; i<2; i++) {
// 		console.log("index ", index + " - " + index+1)
// 		tx.moveCall({
// 			target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_compute_chunk`,
// 			arguments: [
// 				tx.object(SignedFixedGraph),
// 				tx.object(PartialDenses),
// 				tx.pure.string('dense1'),
// 				tx.pure.vector('u64', input_mag),
// 				tx.pure.vector('u64', input_sign),
// 				tx.pure.u64(index),
// 				tx.pure.u64(index+1),
// 			],
// 		})
// 		index += 2

// 		console.log("Executing transaction block..."); 
// 		const keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
// 		const result = await client.signAndExecuteTransaction({
// 			transaction: tx,
// 			signer: keypair,
// 			options: {
// 				showEffects: true,
// 				showEvents: true,
// 				showObjectChanges: true,
// 			}
// 		})

// 		console.log(result);
// 	}
// }

// async function compute8() {
// 	const tx = new Transaction();

// 	if (!tx.gas) {
// 		console.error("Gas object is not set correctly");
// 	}

// 	let index = 0
// 	for (let i = 0; i<8; i++) {
// 		console.log("index ", index + " - " + index+1)
// 		tx.moveCall({
// 			target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_compute_chunk`,
// 			arguments: [
// 				tx.object(SignedFixedGraph),
// 				tx.object(PartialDenses),
// 				tx.pure.string('dense1'),
// 				tx.pure.vector('u64', input_mag),
// 				tx.pure.vector('u64', input_sign),
// 				tx.pure.u64(index),
// 				tx.pure.u64(index+1),
// 			],
// 		})
// 		index += 2

// 		console.log("Executing transaction block..."); 
// 		const keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
// 		const result = await client.signAndExecuteTransaction({
// 			transaction: tx,
// 			signer: keypair,
// 			options: {
// 				showEffects: true,
// 				showEvents: true,
// 				showObjectChanges: true,
// 			}
// 		})

// 		console.log(result);
// 	}
// }


// async function finalize() {
// 	const tx = new Transaction();

// 	if (!tx.gas) {
// 		console.error("Gas object is not set correctly");
// 	}

// 	let res1 = tx.moveCall({
// 		target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_finalize`,
// 		arguments: [
// 			tx.object(SignedFixedGraph),
// 			tx.object(PartialDenses),
// 			tx.pure.string('dense1'),
// 		],
// 	})

// 	let res2 = tx.moveCall({
// 		target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_2`,
// 		arguments: [
// 			tx.object(SignedFixedGraph),
// 			res1[0],
// 			res1[1],
// 			res1[2],
// 		],
// 	})

// 	tx.moveCall({
// 		target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_3`,
// 		arguments: [
// 			tx.object(SignedFixedGraph),
// 			res2[0],
// 			res2[1],
// 			res2[2],
// 		],
// 	})

// 	console.log("Executing transaction block..."); 
// 	const keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
// 	const result = await client.signAndExecuteTransaction({
// 		transaction: tx,
// 		signer: keypair,
// 		options: {
// 			showEffects: true,
// 			showEvents: true,
// 			showObjectChanges: true,
// 		}
// 	})

// 	console.log(result);
// }

async function waitForCommand() {
	// 사용자 입력 받기
	let tx;
	let index = 0;
	let keypair;
	let result;

	while (true) {
		const command = prompt("Please enter your command : ");

		switch (command.trim().toLowerCase()) {
		case "init":
			// init();
			console.log("Initializing...");
			tx = new Transaction();

			if (!tx.gas) {
				console.error("Gas object is not set correctly");
			}

			tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::inference_ptb::initialize`,
			})

			console.log("Executing transaction block..."); 
			keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
			result = await client.signAndExecuteTransaction({
				transaction: tx,
				signer: keypair,
				options: {
					showEffects: true,
					showEvents: true,
					showObjectChanges: true,
				}
			})

			let parts;
			let exist;
			for (let i=0; i<3; i++) {
				parts = result['objectChanges'][i]["objectType"].split("::");
				exist = parts.some(part => part.includes("PartialDenses"));
				if (exist == true) {
					PartialDenses = result['objectChanges'][i]["objectId"];
					exist = false;
				}

				parts = result['objectChanges'][i]["objectType"].split("::");
				exist = parts.some(part => part.includes("SignedFixedGraph"));
				if (exist == true) {
					SignedFixedGraph = result['objectChanges'][i]["objectId"];
					exist = false;
				}
			}
			console.log(result);
			console.log("SignedFixedGraph ", SignedFixedGraph);
			console.log("PartialDenses ", PartialDenses);
			
			break;
	
		case "compute2":
			// compute2();
			
			index = 0;
			for (let i = 0; i<2; i++) {
				console.log(index, index+7)
				tx = new Transaction();

				if (!tx.gas) {
					console.error("Gas object is not set correctly");
				}
				
				tx.moveCall({
					target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_compute_chunk`,
					arguments: [
						tx.object(SignedFixedGraph),
						tx.object(PartialDenses),
						tx.pure.string('dense1'),
						tx.pure.vector('u64', input_mag),
						tx.pure.vector('u64', input_sign),
						tx.pure.u64(index),
						tx.pure.u64(index+7),
					],
				})
				index += 8

				console.log("Executing transaction block..."); 
				keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
				result = await client.signAndExecuteTransaction({
					transaction: tx,
					signer: keypair,
					options: {
						showEffects: true,
						showEvents: true,
						showObjectChanges: true,
					}
				})

				console.log(result);
			}
			break;
			
		case "compute8":
			// compute8();

			index = 0;
			for (let i = 0; i<8; i++) {
				console.log(index, index+1)
				tx = new Transaction();

				if (!tx.gas) {
					console.error("Gas object is not set correctly");
				}
				
				tx.moveCall({
					target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_compute_chunk`,
					arguments: [
						tx.object(SignedFixedGraph),
						tx.object(PartialDenses),
						tx.pure.string('dense1'),
						tx.pure.vector('u64', input_mag),
						tx.pure.vector('u64', input_sign),
						tx.pure.u64(index),
						tx.pure.u64(index+1),
					],
				})
				index += 2

				console.log("Executing transaction block..."); 
				keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
				result = await client.signAndExecuteTransaction({
					transaction: tx,
					signer: keypair,
					options: {
						showEffects: true,
						showEvents: true,
						showObjectChanges: true,
					}
				})

				console.log(result);
			}
			break;
	
		case "finalize":
			// finalize();
			tx = new Transaction();

			if (!tx.gas) {
				console.error("Gas object is not set correctly");
			}

			let res1 = tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_finalize`,
				arguments: [
					tx.object(SignedFixedGraph),
					tx.object(PartialDenses),
					tx.pure.string('dense1'),
				],
			})

			let res2 = tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_2`,
				arguments: [
					tx.object(SignedFixedGraph),
					res1[0],
					res1[1],
					res1[2],
				],
			})

			tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_3`,
				arguments: [
					tx.object(SignedFixedGraph),
					res2[0],
					res2[1],
					res2[2],
				],
			})

			console.log("Executing transaction block..."); 
			keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
			result = await client.signAndExecuteTransaction({
				transaction: tx,
				signer: keypair,
				options: {
					showEffects: true,
					showEvents: true,
					showObjectChanges: true,
				}
			})

			console.log(result);
			break;
	
		case "run":
			console.log("running...");
			tx = new Transaction();

			if (!tx.gas) {
				console.error("Gas object is not set correctly");
			}

			tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::inference::run`,
				arguments: [
					tx.pure.vector('u64', input_mag),
					tx.pure.vector('u64', input_sign),
					tx.pure.u64(scale),
				],
			})

			console.log("Executing transaction block..."); 
			keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
			result = await client.signAndExecuteTransaction({
				transaction: tx,
				signer: keypair,
				options: {
					showEffects: true,
					showEvents: true,
					showObjectChanges: true,
				}
			})

			console.log(result);
			break;

		case "compute_2":
			// compute2();
			
			index = 0;
			for (let i = 0; i<2; i++) {
				console.log(index, index+7)
				tx = new Transaction();

				if (!tx.gas) {
					console.error("Gas object is not set correctly");
				}
				
				tx.moveCall({
					target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_chunk`,
					arguments: [
						tx.object(SignedFixedGraph),
						tx.object(PartialDenses),
						tx.pure.string('dense1'),
						tx.pure.vector('u64', input_mag),
						tx.pure.vector('u64', input_sign),
						tx.pure.u64(1),
						tx.pure.u64(index),
						tx.pure.u64(index+7),
					],
				})
				index += 8

				console.log("Executing transaction block..."); 
				keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
				result = await client.signAndExecuteTransaction({
					transaction: tx,
					signer: keypair,
					options: {
						showEffects: true,
						showEvents: true,
						showObjectChanges: true,
					}
				})

				console.log(result);
			}
			break;
			
		case "compute_16":
			// compute8();

			index = 0;
			for (let i = 0; i<16; i++) {
				console.log(index, index)
				tx = new Transaction();

				if (!tx.gas) {
					console.error("Gas object is not set correctly");
				}
				
				tx.moveCall({
					target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_chunk`,
					arguments: [
						tx.object(SignedFixedGraph),
						tx.object(PartialDenses),
						tx.pure.string('dense1'),
						tx.pure.vector('u64', input_mag),
						tx.pure.vector('u64', input_sign),
						tx.pure.u64(1),
						tx.pure.u64(index),
						tx.pure.u64(index),
					],
				})
				index += 1

				console.log("Executing transaction block..."); 
				keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
				result = await client.signAndExecuteTransaction({
					transaction: tx,
					signer: keypair,
					options: {
						showEffects: true,
						showEvents: true,
						showObjectChanges: true,
					}
				})

				console.log(result);
			}
			break;

		case "finalize_activation":
			// finalize();
			tx = new Transaction();

			if (!tx.gas) {
				console.error("Gas object is not set correctly");
			}

			let res_act1 = tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_finalize`,
				arguments: [
					// tx.object(SignedFixedGraph),
					tx.object(PartialDenses),
					tx.pure.string('dense1'),
				],
			})

			let res_act2 = tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_2`,
				arguments: [
					tx.object(SignedFixedGraph),
					res_act1[0],
					res_act1[1],
					res_act1[2],
				],
			})

			tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_3`,
				arguments: [
					tx.object(SignedFixedGraph),
					res_act2[0],
					res_act2[1],
					res_act2[2],
				],
			})

			console.log("Executing transaction block..."); 
			keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
			result = await client.signAndExecuteTransaction({
				transaction: tx,
				signer: keypair,
				options: {
					showEffects: true,
					showEvents: true,
					showObjectChanges: true,
				}
			})

			console.log(result);
			break;
		
		case "allptb":
			// finalize();
			tx = new Transaction();

			if (!tx.gas) {
				console.error("Gas object is not set correctly");
			}

			let ptb_res1 = tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_1`,
				arguments: [
					tx.object(SignedFixedGraph),
					tx.pure.vector('u64', input_mag),
					tx.pure.vector('u64', input_sign),
					tx.pure.u64(scale),
				],
			})

			let ptb_res2 = tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_2`,
				arguments: [
					tx.object(SignedFixedGraph),
					ptb_res1[0],
					ptb_res1[1],
					ptb_res1[2],
				],
			})

			tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_3`,
				arguments: [
					tx.object(SignedFixedGraph),
					ptb_res2[0],
					ptb_res2[1],
					ptb_res2[2],
				],
			})

			console.log("Executing transaction block..."); 
			keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
			result = await client.signAndExecuteTransaction({
				transaction: tx,
				signer: keypair,
				options: {
					showEffects: true,
					showEvents: true,
					showObjectChanges: true,
				}
			})

			console.log(result);
			break;
			
		default:
			console.log(`알 수 없는 명령어: '${command}'`);
		}
	}
  }

  
  // 프로그램 시작
  waitForCommand();











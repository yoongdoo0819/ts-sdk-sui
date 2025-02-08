import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHex } from '@mysten/bcs';
import promptSync from 'prompt-sync';
import ora from "ora";

const prompt = promptSync();

const network = "devnet";
const TENSROFLOW_SUI_PACKAGE_ID = '0x0e12ab2ac23e95ba1abf662c7a6ec0caf874104eabbc88e46828a412f66cff7e';
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

const rpcUrl = getFullnodeUrl(network);
const client = new SuiClient({ url: rpcUrl });

let SignedFixedGraph = "";
let PartialDenses = "";
let totalGasUsage = 0;

// async function main() {
if (!PRIVATE_KEY) {
	console.error("Please provide a PRIVATE_KEY in .env file");
}

async function store(digest_arr, partialDenses_digest_arr, version_arr) {
	try {
		const response = await fetch('http://localhost:8083/store', {
			method: 'POST', 
			headers: { 'Content-Type': 'application/json' }, 
			body: JSON.stringify({ digestArr: digest_arr, partialDensesDigestArr: partialDenses_digest_arr, versionArr: version_arr }) // JSON 데이터 변환
		  });
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('API Call Err:', error)
		return "";
	}
}
 
async function run() {

	let keypair;
	let result;

	let tx_digest_arr = [];
	let partialDenses_digest_arr = [];
	let version_arr = [];

	while (true) {
		const command = prompt(">> Please enter your command : ");

		switch (command.trim().toLowerCase()) {
		case "init":
			console.log("\nInitializing... \n");
			let tx = new Transaction();

			if (!tx.gas) {
				console.error("Gas object is not set correctly");
			}

			tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::inference_ptb::initialize`,
			})

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

			for (let i=0; i < result['objectChanges'].length; i++) {

				let parts;
				let exist;
				
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

			console.log("SignedFixedGraph:", SignedFixedGraph);
			console.log("PartialDenses:", PartialDenses);

			console.log("Gas Used:", Number(result.effects.gasUsed.computationCost) + Number(result.effects.gasUsed.storageCost) + Number(result.effects.gasUsed.storageRebate));
			console.log("");
			break;
			
		case "run":
			console.log('\nProcessing 16-partitioned Dense layers... \n');

			let totalTasks = 16
			let spinner;
			
			for (let i = 0; i<totalTasks; i++) {

				const filledBar = '█'.repeat(i+1);  
				const emptyBar = '░'.repeat(totalTasks - i - 1); 
				const progressBar = filledBar + emptyBar; // total progress bar
				
				let tx = new Transaction();

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
						tx.pure.u64(i),
						tx.pure.u64(i),
					],
				})

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

				spinner = ora("Processing task... ").start();
				console.log(progressBar + ` ${i+1}/${totalTasks}`);

				for (let i=0; i < result['objectChanges'].length; i++) {

					let parts;
					let exist;
					
					parts = result['objectChanges'][i]["objectType"].split("::");
					exist = parts.some(part => part.includes("PartialDenses"));
					if (exist == true) {
						partialDenses_digest_arr.push(result['objectChanges'][i]["digest"]);
						version_arr.push(result['objectChanges'][i]["version"]);
					}
				}
				
				tx_digest_arr.push(result.digest)
				console.log("Tx Digest:", result.digest)

				console.log("Gas Used:", Number(result.effects.gasUsed.computationCost) + Number(result.effects.gasUsed.nonRefundableStorageFee));
				console.log("");
				totalGasUsage += Number(result.effects.gasUsed.computationCost) + Number(result.effects.gasUsed.nonRefundableStorageFee)
			}

			spinner.succeed("✅ Task completed!");
			console.log("");
			break;
			
		case "finalize":
			console.log('\nFinalize... \n');
			let final_tx = new Transaction();

			if (!final_tx.gas) {
				console.error("Gas object is not set correctly");
			}

			let res_act1 = final_tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_finalize`,
				arguments: [
					final_tx.object(PartialDenses),
					final_tx.pure.string('dense1'),
				],
			})

			let res_act2 = final_tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_2`,
				arguments: [
					final_tx.object(SignedFixedGraph),
					res_act1[0],
					res_act1[1],
					res_act1[2],
				],
			})

			final_tx.moveCall({
				target: `${TENSROFLOW_SUI_PACKAGE_ID}::model_ptb::ptb_graph_3`,
				arguments: [
					final_tx.object(SignedFixedGraph),
					res_act2[0],
					res_act2[1],
					res_act2[2],
				],
			})

			keypair = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));
			result = await client.signAndExecuteTransaction({
				transaction: final_tx,
				signer: keypair,
				options: {
					showEffects: true,
					showEvents: true,
					showObjectChanges: true,
				}
			})

			for (let i=0; i < result['objectChanges'].length; i++) {

				let parts;
				let exist;
				
				parts = result['objectChanges'][i]["objectType"].split("::");
				exist = parts.some(part => part.includes("PartialDenses"));
				if (exist == true) {
					partialDenses_digest_arr.push(result['objectChanges'][i]["digest"]);
					version_arr.push(result['objectChanges'][i]["version"]);
				}
			}
			
			tx_digest_arr.push(result.digest)
			console.log("\nTx Digest:", result.digest)

			console.log("Gas Used: ", Number(result.effects.gasUsed.computationCost) + Number(result.effects.gasUsed.nonRefundableStorageFee));
			totalGasUsage += Number(result.effects.gasUsed.computationCost) + Number(result.effects.gasUsed.nonRefundableStorageFee)

			console.log("\nresult:", result.events[0].parsedJson['value']);
			console.log("Total Gas Used:", totalGasUsage)

			console.log(totalGasUsage / Number(MIST_PER_SUI));


			const data = await store(tx_digest_arr, partialDenses_digest_arr, version_arr);
			if (data.status === "success") {
				console.log("\n***** Walrus Store Success *****");
				console.log("BlobID:", data.blobId);
				console.log("");
			}

			totalGasUsage = 0;
			tx_digest_arr = [];
			partialDenses_digest_arr = [];
			version_arr = [];

			break;
			
		default:
			console.log(`Unknown command: '${command}'`);
		}
	}
  }

// start program
const letters = {
    "O": [
        " /---\\ ",
        "|     |",
        "|     |",
        " \\---/ "
    ],
    "P": [
        "|----\\ ",
        "|     |",
        "|----/ ",
        "|      "
    ],
    "E": [
        "|------",
        "|      ",
        "|----- ",
        "|------"
    ],
    "N": [
        "|\\    |",
        "| \\   |",
        "|  \\  |",
        "|   \\ |"
    ],
    "G": [
        " /----\\ ",
        "|       ",
        "|   ---|",
        " \\----/ "
    ],
    "R": [
        "|----\\ ",
        "|     |",
        "|----/ ",
        "|    \\ "
    ],
    "A": [
        "  /\\  ",
        " /  \\ ",
        "/----\\",
        "|    |"
    ],
    "P": [
        "|----\\ ",
        "|     |",
        "|----/ ",
        "|      "
    ],
    "H": [
        "|    |",
        "|----|",
        "|    |",
        "|    |"
    ]
};

function printBanner(text) {
    let output = ["", "", "", ""];

    for (let char of text) {
        if (letters[char]) {
            letters[char].forEach((line, i) => {
                output[i] += line + "  ";
            });
        }
    }

    console.log(output.join("\n"));
	console.log("\n\n");
}

printBanner("OPENGRAPH");
run();

  






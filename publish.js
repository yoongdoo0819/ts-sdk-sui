import path from 'path';
import { execSync } from 'child_process';
import { getFullnodeUrl, SuiClient, } from '@mysten/sui/client';
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from '@mysten/sui/transactions';
import { fromHex } from '@mysten/sui/utils';

const PRIVATE_KEY = "";
const client = new SuiClient({ url: getFullnodeUrl('devnet') });
const signer = Ed25519Keypair.fromSecretKey(fromHex(PRIVATE_KEY));

const contractURI = path.resolve("./sui");
console.log(contractURI)
console.log("Working Directory:", process.cwd());

const { modules, dependencies } = JSON.parse(
    // --dump-bytecode-as-base64 --path ${contractURI}`
  execSync(`sui move build --dump-bytecode-as-base64 --path ${contractURI}`, {
    encoding: 'utf-8',
  })
    // execSync(`sui move build --path ${contractURI}`)
);
console.log("build!");

const tx = new Transaction();
tx.setSender(signer.getPublicKey().toSuiAddress());
tx.setGasBudget(1000000000);
const upgradeCap = tx.publish({ modules, dependencies });
tx.transferObjects([upgradeCap], signer.getPublicKey().toSuiAddress());

const txBytes = await tx.build({ client });
const signature = (await signer.signTransaction(txBytes)).signature;

const simulationResult = await client.dryRunTransactionBlock({ transactionBlock: txBytes });
if (simulationResult.effects.status.status === "success") {
  const result = await client.executeTransactionBlock({
    transactionBlock: txBytes,
    signature,
    options: {
      showEffects: true,
    }
  });
  console.log("Result: ", result);
}
else {
  console.log("Simulation failed: ", simulationResult);
}
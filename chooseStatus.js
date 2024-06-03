const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');
const Web3 = require('web3');
const others = require('./Others.js');

const contractJsonPath = path.resolve(__dirname, '../../','contracts','electionsSC.json');
const contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
const contractAbi = contractJson.abi;

// RPCNODE details
const { tessera, besu } = require("../keys.js");
const { register } = require('module');
const host = besu.rpcnode.url;
const accountPrivateKey = besu.rpcnode.accountPrivateKey;

const provider = new ethers.JsonRpcProvider(host);
const wallet = new ethers.Wallet(accountPrivateKey, provider);

// Create a Web3 instance connected to your node
const web3 = new Web3(new Web3.providers.HttpProvider(host));

async function find_SC_Adress(){
    const blockNumber = await web3.eth.getBlockNumber(); //Get most recent block number
    var foundSC = false;
    var tx_hash=0;
    for(let k = 0; k <= blockNumber; k++){
      const block = await web3.eth.getBlock(k); //Get block object by number
      const hash = block.hash;
      const numberTx = await web3.eth.getBlockTransactionCount(hash);
  
      if(numberTx > 0){
        for(let i = 0; i < numberTx; i++){
          const txfound = await web3.eth.getTransactionFromBlock(hash, i);
          //console.log("found TX" + txfound);
          if(txfound.to === null){
            tx_hash = txfound.hash;
            //console.log(tx_hash);
            foundSC = true;
          }
        }
      }
      if(foundSC){
        break;
      }
    }
    const receipt = await web3.eth.getTransactionReceipt(tx_hash);
    return receipt.contractAddress;
}

async function statusToCounting(contractWithSigner){
    return await contractWithSigner.statusCounting();
}

async function statusToVoting(contractWithSigner){
    return await contractWithSigner.statusVoting();
}

async function main(){
    const sc_address = await find_SC_Adress();

    const contract = new ethers.Contract(sc_address, contractAbi, provider);
    const contractWithSigner = contract.connect(wallet);

    const tx_status = await statusToCounting(contractWithSigner); //Change Status Here <<<<<<<<<<<<<<<<<<<
    await tx_status.wait();
    const status= await others.getCurrentStatus(contractWithSigner);
    console.log("Current Status: " + status);
}

if (require.main === module) {
    main();
    }
    

module.exports = exports = main
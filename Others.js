const path = require('path');
const fs = require('fs-extra');
var ethers = require('ethers');


async function getCurrentStatus(contractWithSigner){
    const tx = await contractWithSigner.getCurrentStatus();
    return tx;
}

async function statusToVoting(contractWithSigner){
    return await contractWithSigner.statusVoting();
}

async function statusToCounting(contractWithSigner){
    return await contractWithSigner.statusCounting();
}


module.exports.getCurrentStatus = getCurrentStatus;
module.exports.statusToVoting = statusToVoting;
module.exports.statusToCounting = statusToCounting;

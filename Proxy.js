var ethers = require('ethers');

var stop = false;

var list = []
var clock = false;
var timedout = false;

async function send_to_proxy(vote){
    list.push(vote);
    console.log("Vote added to proxy.");
}

async function Start(deployedContractAddress, deployedContractAbi, provider, wallet){
    while(true){

     if(list.length == 0){
        //console.log("Proxy: waiting for votes...");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay (adjust as needed)

     } else if (list.length >= 3) {
        list = shuffle(list);
        const votesToSend = list.splice(0, 3); // Get the first 3 votes

        // Send votes concurrently (consider network and gas costs)
        //const txPromises = votesToSend.map(async (vote) => {
          //const tx = await send_to_network(deployedContractAddress, deployedContractAbi, provider, wallet, vote);
          //return tx;
        //});

        for(let i=0; i<votesToSend.length;i++){
            await send_to_network(deployedContractAddress, deployedContractAbi, provider, wallet, votesToSend[i]);
        }
  
        const sentTxs = await Promise.all(txPromises); // Wait for all votes to be sent
        console.log("Proxy: Registered votes:", sentTxs); // Log the sent transactions
      } else if(timedout){
            list = shuffle(list);
            const toSend = list;
            // Send votes concurrently (consider network and gas costs)
            const txPromises = toSend.map(async (vote) => {
                await send_to_network(deployedContractAddress, deployedContractAbi, provider, wallet, vote);
            });

            const sentTxs = await Promise.all(txPromises); // Wait for all votes to be sent
            console.log("Proxy timedout: Registered votes:", sentTxs); // Log the sent transactions
            timedout = false;
            clock=false;
      } else if(clock) {
        countDown(30);
        clock=true;
      }

      if(stop){
        break;
      }

    }
    console.log("Proxy stopped (internal loop terminated).");
}

async function Stop(){
    stop=true;
}


async function send_to_network(deployedContractAddress, deployedContractAbi, provider, wallet, vote){
    console.log("Entered send_to_network");

    const contract = new ethers.Contract(deployedContractAddress, deployedContractAbi, provider);
    const contractWithSigner = contract.connect(wallet);

    const tx = await contractWithSigner.addVote(vote);
    // verify the updated value
    await tx.wait();
    // const res = await contract.get();
    // console.log("Obtained value at deployed contract is: "+ res);
    return tx;
}

function countDown(seconds) {
    console.log("Timer started...");
    setTimeout(() => {
      timedout=true;
    }, seconds * 1000); // Convert seconds to milliseconds for delay
  }

function shuffle(list) {
  const shuffledList = list.slice();
  for (let i = shuffledList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index between 0 and i
    [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]]; // Swap elements
  }
  return shuffledList;
}

module.exports.Start = Start;
module.exports.send_to_proxy = send_to_proxy;
module.exports.Stop = Stop;
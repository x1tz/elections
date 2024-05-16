var ethers = require('ethers');

var stop = false;

var list = []
var clock = false;
var timedout = false;

async function send_to_proxy(deployedContractAddress, deployedContractAbi, provider, wallet, vote){
    list.push(vote);
    console.log("Vote added to proxy.");
    
    if (list.length >= 3) {
      list = shuffle(list);
      const votesToSend = list.splice(0, list.length);
  
      for(let i=0; i<votesToSend.length;i++){
          const tx = await send_to_network(deployedContractAddress, deployedContractAbi, provider, wallet, votesToSend[i]);
          await tx.wait();
          console.log("Proxy: Registered vote:", tx); // Log the sent transactions
      }
    }

}

async function Start(deployedContractAddress, deployedContractAbi, provider, wallet){
    while(true){

      if (list.length >= 3) {
        list = shuffle(list);
        const votesToSend = list.splice(0, list.length);

        for(let i=0; i<votesToSend.length;i++){
            const tx = await send_to_network(deployedContractAddress, deployedContractAbi, provider, wallet, votesToSend[i]);
            await tx.wait();
            console.log("Proxy: Registered vote:", tx); // Log the sent transactions
        }
      } else if(timedout){
          list = shuffle(list);
          const votesToSend = list.splice(0, list.length);

          for(let i=0; i<votesToSend.length;i++){
            const tx = await send_to_network(deployedContractAddress, deployedContractAbi, provider, wallet, votesToSend[i]);
            await tx.wait();
            console.log("Proxy: Registered vote:", tx); // Log the sent transactions
          }
          timedout = false;
          clock=false;
        } else if(!clock) {
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
  let remainingTime = seconds;
  const intervalId = setInterval(() => {
    console.log(remainingTime + " seconds remaining...");
    remainingTime--;
    if (remainingTime <= 0) {
      clearInterval(intervalId);
      console.log("Time's up!");
      timedout = true; // (Optional: Add a flag if needed)
    }
  }, 1000); // Update every second
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
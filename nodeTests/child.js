var list = [];

function sendMessageToMain(data) {
    if (process.send) {
      process.send(data);
    } else {
      console.error("No parent process to send message to.");
    }
}

async function addToList(data){
    list.push(data);
}

async function read(){
    return list.length;
}

async function main(){
    
    process.on("message", (msg) => {
        addToList(msg.vote)
        sendMessageToMain("OK"); // Send processed data back to main
      });
    
    setInterval(() => {
        console.log("List:", list.length);
    }, 2000);
}

if (require.main === module) {
    main();
}
  
module.exports = exports = main
module.exports.addToList = addToList;
module.exports.read = read;





const { fork } = require("child_process");


async function main(){
  const child = fork("./child.js"); // Fork the worker process

  child.on("message", (msg) => {
    console.log("Message from child:", msg);
  });

  child.on("error", (err) => {
    console.error("Child process error:", err);
  });

  child.on("close", (code) => {
    console.log("Child process exited with code:", code);
  });

  let contract = "123";

  // Send data as messages (replace with your actual logic)

  setInterval(() => {
    console.log("sending to list");
    child.send({vote: "1"});
  }, 3000);


}

if (require.main === module) {
  main();
}

module.exports = exports = main




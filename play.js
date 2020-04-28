const child_process = require("child_process");

process.on("message", (runFFplayCommand) => {
  process.send(true);
  child_process.execSync(runFFplayCommand);
});

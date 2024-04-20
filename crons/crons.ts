import sendBackup from "./sendBackup.ts";

// Every day at 7am
Deno.cron("Send backup", "0 7 * * *", sendBackup);

console.log("Crons started");

import { BUILDING } from "../env.ts";
import sendBackup from "./sendBackup.ts";

if (!BUILDING) {
  // Every day at 7am
  Deno.cron("Send backup", "0 7 * * *", sendBackup);

  console.log("Crons started");
}

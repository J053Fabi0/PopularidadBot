import backupCommand from "../telegram/composers/commandsHandler/backupCommand.ts";

export default async function sendBackup() {
  await backupCommand();
}

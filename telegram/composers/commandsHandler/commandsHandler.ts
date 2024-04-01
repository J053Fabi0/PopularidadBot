import setCommand from "./setCommand.ts";
import { Composer } from "grammy/mod.ts";
import topCommand from "./topCommand.ts";
import backupCommand from "./backupCommand.ts";
import onlyGroups from "../../filters/onlyGroups.ts";
import onlyAdmin from "../../middlewares/onlyAdmin.ts";
import onlyPrivate from "../../filters/onlyPrivate.ts";

const commandsHandler = new Composer();

commandsHandler.filter(onlyGroups).command(
  "set",
  onlyAdmin((cxt) => cxt.reply("Tú no eres un administrador.")),
  setCommand
);

commandsHandler.filter(onlyGroups).command("top", topCommand);

commandsHandler.filter(onlyPrivate).command("backup", backupCommand);

export default commandsHandler;

import setCommand from "./setCommand.ts";
import { Composer } from "grammy/mod.ts";
import topCommand from "./topCommand.ts";
import onlyGroups from "../../filters/onlyGroups.ts";
import onlyAdmin from "../../middlewares/onlyAdmin.ts";

const commandsHandler = new Composer();

commandsHandler.filter(onlyGroups).command(
  "set",
  onlyAdmin((cxt) => cxt.reply("Tú no eres un administrador.")),
  setCommand
);

commandsHandler.filter(onlyGroups).command("top", topCommand);

export default commandsHandler;

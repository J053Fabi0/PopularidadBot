import setCommand from "./setCommand.ts";
import { Composer } from "grammy/mod.ts";
import onlyAdmin from "./middlewares/onlyAdmin.ts";

const commandsHandler = new Composer();

commandsHandler.command(
  "set",
  onlyAdmin((cxt) => cxt.reply("Tú no eres un administrador.")),
  setCommand
);

export default commandsHandler;

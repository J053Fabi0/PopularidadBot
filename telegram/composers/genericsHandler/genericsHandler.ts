import { Composer } from "grammy/mod.ts";
import fileHandler from "./fileHandler.ts";
import onlyPrivate from "../../filters/onlyPrivate.ts";

const genericsHandler = new Composer();

genericsHandler.filter(onlyPrivate).on("message:file", fileHandler);

genericsHandler.callbackQuery("void", (ctx) => ctx.answerCallbackQuery());
genericsHandler.on("callback_query", (ctx) => ctx.answerCallbackQuery({ text: "Botón desconocido" }));

export default genericsHandler;

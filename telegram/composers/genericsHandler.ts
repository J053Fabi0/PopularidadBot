import { Composer } from "grammy/mod.ts";

const genericsHandler = new Composer();

genericsHandler.callbackQuery("void", (ctx) => ctx.answerCallbackQuery());
genericsHandler.on("callback_query", (ctx) => ctx.answerCallbackQuery({ text: "Botón desconocido" }));

export default genericsHandler;

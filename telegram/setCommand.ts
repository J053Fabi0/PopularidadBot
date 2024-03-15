import "humanizer/toQuantity.ts";
import { escapeHtml } from "escapeHtml";
import { CommandContext, Context } from "grammy/mod.ts";
import { getPoints, changePoints } from "../data/controllers/userPointsInGroupController.ts";

function wrongUssage(ctx: CommandContext<Context>) {
  ctx.reply(
    "Responde a un mensaje para establecer sus puntos o se establecerán para ti. Ejemplo: <code>/set 10</code>",
    { parse_mode: "HTML" }
  );
}

export default async function setCommand(ctx: CommandContext<Context>) {
  if (!ctx.message) return wrongUssage(ctx);

  const newPoints = parseInt(ctx.message.text.split(" ")[1]);
  if (isNaN(newPoints)) return wrongUssage(ctx);

  if (Math.abs(newPoints) > 1_000_000_000) return ctx.reply("¿Estás loco? Nadie puede tener tantos puntos.");

  const chatId = ctx.chat.id;
  const repliedToUserId: number = ctx.message.reply_to_message?.from?.id || ctx.from.id;
  const repliedToUserName: string = escapeHtml(
    ctx.message.reply_to_message?.from?.first_name || ctx.from.first_name
  );

  const oldPoints = await getPoints(chatId, repliedToUserId);
  await changePoints(chatId, repliedToUserId, newPoints - oldPoints);

  ctx.reply(
    `<b>${repliedToUserName}</b> pasó de tener ${"punto".toQuantity(oldPoints)} ` +
      `a tener ${"punto".toQuantity(newPoints)}.`,
    { parse_mode: "HTML" }
  );
}

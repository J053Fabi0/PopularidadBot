import "humanizer/toQuantity.ts";
import { escapeHtml } from "escapeHtml";
import { Context, Filter, HearsContext } from "grammy/mod.ts";
import { changePoints, getPoints } from "../data/controllers/userPointsInGroupController.ts";

export default async function handlePoints(
  ctx: HearsContext<Context> | Filter<Context, "message:sticker">,
  points: number
) {
  const groupId = ctx.chat.id;

  const userId = ctx.from!.id;
  const userName = escapeHtml(ctx.from!.first_name);

  const repliedToUserId = ctx.message!.reply_to_message!.from!.id;
  const repliedToUserName = escapeHtml(ctx.message!.reply_to_message!.from!.first_name);

  const userPoints = await getPoints(groupId, userId);
  const repliedToPoints = await changePoints(groupId, repliedToUserId, points);

  await ctx.reply(
    `<b>${userName} (${userPoints})</b> le ${points > 0 ? "aumentó" : "quitó"} ` +
      `${"punto".toQuantity(Math.abs(points))} a <b>${repliedToUserName} (${repliedToPoints})</b>.`,
    { parse_mode: "HTML" }
  );
}

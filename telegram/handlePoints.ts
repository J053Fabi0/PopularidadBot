import "humanizer/toQuantity.ts";
import { Context, HearsContext } from "grammy/mod.ts";
import { changePoints, getPoints } from "../data/controllers/userPointsInGroupController.ts";

export default async function handlePoints(ctx: HearsContext<Context>, points: number) {
  if (!ctx.message) return;
  if (!ctx.message.reply_to_message) return;
  if (!ctx.message.reply_to_message.from) return;
  // No private chats
  if (ctx.message.chat.type === "private") return;
  // No points to bots
  if (ctx.message.reply_to_message.from.is_bot) return;
  // No points to self
  if (ctx.message.from.id === ctx.message.reply_to_message.from.id) return;

  const groupId = ctx.chat.id;

  const userId = ctx.from.id;
  const userName = ctx.from.first_name;

  const repliedToUserId = ctx.message.reply_to_message.from.id;
  const repliedToUserName = ctx.message.reply_to_message.from.first_name;

  const userPoints = await getPoints(groupId, userId);
  const repliedToPoints = await changePoints(groupId, repliedToUserId, points);

  await ctx.reply(
    `${userName} (${userPoints}) le ${points > 0 ? "aumentó" : "quitó"} ` +
      `${"punto".toQuantity(Math.abs(points))} a ${repliedToUserName} (${repliedToPoints})`
  );
}

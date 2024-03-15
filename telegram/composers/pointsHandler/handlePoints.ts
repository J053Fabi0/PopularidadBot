import "humanizer/toQuantity.ts";
import { escapeHtml } from "escapeHtml";
import db from "../../../data/database.ts";
import { Context, Filter, HearsContext } from "grammy/mod.ts";
import { changePoints, getPoints } from "../../../data/controllers/userPointsInGroupController.ts";

type Contexts = HearsContext<Context> | Filter<Context, "message:sticker"> | Filter<Context, "message_reaction">;

async function getUserId(ctx: Contexts): Promise<number | null> {
  if (ctx.message?.reply_to_message?.from?.id) return ctx.message?.reply_to_message?.from?.id;

  if (!ctx.update.message_reaction) return null;

  const userMessage = await db.userMessageId.findByPrimaryIndex("messageAndGroupId", [
    ctx.update.message_reaction.message_id,
    ctx.update.message_reaction.chat.id,
  ]);
  if (!userMessage) return null;

  return userMessage.value.userId;
}

async function getUserName(ctx: Contexts, userId: number): Promise<string | null> {
  if (ctx.message?.reply_to_message?.from?.first_name) return ctx.message.reply_to_message.from.first_name;

  if (!ctx.update.message_reaction) return "";

  const user = await db.userName.findByPrimaryIndex("userId", userId);
  if (!user) return null;

  return user.value.userName;
}

export default async function handlePoints(ctx: Contexts, points: number) {
  const groupId = ctx.update.message_reaction?.chat.id ?? ctx.chat?.id;
  if (!groupId) return;

  const userId = ctx.from!.id;
  const userName = escapeHtml(ctx.from!.first_name);

  const repliedToUserId = await getUserId(ctx);
  if (repliedToUserId === null) return;
  const repliedToUserName = await getUserName(ctx, repliedToUserId);
  if (repliedToUserName === null) return;

  if (userId === repliedToUserId) return;

  const userPoints = await getPoints(groupId, userId);
  const repliedToPoints = await changePoints(groupId, repliedToUserId, points);

  await ctx.reply(
    `<b>${userName} (${userPoints})</b> le ${points > 0 ? "aumentó" : "quitó"} ` +
      `${"punto".toQuantity(Math.abs(points))} a <b>${escapeHtml(repliedToUserName)} (${repliedToPoints})</b>.`,
    { parse_mode: "HTML" }
  );
}

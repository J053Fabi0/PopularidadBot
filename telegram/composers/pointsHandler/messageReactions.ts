import bot from "../../initBot.ts";
import db from "../../../data/database.ts";
import handlePoints from "./handlePoints.ts";
import { Context, Filter } from "grammy/mod.ts";
import { ReactionTypeEmoji } from "grammy/types.ts";

const likeEmojis: ReactionTypeEmoji["emoji"][] = ["👍", "🆒", "👌", "🥰", "❤‍🔥", "👏", "💘", "💯", "😍", "🤩"];
const dislikeEmojis: ReactionTypeEmoji["emoji"][] = ["👎", "💩", "🖕", "😡", "🤬"];

export default async function messageReactions(ctx: Filter<Context, "message_reaction">) {
  const { emoji, emojiAdded, emojiRemoved } = ctx.reactions();
  if (emoji.length >= 2) return;
  // this means it was a custom emoji
  if (emojiAdded.length === 0 && emojiRemoved.length === 0) return;

  let pointsToAdd = 0; // Positive to add, negative to remove
  let pointsToRemove = 0; // Positive to add, negative to remove
  if (likeEmojis.some((emoji) => emojiAdded.includes(emoji))) pointsToAdd++;
  if (dislikeEmojis.some((emoji) => emojiAdded.includes(emoji))) pointsToAdd--;
  if (likeEmojis.some((emoji) => emojiRemoved.includes(emoji))) pointsToRemove--;
  if (dislikeEmojis.some((emoji) => emojiRemoved.includes(emoji))) pointsToRemove++;

  if (pointsToAdd !== 0)
    await handlePoints(ctx, Math.max(-1, Math.min(1, pointsToAdd)), {
      byEmoji: emojiAdded[0],
      replyTo: ctx.update.message_reaction.message_id,
    });
  //
  else if (pointsToRemove !== 0) {
    const reaction = await db.messageReaction.findByPrimaryIndex("messageAndGroupId", [
      ctx.update.message_reaction.message_id,
      ctx.update.message_reaction.chat.id,
    ]);
    if (!reaction || reaction.value.byEmoji !== emojiRemoved[0]) return;
    await bot.api
      .deleteMessage(ctx.update.message_reaction.chat.id, reaction.value.botReplyId)
      .catch(console.error);
    await db.messageReaction.delete(reaction.id);
    await handlePoints(ctx, Math.max(-1, Math.min(1, pointsToRemove)), { sendMessage: false });
  }
}

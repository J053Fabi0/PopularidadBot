import { Document } from "kvdex";
import bot from "../../initBot.ts";
import db from "../../../data/database.ts";
import handlePoints from "./handlePoints.ts";
import { Context, Filter } from "grammy/mod.ts";
import { ReactionTypeEmoji } from "grammy/types.ts";
import MessageReaction from "../../../types/messageReaction.type.ts";

const likeEmojis: ReactionTypeEmoji["emoji"][] = [
  "👍",
  "🆒",
  "👌",
  "🥰",
  "❤‍🔥",
  "❤",
  "👏",
  "💘",
  "💯",
  "😍",
  "🤩",
];
const dislikeEmojis: ReactionTypeEmoji["emoji"][] = ["👎", "💩", "🖕", "😡", "🤬"];

function getReactionPoints(reaction: Document<MessageReaction> | null): null | number {
  if (!reaction || !reaction.value.byEmoji) return null;
  if (likeEmojis.includes(reaction.value.byEmoji)) return 1;
  if (dislikeEmojis.includes(reaction.value.byEmoji)) return -1;
  return null;
}

export default async function messageReactions(ctx: Filter<Context, "message_reaction">) {
  if (!ctx.update.message_reaction.user) return;

  const { emojiAdded: emojisAdded, emojiRemoved: emojisRemoved } = ctx.reactions();
  const [emojiAdded] = emojisAdded;
  const [emojiRemoved] = emojisRemoved;

  // this means it was a custom emoji
  if (!emojiAdded && !emojiRemoved) return;

  const fromId = ctx.update.message_reaction.user.id;
  const groupId = Math.abs(ctx.update.message_reaction.chat.id);
  const repliedToMessageId = ctx.update.message_reaction.message_id;
  const prevReaction = await db.messageReaction.findByPrimaryIndex("messageFromIdAndGroupId", [
    repliedToMessageId,
    fromId,
    groupId,
  ]);
  const prevReactionPoints = getReactionPoints(prevReaction);

  // If there is a reaction, but it doesn't have a reaction emoji, it was an action that cannot be modified
  if (prevReaction && prevReactionPoints === null) return;

  let reactionAdded = likeEmojis.includes(emojiAdded) ? 1 : dislikeEmojis.includes(emojiAdded) ? -1 : 0;
  const reactionTaken = likeEmojis.includes(emojiRemoved) ? 1 : dislikeEmojis.includes(emojiRemoved) ? -1 : 0;

  // A positive reaction was added
  if (reactionAdded === 1) {
    // The previous reaction was also positive
    if (prevReactionPoints === 1) {
      // Update the reaction in the database and return
      await db.messageReaction.update(prevReaction!.id, { byEmoji: emojiAdded });
      return;
    }
    // The previous reaction was negative
    else if (prevReactionPoints === -1) {
      // delete the negative reaction from the database, and delete the bot's reply
      await db.messageReaction.delete(prevReaction!.id);
      await bot.api
        .deleteMessage(ctx.update.message_reaction.chat.id, prevReaction!.value.botReplyId)
        .catch(console.error);
      // give a point to compensate for the negative reaction that was removed
      reactionAdded += 1;
    }

    await handlePoints(ctx, reactionAdded, {
      pointsToShow: 1,
      byEmoji: emojiAdded,
      replyTo: ctx.update.message_reaction.message_id,
    });
  }
  // A negative reaction was added
  else if (reactionAdded === -1) {
    // The previous reaction was also negative
    if (prevReactionPoints === -1) {
      // Update the reaction in the database and return
      await db.messageReaction.update(prevReaction!.id, { byEmoji: emojiAdded });
      return;
    }
    // The previous reaction was positive
    else if (prevReactionPoints === 1) {
      // delete the positive reaction from the database, and delete the bot's reply
      await db.messageReaction.delete(prevReaction!.id);
      await bot.api
        .deleteMessage(ctx.update.message_reaction.chat.id, prevReaction!.value.botReplyId)
        .catch(console.error);
      // remove a point to compensate for the positive reaction that was removed
      reactionAdded -= 1;
    }

    await handlePoints(ctx, reactionAdded, {
      pointsToShow: -1,
      byEmoji: emojiAdded,
      replyTo: ctx.update.message_reaction.message_id,
    });
  }
  // Only a reaction was removed
  else if (prevReaction && emojiRemoved === prevReaction.value.byEmoji) {
    await bot.api
      .deleteMessage(ctx.update.message_reaction.chat.id, prevReaction.value.botReplyId)
      .catch(console.error);
    await db.messageReaction.delete(prevReaction.id);
    // Revert the points
    await handlePoints(ctx, -reactionTaken, { sendMessage: false });
  }
}

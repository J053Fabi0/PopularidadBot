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

  let points = 0;
  if (likeEmojis.some((emoji) => emojiAdded.includes(emoji))) points++;
  if (dislikeEmojis.some((emoji) => emojiAdded.includes(emoji))) points--;
  if (likeEmojis.some((emoji) => emojiRemoved.includes(emoji))) points--;
  if (dislikeEmojis.some((emoji) => emojiRemoved.includes(emoji))) points++;

  if (points !== 0) await handlePoints(ctx, Math.max(-1, Math.min(1, points)));
}

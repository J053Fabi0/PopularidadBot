import { Context } from "grammy/mod.ts";

export default function repliesTo(ctx: Context): boolean {
  if (!ctx.message) return false;
  if (!ctx.message.reply_to_message) return false;
  if (!ctx.message.reply_to_message.from) return false;
  // No private chats
  if (ctx.message.chat.type === "private") return false;
  // No points to bots
  if (ctx.message.reply_to_message.from.is_bot) return false;
  // No points to self
  if (ctx.message.from.id === ctx.message.reply_to_message.from.id) return false;

  return true;
}

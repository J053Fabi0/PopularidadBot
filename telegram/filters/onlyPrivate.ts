import { Context } from "grammy/mod.ts";

export default function onlyPrivate(ctx: Context): boolean {
  if (!ctx.message) return false;
  if (ctx.message.chat.type === "private") return true;

  return false;
}

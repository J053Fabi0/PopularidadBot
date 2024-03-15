import { Context } from "grammy/mod.ts";

export default function onlyGroups(ctx: Context): boolean {
  if (!ctx.message) return false;
  if (ctx.message.chat.type === "private") return false;

  return true;
}

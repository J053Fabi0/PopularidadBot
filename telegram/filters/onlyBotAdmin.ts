import { Context } from "grammy/mod.ts";
import { ADMIN_ID } from "../../env.ts";

export default function onlyBotAdmin(ctx: Context): boolean {
  return ctx.from?.id === ADMIN_ID;
}

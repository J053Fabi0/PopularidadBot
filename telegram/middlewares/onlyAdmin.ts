// Source: https://github.com/backmeupplz/grammy-middlewares/blob/main/src/middlewares/onlyAdmin.ts

import { ADMIN_ID } from "../../env.ts";
import { Context, NextFunction } from "grammy/mod.ts";

const onlyAdmin = (errorHandler?: (ctx: Context) => unknown) => async (ctx: Context, next: NextFunction) => {
  // No chat = no service
  if (!ctx.chat) return;

  // Channels and private chats are only postable by admins
  if (["channel", "private"].includes(ctx.chat.type)) return next();

  // Anonymous users are always admins
  if (ctx.from?.username === "GroupAnonymousBot") return next();

  // Surely not an admin
  if (!ctx.from?.id) return;

  // This is the bot owner
  if (ctx.from.id === ADMIN_ID) return next();

  // Check the member status
  const chatMember = await ctx.getChatMember(ctx.from.id);
  if (["creator", "administrator"].includes(chatMember.status)) return next();

  // Not an admin
  return errorHandler?.(ctx);
};

export default onlyAdmin;

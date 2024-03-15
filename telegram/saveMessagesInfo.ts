import db from "../data/database.ts";
import { Context, Filter, NextFunction } from "grammy/mod.ts";

export default async function saveMessagesInfo(ctx: Filter<Context, "message">, next: NextFunction) {
  if (ctx.message.chat.type !== "private") {
    await db.userMessageId.add({
      userId: ctx.from.id,
      messageAndGroupId: [ctx.message.message_id, ctx.chat.id],
    });
    const user = await db.userName.findByPrimaryIndex("userId", ctx.from.id);
    if (!user) await db.userName.add({ userId: ctx.from.id, userName: ctx.from.first_name });
    else if (user.value.userName !== ctx.from.first_name)
      await db.userName.update(user.id, { userName: ctx.from.first_name }, { strategy: "merge-shallow" });
  }
  next();
}

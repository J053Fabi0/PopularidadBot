import db from "../../../data/database.ts";
import { ADMIN_ID } from "../../../env.ts";
import { InputFile } from "grammy/types.ts";
import { CommandContext, Context } from "grammy/mod.ts";

export default async function setCommand(ctx: CommandContext<Context>) {
  if (ctx.from?.id !== ADMIN_ID) return;

  const data = ["userPointsInGroup", "userMessageId", "userName", "messageReaction"] as const;

  for (const key of data) {
    const values = (await db[key].getMany()).result.map((r) => r.value);
    const blob = new Blob([JSON.stringify(values, null, 2)], { type: "application/json" });
    await ctx.replyWithDocument(new InputFile(blob, `${key}.json`));
  }

  await ctx.reply("Backup completado.");
}

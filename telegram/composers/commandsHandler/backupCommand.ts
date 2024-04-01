import db from "../../../data/database.ts";
import { ADMIN_ID } from "../../../env.ts";
import { InputFile, InputMediaDocument } from "grammy/types.ts";
import { CommandContext, Context, InputMediaBuilder } from "grammy/mod.ts";

export const dataToBackup = ["userPointsInGroup", "userMessageId", "userName", "messageReaction"] as const;

export default async function setCommand(ctx: CommandContext<Context>) {
  if (ctx.from?.id !== ADMIN_ID) return;

  const files: InputMediaDocument[] = [];
  for (const key of dataToBackup) {
    const values = { key, value: (await db[key].getMany()).result.map((r) => r.value) };
    const blob = new Blob([JSON.stringify(values)], { type: "application/json" });
    const file = new InputFile(blob, `${key}.json`);
    const media = InputMediaBuilder.document(file, { caption: `Entries: ${values.value.length}` });
    files.push(media);
  }

  await ctx.replyWithMediaGroup(files);
}

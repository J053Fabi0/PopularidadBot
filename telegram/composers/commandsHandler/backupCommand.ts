import bot from "../../initBot.ts";
import db from "../../../data/database.ts";
import { ADMIN_ID } from "../../../env.ts";
import { InputMediaBuilder } from "grammy/mod.ts";
import { InputFile, InputMediaDocument } from "grammy/types.ts";

export const dataToBackup = ["userPointsInGroup", "userMessageId", "userName", "messageReaction"] as const;

export default async function backupCommand() {
  const files: InputMediaDocument[] = [];
  for (const key of dataToBackup) {
    const values = {
      key,
      value: (await db[key].getMany()).result.map(({ value }) => {
        const { ["__id__"]: _, ...a } = value;
        return a;
      }),
    };
    const blob = new Blob([JSON.stringify(values)], { type: "application/json" });
    const file = new InputFile(blob, `${key}.json`);
    const media = InputMediaBuilder.document(file, { caption: `Entries: ${values.value.length}` });
    files.push(media);
  }

  await bot.api.sendMediaGroup(ADMIN_ID, files);
}

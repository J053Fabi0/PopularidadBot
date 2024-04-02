import axiod from "axiod";
import db from "../../../data/database.ts";
import { Context, Filter } from "grammy/mod.ts";
import { ADMIN_ID, BOT_TOKEN } from "../../../env.ts";
import { dataToBackup } from "../commandsHandler/backupCommand.ts";

interface FileData {
  key: (typeof dataToBackup)[number];
  // deno-lint-ignore no-explicit-any
  value: any[];
}

export default async function fileHandler(ctx: Filter<Context, "message:file">) {
  if (ctx.from?.id !== ADMIN_ID) return;

  const name = ctx.message?.document?.file_name;
  if (!name) return;

  const file = await ctx.getFile();
  const { data } = await axiod.get(`https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`, {
    responseType: "arraybuffer",
  });

  // parse data to object
  const obj = JSON.parse(new TextDecoder().decode(data)) as FileData;

  await db[obj.key].deleteMany();
  const { ok } = await db[obj.key].addMany(
    obj.value.map((v) => {
      const { ["__id__"]: _, ...a } = v;
      return a;
    })
  );

  await ctx.reply(`<code>${name}: ${ok}</code>`, { parse_mode: "HTML" });
}

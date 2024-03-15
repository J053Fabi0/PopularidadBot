import { Bot } from "grammy/mod.ts";
import { BOT_TOKEN } from "../env.ts";
import handlePoints from "./handlePoints.ts";
import handleError from "../utils/handleError.ts";
import { run, sequentialize } from "grammy-runner";

const bot = new Bot(BOT_TOKEN);
export default bot;

// https://grammy.dev/plugins/runner#sequential-processing-where-necessary
bot.use(sequentialize((ctx) => [ctx.chat?.id.toString(), ctx.from?.id.toString()].filter(Boolean) as string[]));

bot.hears(/^\+\+/, (ctx) => handlePoints(ctx, 1));
bot.hears(/^--/, (ctx) => handlePoints(ctx, -1));

bot.catch(({ ctx, error }) => {
  console.error(`Error while handling update ${ctx.update.update_id}:`, error);
  ctx.reply("There was an error.");
  handleError(error);
});

run(bot);

console.log("Bot is running.");

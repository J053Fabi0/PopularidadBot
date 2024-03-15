import { Bot } from "grammy/mod.ts";
import { BOT_TOKEN } from "../env.ts";
import pointsHandler from "./composers/pointsHandler/pointsHandler.ts";
import handleError from "../utils/handleError.ts";
import { run, sequentialize } from "grammy-runner";
import commandsHandler from "./composers/commandsHandler/commandsHandler.ts";
import genericsHandler from "./composers/genericsHandler.ts";

const bot = new Bot(BOT_TOKEN);
export default bot;

// https://grammy.dev/plugins/runner#sequential-processing-where-necessary
bot.use(sequentialize((ctx) => [ctx.chat?.id.toString(), ctx.from?.id.toString()].filter(Boolean) as string[]));

bot.use(pointsHandler);
bot.use(commandsHandler);

bot.use(genericsHandler);

bot.catch(({ ctx, error }) => {
  console.error(`Error while handling update ${ctx.update.update_id}:`, error);
  ctx.reply("There was an error.");
  handleError(error);
});

run(bot);

console.log("Bot is running.");

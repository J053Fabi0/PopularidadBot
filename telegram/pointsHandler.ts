import { Composer } from "grammy/mod.ts";
import handlePoints from "./handlePoints.ts";
import repliesTo from "./filers/repliesTo.ts";

const pointsHandler = new Composer();

pointsHandler.filter(repliesTo).on("message:sticker", (ctx) => {
  const emoji = ctx.message.sticker.emoji;
  if (emoji === "👍" || emoji === "👎") handlePoints(ctx, emoji === "👍" ? 1 : -1);
});

pointsHandler.filter(repliesTo).hears(/^(\+|👍)/, (ctx) => handlePoints(ctx, 1));
pointsHandler.filter(repliesTo).hears(/^(-|—|👎)/, (ctx) => handlePoints(ctx, -1));

export default pointsHandler;

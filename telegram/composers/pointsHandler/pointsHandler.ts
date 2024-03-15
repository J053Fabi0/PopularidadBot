import { Composer } from "grammy/mod.ts";
import handlePoints from "./handlePoints.ts";
import repliesTo from "../../filters/repliesTo.ts";
import messageReactions from "./messageReactions.ts";

const pointsHandler = new Composer();

pointsHandler.on("message_reaction", messageReactions);

pointsHandler.filter(repliesTo).on("message:sticker", (ctx) => {
  const { emoji } = ctx.message.sticker;
  if (emoji === "👍" || emoji === "👎") handlePoints(ctx, emoji === "👍" ? 1 : -1);
});

pointsHandler.filter(repliesTo).hears(/^(\+|👍)/, (ctx) => handlePoints(ctx, 1));
pointsHandler.filter(repliesTo).hears(/^(-|—|👎)/, (ctx) => handlePoints(ctx, -1));

export default pointsHandler;

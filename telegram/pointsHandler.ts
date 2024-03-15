import { Composer } from "grammy/mod.ts";
import handlePoints from "./handlePoints.ts";

const pointsHandler = new Composer();

pointsHandler.hears(/^\+\+/, (ctx) => handlePoints(ctx, 1));
pointsHandler.hears(/^--/, (ctx) => handlePoints(ctx, -1));

export default pointsHandler;

import { ADMIN_ID } from "../env.ts";
import { escapeHtml } from "escapeHtml";
import bot from "../telegram/initBot.ts";
import isError from "../types/guards/isError.ts";
import isAxiodError from "../types/guards/isAxiodError.ts";

/**
 * @returns If the error was handled or ignored
 */
export default async function handleError(e: unknown): Promise<boolean> {
  console.error("#".repeat(40));
  if (typeof e === "object" && e !== null)
    for (const key of Object.getOwnPropertyNames(e)) console.error(key + ":", Reflect.get(e, key));
  console.error(e);

  // These are "Wont fix" issues
  if (isAxiodError(e)) {
    if (e.response.status === 502) return false;
    if (e.response.statusText === "Internal Server Error") return false;
  } else if (isError(e)) {
    if (e.message.includes("TOPIC_CLOSED")) return false;
    if (e.message.startsWith("error sending request for url")) return false;
    if (e.message.includes("Resource temporarily unavailable")) Deno.exit(1); // exit with error so that PM2 restarts the process
  }

  const sMessage = (message: string) =>
    bot.api.sendMessage(ADMIN_ID, `<code>${escapeHtml(message)}</code>`, { parse_mode: "HTML" });

  try {
    if (typeof e === "object" && e !== null && "message" in e && e.message) {
      await sMessage(typeof e.message === "object" ? JSON.stringify(e.message) : e.message.toString());
    } else {
      await sMessage(JSON.stringify(e));
    }
  } catch (e) {
    console.error(e);
    await bot.api.sendMessage(ADMIN_ID, "Error al enviar mensaje de Telegram.", { parse_mode: "HTML" });
  }

  return true;
}

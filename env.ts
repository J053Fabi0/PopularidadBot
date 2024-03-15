import "std/dotenv/load.ts";
export const BOT_TOKEN = Deno.env.get("BOT_TOKEN") as string;
export const ADMIN_ID: number = +Deno.env.get("ADMIN_ID")!;

if (!BOT_TOKEN) {
  console.error(new Error("BOT_TOKEN must be provided!"));
  Deno.exit(1);
}

if (!ADMIN_ID || isNaN(ADMIN_ID)) {
  console.error(new Error("ADMIN_ID must be provided!"));
  Deno.exit(1);
}

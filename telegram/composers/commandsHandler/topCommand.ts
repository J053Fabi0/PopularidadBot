import { escapeHtml } from "escapeHtml";
import db from "../../../data/database.ts";
import { CommandContext, Context } from "grammy/mod.ts";

const topEmojis = ["🥇", "🥈", "🥉"];

export default async function topCommand(ctx: CommandContext<Context>) {
  const groupId = ctx.chat.id;
  const top = (
    await db.userPointsInGroup.getMany({
      filter: (user) => user.value.groupAndUserId[0] === groupId,
    })
  ).result
    .sort((a, b) => b.value.points - a.value.points)
    .map((u) => u.value)
    .slice(0, 10);

  const users = await Promise.all(
    top.map(async (user) => {
      const userInGroup = await db.userName.findByPrimaryIndex("userId", user.groupAndUserId[1]);

      if (!userInGroup) {
        const username = await ctx.getChatMember(user.groupAndUserId[1]).catch(() => null);
        if (!username) return { user: "Usuario todavía desconocido", points: user.points };
        await db.userName.add({ userId: user.groupAndUserId[1], userName: username.user.first_name });
        return { user: username.user.first_name, points: user.points };
      }

      return { user: userInGroup.value.userName, points: user.points };
    })
  );

  let message = `Top ${"usuarios".toQuantity(users.length)}:\n`;
  const maxLength = Math.max(...users.map((u) => u.points.toString().length));
  for (let i = 0; i < users.length; i++) {
    const emoji = topEmojis[i] || " ";
    const user = users[i];
    message +=
      `<code>${user.points.toString().padEnd(maxLength)}</code><code>  </code>` +
      `${escapeHtml(user.user)} ${emoji}\n`;
  }

  ctx.reply(message, { parse_mode: "HTML" });
}

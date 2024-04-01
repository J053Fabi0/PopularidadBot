import { lodash } from "lodash";
import db from "../../data/database.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { ReactionTypeEmoji } from "grammy/types.deno.ts";
import { getPoints } from "../../data/controllers/userPointsInGroupController.ts";

interface Data {
  name: string;
  total: number;
  reactionsGiven: [ReactionTypeEmoji["emoji"], number][];
  reactionsGotten: [ReactionTypeEmoji["emoji"], number][];
}

export const handler: Handlers<Data> = {
  async GET(_, ctx) {
    const userId = +ctx.params.userId;
    const groupId = +ctx.params.groupId;

    const groupExists = await db.userMessageId.getOne({
      filter: (user) => user.value.messageAndGroupId[1] === groupId,
    });
    if (!groupExists) return ctx.renderNotFound();

    const name = await db.userName.findByPrimaryIndex("userId", userId);
    if (!name) return ctx.renderNotFound();

    const total = await getPoints(+ctx.params.groupId, userId);

    const reactionsGotten = (
      await db.messageReaction.getMany({
        filter: (reaction) =>
          Boolean(
            reaction.value.byEmoji &&
              reaction.value.toUserId === userId &&
              reaction.value.messageFromIdAndGroupId[2] === groupId
          ),
      })
    ).result;

    const reactionsGiven = (
      await db.messageReaction.getMany({
        filter: (reaction) =>
          Boolean(
            reaction.value.byEmoji &&
              reaction.value.messageFromIdAndGroupId[1] === userId &&
              reaction.value.messageFromIdAndGroupId[2] === groupId
          ),
      })
    ).result;

    return ctx.render({
      total,
      name: name.value.userName,
      reactionsGotten: Object.entries(lodash.countBy(reactionsGotten.map((r) => r.value.byEmoji))).sort(
        (a, b) => b[1] - a[1]
      ) as [ReactionTypeEmoji["emoji"], number][],
      reactionsGiven: Object.entries(lodash.countBy(reactionsGiven.map((r) => r.value.byEmoji))).sort(
        (a, b) => b[1] - a[1]
      ) as [ReactionTypeEmoji["emoji"], number][],
    });
  },
};

export default function UserStats({ data }: PageProps<Data>) {
  const { total, name, reactionsGotten, reactionsGiven } = data;

  return (
    <div class="px-4 py-8 mx-auto">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <h1 class="text-4xl font-bold mb-6">{name}</h1>
        <h1 class="text-3xl font-bold font-mono mb-6">{"punto".toQuantity(total)}</h1>

        <div class="grid gap-4">
          {[
            [
              (quantity: number) => `${quantity} ${quantity === 1 ? "reacción recibida" : "reacciones recibidas"}`,
              reactionsGotten,
            ] as const,
            [
              (quantity: number) => `${quantity} ${quantity === 1 ? "reacción dada" : "reacciones dadas"}`,
              reactionsGiven,
            ] as const,
          ].map(
            ([title, reactions]) =>
              reactions.length > 0 && (
                <>
                  <h2 class="text-2xl font-bold mb-1">{title(reactions.reduce((i, a) => i + a[1], 0))}</h2>
                  <table class="w-min table-auto border-collapse border border-slate-500 text-nowrap">
                    <tbody>
                      {reactions.map(([emoji, count]) => (
                        <tr key={emoji}>
                          <td
                            class="text-right
                border border-slate-500 py-1 px-4 text-blue-300"
                          >
                            {emoji}
                          </td>
                          <td class="text-center border border-slate-500 py-1 px-4">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )
          )}
        </div>
      </div>
    </div>
  );
}

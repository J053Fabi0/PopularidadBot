import db from "../../data/database.ts";
import { Handlers, PageProps } from "$fresh/server.ts";

interface Data {
  users?: { user: string; id: number; points: number }[];
}

export const handler: Handlers<Data> = {
  async GET(_, ctx) {
    const groupId = +ctx.params.groupId;
    if (!groupId) return ctx.render();

    const top = (
      await db.userPointsInGroup.getMany({
        filter: (user) => user.value.groupAndUserId[0] === groupId,
      })
    ).result
      .sort((a, b) => b.value.points - a.value.points)
      .map((u) => u.value);

    if (!top.length) return ctx.render();

    const users = (
      await Promise.all(
        top.map(async (user) => {
          const userInGroup = await db.userName.findByPrimaryIndex("userId", user.groupAndUserId[1]);

          if (!userInGroup) return null;

          return { user: userInGroup.value.userName, id: user.groupAndUserId[1], points: user.points };
        })
      )
    ).filter((u) => u !== null) as { user: string; id: number; points: number }[];

    return ctx.render({ users });
  },
};

export default function GroupStats({ data, params }: PageProps<Data>) {
  const { users } = data || {};

  if (users === undefined) {
    return (
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="text-4xl font-bold mb-6">Grupo no encontrado</h1>
        </div>
      </div>
    );
  }

  return (
    <div class="px-4 py-8 mx-auto">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <h1 class="text-4xl font-bold mb-6">Top de puntos</h1>
        <table class="w-min table-auto border-collapse border border-slate-500 text-nowrap">
          <thead>
            <tr class="bg-slate-200">
              <th class="text-center border border-slate-500 py-1 px-4 ">Usuario</th>
              <th class="text-center border border-slate-500 py-1 px-3 ">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={i}>
                <td class="text-right border border-slate-500 py-1 px-4 text-blue-300">
                  <a href={`${params.groupId}/${user.id}`}>{user.user}</a>
                </td>
                <td class="text-center border border-slate-500 py-1 px-4">{user.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

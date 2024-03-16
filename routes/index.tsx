import db from "../data/database.ts";
import getQueryParams from "../utils/getQueryParams.ts";

export default async function Home(a: Request) {
  const { group } = getQueryParams(a.url);
  if (group === undefined) {
    return (
      <div class="px-4 py-8 mx-auto">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="text-4xl font-bold mb-6">Grupo no encontrado</h1>
        </div>
      </div>
    );
  }

  const top = (
    await db.userPointsInGroup.getMany({
      filter: (user) => user.value.groupAndUserId[0] === +group,
    })
  ).result
    .sort((a, b) => b.value.points - a.value.points)
    .map((u) => u.value);

  const users = (
    await Promise.all(
      top.map(async (user) => {
        const userInGroup = await db.userName.findByPrimaryIndex("userId", user.groupAndUserId[1]);

        if (!userInGroup) return null;

        return { user: userInGroup.value.userName, points: user.points };
      })
    )
  ).filter((u) => u !== null) as { user: string; points: number }[];

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
                <td class="text-right border border-slate-500 py-1 px-4">{user.user}</td>
                <td class="text-center border border-slate-500 py-1 px-4">{user.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

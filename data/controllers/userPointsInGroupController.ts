import db from "../database.ts";

function getPrimaryKey(chatId: number | string, userId: number | string): [number, number] {
  return [
    typeof chatId === "number" ? chatId : parseInt(chatId),
    typeof userId === "number" ? userId : parseInt(userId),
  ];
}

/** It creates a new userPointsInGroup if it doesn't exist and returns the points of the user in the group. */
export async function getPoints(chatId: number | string, userId: number | string): Promise<number> {
  const primaryKey = getPrimaryKey(chatId, userId);
  const res = await db.userPointsInGroup.findByPrimaryIndex("groupAndUserId", primaryKey);

  if (!res) {
    await db.userPointsInGroup.add({ groupAndUserId: primaryKey, points: 0 });
    return 0;
  }

  return res.value.points;
}

export async function changePoints(
  chatId: number | string,
  userId: number | string,
  points: number
): Promise<number> {
  const actualPoints = await getPoints(chatId, userId);

  const newPoints = (isNaN(actualPoints) ? 0 : actualPoints) + points;

  await db.userPointsInGroup.updateByPrimaryIndex(
    "groupAndUserId",
    getPrimaryKey(chatId, userId),
    { points: newPoints },
    { strategy: "merge-shallow" }
  );

  return newPoints;
}

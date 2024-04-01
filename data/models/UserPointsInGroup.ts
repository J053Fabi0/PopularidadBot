import { model } from "kvdex";
import UserPointsInGroup, { UserPointsInGroupInput } from "../../types/userPointsInGroup.type.ts";

function isUserPointsInGroup(user: UserPointsInGroupInput | UserPointsInGroup): user is UserPointsInGroup {
  return "createdAt" in user && user.createdAt instanceof Date;
}

const UserPointsInGroupModel = model<UserPointsInGroupInput | UserPointsInGroup, UserPointsInGroup>((user) => {
  const a = isUserPointsInGroup(user) ? user : { ...user, createdAt: new Date() };
  a.groupAndUserId = a.groupAndUserId.map(Math.abs) as [number, number];
  return a;
});

export default UserPointsInGroupModel;

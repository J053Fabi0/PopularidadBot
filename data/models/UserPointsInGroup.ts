import { model } from "kvdex";
import UserPointsInGroup, { UserPointsInGroupInput } from "../../types/userPointsInGroup.type.ts";

function isUserPointsInGroup(user: UserPointsInGroupInput | UserPointsInGroup): user is UserPointsInGroup {
  return "createdAt" in user && user.createdAt instanceof Date;
}

const UserPointsInGroupModel = model<UserPointsInGroupInput | UserPointsInGroup, UserPointsInGroup>((user) =>
  isUserPointsInGroup(user) ? user : { ...user, createdAt: new Date() }
);

export default UserPointsInGroupModel;

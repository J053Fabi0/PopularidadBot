import { model } from "kvdex";
import UserMessageId from "../../types/userMessageId.type.ts";

const UserPointsInGroupModel = model<UserMessageId>((user) => {
  user.messageAndGroupId = user.messageAndGroupId.map(Math.abs) as [number, number];
  return user;
});

export default UserPointsInGroupModel;

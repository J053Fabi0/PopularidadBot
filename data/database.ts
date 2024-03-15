import { kvdex, collection } from "kvdex";
import UserNameModel from "./models/UserName.ts";
import UserMessageIdModel from "./models/UserMessageId.ts";
import UserPointsInGroupModel from "./models/UserPointsInGroup.ts";

const kv = await Deno.openKv();

const db = kvdex(kv, {
  userPointsInGroup: collection(UserPointsInGroupModel, {
    indices: {
      groupAndUserId: "primary",
    },
  }),
  userMessageId: collection(UserMessageIdModel, {
    indices: {
      messageAndGroupId: "primary",
    },
  }),
  userName: collection(UserNameModel, {
    indices: {
      userId: "primary",
    },
  }),
});

export default db;

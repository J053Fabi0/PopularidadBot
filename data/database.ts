import { kvdex, collection } from "kvdex";
import UserNameModel from "./models/UserName.ts";
import UserMessageIdModel from "./models/UserMessageId.ts";
import MessageReactionModel from "./models/MessageReaction.ts";
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
  messageReaction: collection(MessageReactionModel, {
    indices: {
      messageAndGroupId: "primary",
    },
  }),
});

export default db;

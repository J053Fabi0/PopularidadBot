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
      messageFromIdAndGroupId: "primary",
    },
  }),
});

export default db;

// UserPointsInGroup
for (const user of (await db.userPointsInGroup.getMany()).result) {
  if (user.value.groupAndUserId[0] < 0) {
    console.log("Found user points with negative group", user.value.groupAndUserId);
    const { ok } = await db.userPointsInGroup.update(
      user.id,
      { groupAndUserId: [-user.value.groupAndUserId[0], user.value.groupAndUserId[1]] },
      { mergeOptions: { arrays: "replace" } }
    );
    if (ok === false) await db.userPointsInGroup.delete(user.id);
  }
}

// UserMessageId
for (const user of (await db.userMessageId.getMany()).result)
  if (user.value.messageAndGroupId[1] < 0) {
    console.log("Found user message with negative group", user.value.messageAndGroupId);
    const { ok } = await db.userMessageId.update(
      user.id,
      { messageAndGroupId: [user.value.messageAndGroupId[0], -user.value.messageAndGroupId[1]] },
      { mergeOptions: { arrays: "replace" } }
    );
    if (ok === false) await db.userMessageId.delete(user.id);
  }

// MessageReaction
for (const reaction of (await db.messageReaction.getMany()).result) {
  if (!reaction.value.messageFromIdAndGroupId) {
    await db.messageReaction.delete(reaction.id);
    continue;
  }

  if (!reaction.value.toUserId) {
    const message = await db.userMessageId.findByPrimaryIndex("messageAndGroupId", [
      reaction.value.messageFromIdAndGroupId[0],
      reaction.value.messageFromIdAndGroupId[2],
    ]);
    if (!message) {
      await db.messageReaction.delete(reaction.id);
      continue;
    }
    console.log(
      "Updating message reaction with toUserId",
      reaction.value.messageFromIdAndGroupId,
      message.value.userId
    );
    await db.messageReaction.update(reaction.id, { toUserId: message.value.userId });
  }

  if (reaction.value.messageFromIdAndGroupId[1] < 0) {
    console.log("Found message reaction with negative group", reaction.value.messageFromIdAndGroupId);
    const { ok } = await db.messageReaction.update(
      reaction.id,
      {
        messageFromIdAndGroupId: [
          reaction.value.messageFromIdAndGroupId[0],
          -reaction.value.messageFromIdAndGroupId[1],
          reaction.value.messageFromIdAndGroupId[2],
        ],
      },
      { mergeOptions: { arrays: "replace" } }
    );
    if (ok === false) await db.messageReaction.delete(reaction.id);
  }
}

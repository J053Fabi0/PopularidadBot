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
      { groupAndUserId: [Math.abs(user.value.groupAndUserId[0]), user.value.groupAndUserId[1]] },
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
      { messageAndGroupId: [user.value.messageAndGroupId[0], Math.abs(user.value.messageAndGroupId[1])] },
      { mergeOptions: { arrays: "replace" } }
    );
    if (ok === false) await db.userMessageId.delete(user.id);
  }

// MessageReaction
for (const reaction of (await db.messageReaction.getMany()).result) {
  const messageFromIdAndGroupId: [number, number, number] =
    "fromId" in reaction.value
      ? [
          // @ts-ignore a
          reaction.value.messageAndGroupId[0],
          // @ts-ignore a
          reaction.value.fromId as number,
          // @ts-ignore a
          Math.abs(reaction.value.messageAndGroupId[1]),
        ]
      : [
          reaction.value.messageFromIdAndGroupId[0],
          Math.abs(reaction.value.messageFromIdAndGroupId[1]),
          Math.abs(reaction.value.messageFromIdAndGroupId[2]),
        ];

  const toUserId =
    reaction.value.toUserId ||
    (
      await db.userMessageId.findByPrimaryIndex("messageAndGroupId", [
        messageFromIdAndGroupId[0],
        messageFromIdAndGroupId[2],
      ])
    )?.value.userId;
  console.log("Found message reaction", messageFromIdAndGroupId.length, toUserId);

  await db.messageReaction.delete(reaction.id);
  if (toUserId)
    await db.messageReaction.add({
      messageFromIdAndGroupId,
      botReplyId: reaction.value.botReplyId,
      toUserId,
      byEmoji: reaction.value.byEmoji,
    });
}

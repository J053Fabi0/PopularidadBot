import { model } from "kvdex";
import MessageReaction from "../../types/messageReaction.type.ts";

const MessageReactionModel = model<MessageReaction>((reaction) => {
  reaction.messageFromIdAndGroupId = reaction.messageFromIdAndGroupId.map(Math.abs) as [number, number, number];
  return reaction;
});

export default MessageReactionModel;

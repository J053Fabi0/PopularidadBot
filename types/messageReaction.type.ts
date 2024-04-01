import { KvObject } from "kvdex";
import { ReactionTypeEmoji } from "grammy/types.deno.ts";

export default interface MessageReaction extends KvObject {
  messageFromIdAndGroupId: [number, number, number];
  /** The message id of the bot's reply */
  botReplyId: number;
  toUserId: number;
  byEmoji?: ReactionTypeEmoji["emoji"];
}

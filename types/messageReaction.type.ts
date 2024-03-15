import { KvObject } from "kvdex";
import { ReactionTypeEmoji } from "grammy/types.deno.ts";

export default interface MessageReaction extends KvObject {
  messageAndGroupId: [number, number];
  fromId: number;
  /** The message id of the bot's reply */
  botReplyId: number;
  byEmoji?: ReactionTypeEmoji["emoji"];
}

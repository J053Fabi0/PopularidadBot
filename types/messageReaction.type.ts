import { KvObject } from "kvdex";

export default interface MessageReaction extends KvObject {
  messageAndGroupId: [number, number];
  fromId: number;
  /** The message id of the bot's reply */
  botReplyId: number;
}

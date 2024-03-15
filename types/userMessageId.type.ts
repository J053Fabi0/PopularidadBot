import { KvObject } from "kvdex";

export default interface UserMessageId extends KvObject {
  userId: number;
  messageAndGroupId: [number, number];
}

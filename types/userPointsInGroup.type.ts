import { KvObject } from "kvdex";

export interface UserPointsInGroupInput extends KvObject {
  groupAndUserId: [number, number];
  points: number;
}

export default interface UserPointsInGroup extends KvObject, UserPointsInGroupInput {
  createdAt: Date;
}

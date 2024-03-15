import { KvObject } from "kvdex";

export default interface UserName extends KvObject {
  userId: number;
  userName: string;
}

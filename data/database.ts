import { kvdex, collection } from "kvdex";
import UserPointsInGroupModel from "./models/UserPointsInGroup.ts";

const kv = await Deno.openKv();

const db = kvdex(kv, {
  userPointsInGroup: collection(UserPointsInGroupModel, {
    indices: {
      groupAndUserId: "primary",
    },
  }),
});

export default db;

import { CCTeamError } from "../../lib/error";
import { send } from "../../lib/tmux";
import type { Role } from "../../lib/types";
import { loadSessionName } from "../../lib/util";

export async function sendCommand(from: Role, to: Role, message: string) {
  const validRoles: Role[] = ["manager", "leader", "worker"];

  if (!validRoles.includes(from)) {
    throw new CCTeamError(
      `Invalid role: ${from}`,
      "Valid roles are: manager, leader, worker",
    );
  }

  if (!validRoles.includes(to)) {
    throw new CCTeamError(
      `Invalid role: ${to}`,
      "Valid roles are: manager, leader, worker",
    );
  }

  const session = await loadSessionName();
  await send({ session, from, to, message });
  console.log(`[INFO] Message sent to ${to}`);
}

import { send } from "../../lib/tmux";
import type { Role } from "../../lib/types";
import { getCurrentRole, loadSessionName } from "../../lib/util";

export async function sendCommand(role: Role, message: string) {
  const session = await loadSessionName();
  const from = await getCurrentRole();
  await send({ session, from, to: role, message });
  console.log(`[INFO] Message sent to ${role}`);
}

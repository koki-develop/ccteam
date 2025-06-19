import { send } from "../../lib/tmux";
import { loadSessionName } from "../../lib/util";

export async function sendCommand(role: string, message: string) {
  const session = await loadSessionName();
  await send({ session, role, message });
  console.log(`[INFO] Message sent to ${role}`);
}

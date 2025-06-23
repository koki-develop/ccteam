import { CCTeam } from "../../lib/ccteam";
import { log } from "../../lib/log";
import { Tmux } from "../../lib/tmux";
import type { Role } from "../../lib/types";

export async function sendCommand(from: Role, to: Role, message: string) {
  const tmux = new Tmux();
  const session = await tmux.getSession();
  const ccteam = new CCTeam(session);
  await ccteam.checkRequirements();

  await ccteam.sendMessage({ from, to, message });
  log("info", `Message sent to ${to}`);
}

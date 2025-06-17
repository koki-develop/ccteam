import { tmux } from "../../lib/tmux";
import { sleep } from "../../lib/util";

export type SnedParams = {
  session: string;
  role: string;
  message: string;
};

export async function send({ session, role, message }: SnedParams) {
  const roleMap: Record<string, number> = {
    manager: 0,
    reviewer: 1,
    worker: 2,
  };
  if (!Object.keys(roleMap).includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }

  const target = `${session}:0.${roleMap[role]}`;

  await tmux("send-keys", "-t", target, message);
  await sleep(1000);
  await tmux("send-keys", "-t", target, "C-m");
}

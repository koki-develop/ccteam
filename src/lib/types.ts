import { CCTeamError } from "./error";

export type Role = "manager" | "leader" | "worker";

export function asRole(role: string): Role {
  switch (role) {
    case "manager":
      return "manager";
    case "leader":
      return "leader";
    case "worker":
      return "worker";
  }

  throw new CCTeamError(`Invalid role: ${role}`);
}

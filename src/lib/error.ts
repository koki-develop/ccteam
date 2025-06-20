export class CCTeamError extends Error {
  constructor(
    message: string,
    public readonly details?: string,
  ) {
    super(message);
    this.name = "CCTeamError";
  }
}

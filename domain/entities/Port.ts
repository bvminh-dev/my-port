export type Protocol = "TCP" | "UDP";

export class Port {
  constructor(
    readonly pid: number,
    readonly command: string,
    readonly user: string,
    readonly protocol: Protocol,
    readonly address: string,
  ) {}
}

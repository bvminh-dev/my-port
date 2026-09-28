export class ProcessId {
  private constructor(readonly value: number) {}

  static create(value: unknown): ProcessId {
    if (!Number.isInteger(value) || (value as number) <= 1) {
      throw new Error("PID không hợp lệ");
    }
    return new ProcessId(value as number);
  }
}

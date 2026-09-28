import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Port, Protocol } from "@/domain/entities/Port";
import { ProcessId } from "@/domain/value-objects/ProcessId";
import { PortRepository } from "@/domain/repositories/PortRepository";

const execFileAsync = promisify(execFile);

// ponytail: macOS/Linux only (shells out to `lsof`) — swap this adapter for a
// Windows-compatible one (e.g. netstat parsing) if that's ever needed.
export class LsofPortRepository implements PortRepository {
  async findAllOpen(): Promise<Port[]> {
    const { stdout } = await execFileAsync("lsof", [
      "-iTCP",
      "-sTCP:LISTEN",
      "-iUDP",
      "-n",
      "-P",
    ]);

    return stdout
      .trim()
      .split("\n")
      .slice(1) // drop header row
      .map((line) => {
        const cols = line.trim().split(/\s+/);
        return new Port(Number(cols[1]), cols[0], cols[2], cols[7] as Protocol, cols[8]);
      });
  }

  async kill(pid: ProcessId): Promise<void> {
    process.kill(pid.value, "SIGTERM");
  }
}

import { execFile } from "node:child_process";
import { basename } from "node:path";
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

    const rows = stdout
      .trim()
      .split("\n")
      .slice(1) // drop header row
      .map((line) => line.trim().split(/\s+/));

    const cwds = await this.findCwds([...new Set(rows.map((cols) => cols[1]))]);
    const own = rows.map(
      (cols) => new Port(Number(cols[1]), cols[0], cols[2], cols[7] as Protocol, cols[8], cwds.get(cols[1]) ?? ""),
    );
    return [...own, ...(await this.findOtherUsersPorts(new Set(own.map((p) => p.pid))))];
  }

  // Non-root `lsof` only sees the caller's own sockets; macOS `netstat -anv` lists every socket with its pid.
  // ponytail: darwin-only (BSD column layout); other users' cwd stays empty (unreadable without root).
  private async findOtherUsersPorts(known: Set<number>): Promise<Port[]> {
    if (process.platform !== "darwin") return [];
    const seen = new Set<string>();
    const found: { pid: number; protocol: Protocol; address: string }[] = [];
    for (const [proto, protocol, pidCol] of [["tcp", "TCP", 8], ["udp", "UDP", 7]] as const) {
      const { stdout } = await execFileAsync("netstat", ["-anv", "-p", proto]).catch(() => ({ stdout: "" }));
      for (const line of stdout.split("\n")) {
        const cols = line.trim().split(/\s+/);
        if (!cols[0].startsWith(proto) || (proto === "tcp" && cols[5] !== "LISTEN")) continue;
        if (cols[3].endsWith(".*")) continue; // unbound socket
        const pid = Number(cols[pidCol]);
        const i = cols[3].lastIndexOf(".");
        const host = cols[3].slice(0, i);
        const address = `${host.includes(":") ? `[${host}]` : host}:${cols[3].slice(i + 1)}`;
        const key = `${pid}|${protocol}|${address}`;
        if (known.has(pid) || seen.has(key)) continue;
        seen.add(key);
        found.push({ pid, protocol, address });
      }
    }
    if (found.length === 0) return [];

    const { stdout } = await execFileAsync("ps", ["-o", "pid=,user=,comm=", "-p", [...new Set(found.map((f) => f.pid))].join(",")]).catch(
      (err) => ({ stdout: String(err.stdout ?? "") }),
    );
    const procs = new Map<number, { user: string; command: string }>();
    for (const line of stdout.split("\n")) {
      const m = line.trim().match(/^(\d+)\s+(\S+)\s+(.+)$/);
      if (m) procs.set(Number(m[1]), { user: m[2], command: basename(m[3]) });
    }
    return found.flatMap((f) => {
      const proc = procs.get(f.pid);
      return proc ? [new Port(f.pid, proc.command, proc.user, f.protocol, f.address, "")] : [];
    });
  }

  // One extra `lsof` call for all pids. `-Fn` output: "p<pid>" then "n<cwd>" per process.
  // lsof exits 1 when some pid is unreadable (other users' processes) but still prints the rest.
  private async findCwds(pids: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (pids.length === 0) return map;
    const { stdout } = await execFileAsync("lsof", ["-a", "-d", "cwd", "-Fn", "-p", pids.join(",")]).catch(
      (err) => ({ stdout: String(err.stdout ?? "") }),
    );
    let pid = "";
    for (const line of stdout.split("\n")) {
      if (line[0] === "p") pid = line.slice(1);
      else if (line[0] === "n") map.set(pid, line.slice(1));
    }
    return map;
  }

  async kill(pid: ProcessId): Promise<void> {
    process.kill(pid.value, "SIGTERM");
  }
}

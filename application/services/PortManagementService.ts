import { userInfo } from "node:os";
import { PortRepository } from "@/domain/repositories/PortRepository";
import { ProcessId } from "@/domain/value-objects/ProcessId";
import { PortDto } from "../dto/PortDto";

export interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export class PortManagementService {
  constructor(private readonly repository: PortRepository) {}

  async listPorts(): Promise<PortDto[]> {
    const ports = await this.repository.findAllOpen();
    return ports.map((p) => ({
      pid: p.pid,
      command: p.command,
      user: p.user,
      protocol: p.protocol,
      address: p.address,
      cwd: p.cwd,
      // ponytail: heuristic — own user (lsof truncates long names, hence startsWith) and a real project dir;
      // desktop apps/daemons run as the user too but sit in "/".
      mine: userInfo().username.startsWith(p.user) && p.cwd !== "" && p.cwd !== "/",
    }));
  }

  async killProcess(pid: number): Promise<ActionResult> {
    try {
      await this.repository.kill(ProcessId.create(pid));
      return { success: true, message: `Đã dừng tiến trình ${pid}` };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Không thể dừng tiến trình" };
    }
  }
}

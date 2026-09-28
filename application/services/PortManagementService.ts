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

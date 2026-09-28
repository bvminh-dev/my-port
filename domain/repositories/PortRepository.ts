import { Port } from "../entities/Port";
import { ProcessId } from "../value-objects/ProcessId";

export interface PortRepository {
  findAllOpen(): Promise<Port[]>;
  kill(pid: ProcessId): Promise<void>;
}

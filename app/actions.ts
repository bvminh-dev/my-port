"use server";

import { portManagementService } from "@/infrastructure/container";
import type { ActionResult } from "@/application/services/PortManagementService";
import type { PortDto } from "@/application/dto/PortDto";

export async function listPortsAction(): Promise<ActionResult<PortDto[]>> {
  try {
    const data = await portManagementService.listPorts();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Không tải được danh sách port" };
  }
}

export async function killPortAction(pid: number): Promise<ActionResult> {
  return portManagementService.killProcess(pid);
}

import { LsofPortRepository } from "./system/LsofPortRepository";
import { PortManagementService } from "@/application/services/PortManagementService";

export const portManagementService = new PortManagementService(new LsofPortRepository());

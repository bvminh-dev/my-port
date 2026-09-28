import { portManagementService } from "@/infrastructure/container";
import { Sidebar } from "@/presentation/components/ui";
import { PortTable } from "@/presentation/components/PortTable";

export const dynamic = "force-dynamic";

export default async function Home() {
  const ports = await portManagementService.listPorts();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <PortTable initialPorts={ports} />
      </main>
    </div>
  );
}

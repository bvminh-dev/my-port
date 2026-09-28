"use client";

import { useMemo, useState, useTransition } from "react";
import type { PortDto } from "@/application/dto/PortDto";
import { listPortsAction, killPortAction } from "@/app/actions";
import { Button, Badge, Card, SkeletonRow, EmptyState, useToast } from "./ui";

type SortKey = "address" | "protocol" | "pid" | "command" | "user";
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "address", label: "Địa chỉ" },
  { key: "protocol", label: "Giao thức" },
  { key: "pid", label: "PID" },
  { key: "command", label: "Tiến trình" },
  { key: "user", label: "User" },
];

export function PortTable({ initialPorts }: { initialPorts: PortDto[] }) {
  const [ports, setPorts] = useState(initialPorts);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [protocolFilter, setProtocolFilter] = useState<"all" | "TCP" | "UDP">("all");
  const [sortKey, setSortKey] = useState<SortKey>("pid");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const visiblePorts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = ports.filter((p) => {
      if (protocolFilter !== "all" && p.protocol !== protocolFilter) return false;
      if (!q) return true;
      return (
        p.address.toLowerCase().includes(q) ||
        p.command.toLowerCase().includes(q) ||
        p.user.toLowerCase().includes(q) ||
        String(p.pid).includes(q)
      );
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "pid") return (a.pid - b.pid) * dir;
      return a[sortKey].localeCompare(b[sortKey]) * dir;
    });
  }, [ports, search, protocolFilter, sortKey, sortDir]);

  function refresh() {
    startTransition(async () => {
      const res = await listPortsAction();
      if (res.success && res.data) {
        setPorts(res.data);
        showToast("Danh sách port đã được cập nhật", "success");
      } else {
        showToast(res.error ?? "Không tải được danh sách port", "error");
      }
    });
  }

  function handleKill(pid: number) {
    if (!confirm(`Dừng tiến trình ${pid}?`)) return;
    startTransition(async () => {
      const res = await killPortAction(pid);
      showToast((res.success ? res.message : res.error) ?? "", res.success ? "success" : "error");
      if (res.success) refresh();
    });
  }

  return (
    <Card className="port-card">
      <div className="port-card-header">
        <h1>Ports đang mở</h1>
        <Button variant="primary" onClick={refresh} disabled={isPending}>
          {isPending ? "Đang tải..." : "Làm mới"}
        </Button>
      </div>

      <div className="port-toolbar">
        <input
          type="search"
          className="port-search"
          placeholder="Tìm theo địa chỉ, tiến trình, user, pid..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="port-filter"
          value={protocolFilter}
          onChange={(e) => setProtocolFilter(e.target.value as "all" | "TCP" | "UDP")}
        >
          <option value="all">Tất cả giao thức</option>
          <option value="TCP">TCP</option>
          <option value="UDP">UDP</option>
        </select>
      </div>

      <table className="port-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key} className="sortable" onClick={() => toggleSort(col.key)}>
                {col.label}
                {sortKey === col.key && <span className="sort-indicator">{sortDir === "asc" ? " ▲" : " ▼"}</span>}
              </th>
            ))}
            <th aria-hidden />
          </tr>
        </thead>
        <tbody>
          {isPending && ports.length === 0
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            : visiblePorts.map((p, i) => (
                <tr key={`${p.pid}-${p.address}-${i}`}>
                  <td>{p.address}</td>
                  <td>
                    <Badge tone={p.protocol === "TCP" ? "tcp" : "udp"}>{p.protocol}</Badge>
                  </td>
                  <td>{p.pid}</td>
                  <td>{p.command}</td>
                  <td>{p.user}</td>
                  <td>
                    <Button variant="tertiary" onClick={() => handleKill(p.pid)}>
                      Kill
                    </Button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      {!isPending && ports.length === 0 && (
        <EmptyState title="Không có port nào đang mở" description="Nhấn Làm mới để kiểm tra lại." />
      )}
      {!isPending && ports.length > 0 && visiblePorts.length === 0 && (
        <EmptyState title="Không tìm thấy port phù hợp" description="Thử đổi từ khóa hoặc bộ lọc giao thức." />
      )}
    </Card>
  );
}

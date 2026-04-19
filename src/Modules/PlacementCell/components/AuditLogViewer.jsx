import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Title,
  Loader,
  Center,
  Text,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { ClipboardText } from "@phosphor-icons/react";
import api from "../api";
import { auditLogsRoute } from "../../../routes/placementCellRoutes";

function AuditLogViewer() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [totalRows, setTotalRows] = useState(0);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
      };
      const response = await api.get(auditLogsRoute, { params });

      const data = response.data;
      if (data.results) {
        setLogs(data.results);
        setTotalRows(data.count || data.results.length);
      } else if (Array.isArray(data)) {
        setLogs(data);
        setTotalRows(data.length);
      } else {
        setLogs([]);
        setTotalRows(0);
      }
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to load audit logs",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = useMemo(
    () => [
      {
        header: "Timestamp",
        accessorKey: "timestamp",
        Cell: ({ cell }) => {
          const val = cell.getValue();
          if (!val) return "—";
          const date = new Date(val);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        },
        enableColumnFilter: false,
      },
      {
        header: "User",
        accessorKey: "user",
        accessorFn: (row) =>
          row.user || row.user_name || row.performed_by || "System",
      },
      {
        header: "Action",
        accessorKey: "action",
      },
      {
        header: "Target",
        accessorKey: "target",
        accessorFn: (row) =>
          row.target || row.target_object || row.resource || "—",
      },
      {
        header: "IP Address",
        accessorKey: "ip_address",
        accessorFn: (row) => row.ip_address || row.ip || "—",
        enableColumnFilter: false,
        enableSorting: false,
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: logs,
    manualPagination: true,
    rowCount: totalRows,
    onPaginationChange: setPagination,
    state: {
      pagination,
      isLoading: loading,
    },
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableSorting: true,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    initialState: { density: "xs" },
    mantineTableProps: { striped: true, highlightOnHover: true },
    mantineSearchTextInputProps: {
      placeholder: "Search by user or action...",
    },
  });

  return (
    <Container fluid>
      <Group gap="sm" mb="lg">
        <ClipboardText size={24} />
        <Title order={2}>Audit Log</Title>
      </Group>

      <MantineReactTable table={table} />
    </Container>
  );
}

export default AuditLogViewer;

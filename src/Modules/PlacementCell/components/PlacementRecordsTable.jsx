import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Title,
  Loader,
  Center,
  Select,
  Group,
  Paper,
  Text,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { ChartBar } from "@phosphor-icons/react";
import { useMantineReactTable, MantineReactTable } from "mantine-react-table";
import api from "../api";
import { statisticsRoute } from "../../../routes/placementCellRoutes";

const DEPARTMENTS = [
  { value: "", label: "All Departments" },
  { value: "CSE", label: "CSE" },
  { value: "ECE", label: "ECE" },
  { value: "ME", label: "ME" },
  { value: "EE", label: "EE" },
  { value: "CE", label: "CE" },
  { value: "SM", label: "SM" },
  { value: "Design", label: "Design" },
  { value: "NS", label: "NS" },
];

const currentYear = new Date().getFullYear();
const BATCH_YEARS = [
  { value: "", label: "All Batches" },
  ...Array.from({ length: 6 }, (_, i) => {
    const y = currentYear - i;
    return { value: String(y), label: String(y) };
  }),
];

const columns = [
  { accessorKey: "year", header: "Year", size: 90 },
  { accessorKey: "company", header: "Company", size: 180 },
  {
    accessorKey: "ctc",
    header: "CTC (LPA)",
    size: 110,
    Cell: ({ cell }) => {
      const v = cell.getValue();
      return v != null ? `₹ ${v}` : "—";
    },
  },
  { accessorKey: "placement_type", header: "Type", size: 120 },
  { accessorKey: "test_score", header: "Test Score", size: 120 },
  { accessorKey: "department", header: "Department", size: 120 },
];

export default function PlacementRecordsTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (department) params.department = department;
      if (batch) params.year = batch;
      const res = await api.get(statisticsRoute, { params });
      setData(Array.isArray(res.data) ? res.data : res.data.results ?? []);
    } catch (err) {
      showNotification({
        title: "Error",
        message:
          err.response?.data?.message ?? "Failed to load placement records",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [department, batch]);

  const table = useMantineReactTable({
    columns,
    data,
    enableStickyHeader: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableSorting: true,
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
      showGlobalFilter: true,
    },
    mantinePaginationProps: {
      rowsPerPageOptions: ["5", "10", "20", "50"],
    },
    paginationDisplayMode: "pages",
    state: { isLoading: loading },
  });

  return (
    <Container size="xl" py="md">
      <Title order={3} mb="md">
        Placement Records
      </Title>

      <Paper withBorder radius="md" p="md" mb="md">
        <Group>
          <Select
            label="Department"
            placeholder="Filter by department"
            data={DEPARTMENTS}
            value={department}
            onChange={(v) => setDepartment(v ?? "")}
            clearable
            w={200}
          />
          <Select
            label="Batch Year"
            placeholder="Filter by batch"
            data={BATCH_YEARS}
            value={batch}
            onChange={(v) => setBatch(v ?? "")}
            clearable
            w={160}
          />
        </Group>
      </Paper>

      {!loading && data.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Center>
            <Stack align="center" gap="xs">
              <ThemeIcon size={48} variant="light" color="gray" radius="xl">
                <ChartBar size={28} />
              </ThemeIcon>
              <Text c="dimmed" size="lg">
                No records match the current filters.
              </Text>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <MantineReactTable table={table} />
      )}
    </Container>
  );
}

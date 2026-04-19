import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Paper,
  Title,
  Group,
  Select,
  Button,
  Loader,
  Modal,
  Textarea,
  Stack,
  Text,
  Menu,
  Badge,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import {
  Funnel,
  ShieldCheck,
  CaretDown,
  Warning,
  CheckCircle,
} from "@phosphor-icons/react";
import api from "../api";
import {
  allApplicationsRoute,
  applicationOverrideRoute,
  companiesRoute,
} from "../../../routes/placementCellRoutes";

const STATUS_OPTIONS = [
  { value: "APPLIED", label: "Applied" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER_MADE", label: "Offer Made" },
  { value: "SELECTED", label: "Selected" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

const STATUS_COLORS = {
  APPLIED: "blue",
  SHORTLISTED: "cyan",
  INTERVIEW: "indigo",
  OFFER_MADE: "green",
  SELECTED: "teal",
  REJECTED: "red",
  WITHDRAWN: "gray",
};

export default function AllApplicationsView() {
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState({});

  const [filters, setFilters] = useState({
    company: "",
    status: "",
    date_from: null,
    date_to: null,
  });

  const [overrideModal, setOverrideModal] = useState({
    open: false,
    applicationId: null,
    studentName: "",
  });
  const [justification, setJustification] = useState("");
  const [overriding, setOverriding] = useState(false);

  const fetchCompanies = async () => {
    try {
      const response = await api.get(companiesRoute);
      const data = response.data?.results ?? response.data ?? [];
      setCompanies(
        data.map((c) => ({
          value: String(c.id),
          label: c.company_name || c.name,
        })),
      );
    } catch {
      /* non-critical */
    }
  };

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const toISODate = (d) => {
        if (!d) return null;
        const date = d instanceof Date ? d : new Date(d);
        if (Number.isNaN(date.getTime())) return null;
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      const params = {};
      if (filters.company) params.company = filters.company;
      if (filters.status) params.status = filters.status;
      const from = toISODate(filters.date_from);
      const to = toISODate(filters.date_to);
      if (from) params.date_from = from;
      if (to) params.date_to = to;

      const response = await api.get(allApplicationsRoute, { params });
      setApplications(response.data?.results ?? response.data ?? []);
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to fetch applications.",
        color: "red",
        icon: <Warning size={18} />,
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleOverride = async () => {
    if (!justification.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Please provide a justification.",
        color: "red",
      });
      return;
    }

    setOverriding(true);
    try {
      await api.post(applicationOverrideRoute(overrideModal.applicationId), {
        justification: justification.trim(),
      });

      showNotification({
        title: "Eligibility Overridden",
        message: `Eligibility override applied for ${overrideModal.studentName}.`,
        color: "green",
        icon: <CheckCircle size={18} />,
      });

      setOverrideModal({ open: false, applicationId: null, studentName: "" });
      setJustification("");
      fetchApplications();
    } catch (error) {
      showNotification({
        title: "Error",
        message:
          error.response?.data?.detail || "Failed to override eligibility.",
        color: "red",
      });
    } finally {
      setOverriding(false);
    }
  };

  const handleBulkAction = async (action) => {
    const ids = Object.keys(selectedRows).filter((k) => selectedRows[k]);
    if (ids.length === 0) {
      showNotification({
        title: "No Selection",
        message: "Select at least one application.",
        color: "yellow",
      });
      return;
    }

    try {
      await api.post(`${allApplicationsRoute}bulk/`, {
        action,
        application_ids: ids.map(Number),
      });

      showNotification({
        title: "Bulk Action Complete",
        message: `${action} applied to ${ids.length} application(s).`,
        color: "green",
        icon: <CheckCircle size={18} />,
      });

      setSelectedRows({});
      fetchApplications();
    } catch (error) {
      showNotification({
        title: "Error",
        message: error.response?.data?.detail || "Bulk action failed.",
        color: "red",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "student_name",
        header: "Student",
        accessorFn: (row) => row.student_name || row.student || "—",
      },
      {
        accessorKey: "job_title",
        header: "Job",
        accessorFn: (row) => row.job_title || row.job || "—",
      },
      {
        accessorKey: "company_name",
        header: "Company",
        accessorFn: (row) => row.company_name || row.company || "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return (
            <Badge
              color={STATUS_COLORS[val] || "gray"}
              variant="light"
            >
              {val || "—"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "applied_at",
        header: "Applied Date",
        accessorFn: (row) => {
          const raw = row.applied_at || row.applied_date || row.created_at;
          if (!raw) return "—";
          const d = new Date(raw);
          return Number.isNaN(d.getTime()) ? raw : d.toLocaleDateString();
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        enableSorting: false,
        Cell: ({ row }) => (
          <Button
            size="xs"
            variant="light"
            color="violet"
            leftSection={<ShieldCheck size={14} />}
            onClick={() =>
              setOverrideModal({
                open: true,
                applicationId: row.original.id,
                studentName:
                  row.original.student_name || row.original.student,
              })
            }
          >
            Override
          </Button>
        ),
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: applications,
    enableRowSelection: true,
    onRowSelectionChange: setSelectedRows,
    state: { rowSelection: selectedRows },
    getRowId: (row) => String(row.id),
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    initialState: { density: "xs" },
    mantineTableProps: { striped: true, highlightOnHover: true },
  });

  return (
    <Paper p="xl" radius="md" withBorder>
      <Group justify="space-between" mb="lg">
        <Title order={3}>
          <Group gap="xs">
            <Funnel size={24} />
            All Applications
          </Group>
        </Title>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button
              variant="light"
              rightSection={<CaretDown size={14} />}
              disabled={
                Object.values(selectedRows).filter(Boolean).length === 0
              }
            >
              Bulk Actions
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => handleBulkAction("shortlist")}>
              Shortlist Selected
            </Menu.Item>
            <Menu.Item onClick={() => handleBulkAction("reject")}>
              Reject Selected
            </Menu.Item>
            <Menu.Item onClick={() => handleBulkAction("export")}>
              Export Selected
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Group mb="md" align="flex-end">
        <Select
          label="Company"
          placeholder="All Companies"
          data={companies}
          value={filters.company || null}
          onChange={(val) =>
            setFilters((prev) => ({ ...prev, company: val || "" }))
          }
          clearable
          searchable
          w={200}
        />
        <Select
          label="Status"
          placeholder="All Statuses"
          data={STATUS_OPTIONS}
          value={filters.status || null}
          onChange={(val) =>
            setFilters((prev) => ({ ...prev, status: val || "" }))
          }
          clearable
          w={180}
        />
        <DateInput
          label="From"
          placeholder="Start date"
          value={filters.date_from}
          onChange={(val) =>
            setFilters((prev) => ({ ...prev, date_from: val }))
          }
          clearable
          w={160}
        />
        <DateInput
          label="To"
          placeholder="End date"
          value={filters.date_to}
          onChange={(val) =>
            setFilters((prev) => ({ ...prev, date_to: val }))
          }
          clearable
          w={160}
        />
      </Group>

      {loading ? (
        <Group justify="center" mt="xl">
          <Loader />
        </Group>
      ) : (
        <MantineReactTable table={table} />
      )}

      <Modal
        opened={overrideModal.open}
        onClose={() =>
          setOverrideModal({
            open: false,
            applicationId: null,
            studentName: "",
          })
        }
        title={`Override Eligibility — ${overrideModal.studentName}`}
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Overriding eligibility for this student will bypass the standard
            placement criteria. A justification is required for audit
            purposes.
          </Text>
          <Textarea
            label="Justification"
            placeholder="Reason for overriding eligibility..."
            value={justification}
            onChange={(e) => setJustification(e.currentTarget.value)}
            minRows={3}
            required
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() =>
                setOverrideModal({
                  open: false,
                  applicationId: null,
                  studentName: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              color="violet"
              onClick={handleOverride}
              loading={overriding}
            >
              Confirm Override
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}

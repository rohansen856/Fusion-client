import React, { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Title,
  Group,
  TextInput,
  Loader,
  Badge,
  Button,
  Modal,
  Text,
  Stack,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import {
  MagnifyingGlass,
  Prohibit,
  CheckCircle,
  Warning,
} from "@phosphor-icons/react";
import api from "../api";
import { debarredStudentsRoute } from "../../../routes/placementCellRoutes";

export default function DebarredStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    student: null,
  });
  const [toggleLoading, setToggleLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get(debarredStudentsRoute);
      setStudents(response.data?.results ?? response.data ?? []);
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to fetch debarred students list.",
        color: "red",
        icon: <Warning size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleDebar = async () => {
    const { student } = confirmModal;
    if (!student) return;

    setToggleLoading(true);
    try {
      const newStatus = !student.is_debarred;
      await api.post(debarredStudentsRoute, {
        student_id: student.id || student.student_id,
        is_debarred: newStatus,
      });

      setStudents((prev) =>
        prev.map((s) =>
          (s.id || s.student_id) === (student.id || student.student_id)
            ? { ...s, is_debarred: newStatus }
            : s,
        ),
      );

      showNotification({
        title: newStatus ? "Student Debarred" : "Student Undebarred",
        message: `${student.name || student.student_name} has been ${newStatus ? "debarred" : "undebarred"}.`,
        color: newStatus ? "orange" : "green",
        icon: newStatus ? <Prohibit size={18} /> : <CheckCircle size={18} />,
      });

      setConfirmModal({ open: false, student: null });
    } catch (error) {
      showNotification({
        title: "Error",
        message:
          error.response?.data?.detail || "Failed to update debar status.",
        color: "red",
      });
    } finally {
      setToggleLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        accessorFn: (row) => row.name || row.student_name || "—",
      },
      {
        accessorKey: "roll_no",
        header: "Roll Number",
        accessorFn: (row) => row.roll_no || row.roll || "—",
      },
      {
        accessorKey: "department",
        header: "Department",
        accessorFn: (row) => row.department || row.branch || "—",
      },
      {
        accessorKey: "is_debarred",
        header: "Status",
        Cell: ({ row }) => (
          <Badge color={row.original.is_debarred ? "red" : "green"}>
            {row.original.is_debarred ? "Debarred" : "Active"}
          </Badge>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        enableSorting: false,
        Cell: ({ row }) => (
          <Button
            size="xs"
            variant={row.original.is_debarred ? "outline" : "filled"}
            color={row.original.is_debarred ? "green" : "red"}
            onClick={() =>
              setConfirmModal({ open: true, student: row.original })
            }
            leftSection={
              row.original.is_debarred ? (
                <CheckCircle size={14} />
              ) : (
                <Prohibit size={14} />
              )
            }
          >
            {row.original.is_debarred ? "Undebar" : "Debar"}
          </Button>
        ),
      },
    ],
    [],
  );

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        (s.name || s.student_name || "").toLowerCase().includes(q) ||
        (s.roll_no || s.roll || "").toLowerCase().includes(q) ||
        (s.department || s.branch || "").toLowerCase().includes(q),
    );
  }, [students, search]);

  const table = useMantineReactTable({
    columns,
    data: filteredStudents,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableGlobalFilter: false,
    initialState: { density: "xs" },
    mantineTableProps: { striped: true, highlightOnHover: true },
  });

  if (loading) {
    return (
      <Group justify="center" mt="xl">
        <Loader />
      </Group>
    );
  }

  return (
    <Paper p="xl" radius="md" withBorder>
      <Group justify="space-between" mb="lg">
        <Title order={3}>Debarred Students</Title>
        <TextInput
          placeholder="Search by name, roll, or department..."
          leftSection={<MagnifyingGlass size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          w={300}
        />
      </Group>

      <MantineReactTable table={table} />

      <Modal
        opened={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, student: null })}
        title="Confirm Action"
        centered
      >
        {confirmModal.student && (
          <Stack gap="md">
            <Text>
              Are you sure you want to{" "}
              <Text span fw={700}>
                {confirmModal.student.is_debarred ? "undebar" : "debar"}
              </Text>{" "}
              <Text span fw={700}>
                {confirmModal.student.name ||
                  confirmModal.student.student_name}
              </Text>
              ?
            </Text>
            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() =>
                  setConfirmModal({ open: false, student: null })
                }
              >
                Cancel
              </Button>
              <Button
                color={
                  confirmModal.student.is_debarred ? "green" : "red"
                }
                onClick={handleToggleDebar}
                loading={toggleLoading}
              >
                {confirmModal.student.is_debarred
                  ? "Undebar"
                  : "Debar"}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Paper>
  );
}

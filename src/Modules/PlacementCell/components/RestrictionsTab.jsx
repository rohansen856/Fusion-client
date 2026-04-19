import React, { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Title,
  Group,
  Button,
  Loader,
  TextInput,
  Text,
  Stack,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { FloppyDisk, Warning, CheckCircle } from "@phosphor-icons/react";
import api from "../api";
import { placementConfigRoute } from "../../../routes/placementCellRoutes";

const CONFIG_DESCRIPTIONS = {
  max_active_applications:
    "Maximum number of active applications a student can have at one time.",
  max_job_applications:
    "Maximum total job applications allowed per student across all companies.",
  offer_deadline_hours:
    "Hours given to a student to respond to a placement offer.",
  max_reschedules:
    "Maximum number of times an interview can be rescheduled.",
  min_cpi: "Minimum CPI required to be eligible for placements.",
  backlog_limit: "Maximum number of backlogs allowed for eligibility.",
  max_offers: "Maximum number of offers a student can accept.",
};

export default function RestrictionsTab() {
  const [configItems, setConfigItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState({});

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await api.get(placementConfigRoute);
      const data = response.data?.results ?? response.data ?? [];
      const items = Array.isArray(data)
        ? data
        : Object.entries(data).map(([key, value]) => ({
            key,
            value: String(value),
          }));
      setConfigItems(items);
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to load placement configuration.",
        color: "red",
        icon: <Warning size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleValueChange = (key, newValue) => {
    setEditedValues((prev) => ({ ...prev, [key]: newValue }));
  };

  const handleSave = async () => {
    if (Object.keys(editedValues).length === 0) {
      showNotification({
        title: "No Changes",
        message: "No configuration values have been modified.",
        color: "yellow",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = configItems.map((item) => ({
        key: item.key,
        value: editedValues[item.key] ?? item.value,
      }));

      await api.put(placementConfigRoute, payload);

      setConfigItems((prev) =>
        prev.map((item) => ({
          ...item,
          value: editedValues[item.key] ?? item.value,
        })),
      );
      setEditedValues({});

      showNotification({
        title: "Saved",
        message: "Placement configuration updated successfully.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });
    } catch (error) {
      showNotification({
        title: "Error",
        message:
          error.response?.data?.detail ||
          "Failed to save configuration changes.",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "key",
        header: "Configuration",
        enableEditing: false,
        Cell: ({ row }) => (
          <Stack gap={2}>
            <Text fw={500}>
              {row.original.key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </Text>
            <Text size="xs" c="dimmed">
              {CONFIG_DESCRIPTIONS[row.original.key] || row.original.description || row.original.key}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "value",
        header: "Value",
        Cell: ({ row }) => (
          <TextInput
            value={
              editedValues[row.original.key] ?? row.original.value
            }
            onChange={(e) =>
              handleValueChange(
                row.original.key,
                e.currentTarget.value,
              )
            }
            size="sm"
            w={200}
          />
        ),
      },
    ],
    [editedValues],
  );

  const table = useMantineReactTable({
    columns,
    data: configItems,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableGlobalFilter: false,
    enablePagination: false,
    enableSorting: false,
    mantineTableProps: { highlightOnHover: true },
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
        <Title order={3}>Placement Configuration</Title>
        <Button
          onClick={handleSave}
          loading={saving}
          leftSection={<FloppyDisk size={18} />}
          disabled={Object.keys(editedValues).length === 0}
        >
          Save Changes
        </Button>
      </Group>

      {configItems.length === 0 ? (
        <Text c="dimmed">No configuration items found.</Text>
      ) : (
        <MantineReactTable table={table} />
      )}
    </Paper>
  );
}

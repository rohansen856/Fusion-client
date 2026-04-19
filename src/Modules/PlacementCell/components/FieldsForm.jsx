import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Switch,
  ActionIcon,
  Card,
  Text,
  Stack,
  Loader,
  SimpleGrid,
  Badge,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  Plus,
  Trash,
  FloppyDisk,
  TextT,
  Warning,
  CheckCircle,
} from "@phosphor-icons/react";
import api from "../api";
import { fetchFormFieldsRoute } from "../../../routes/placementCellRoutes";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select (Dropdown)" },
];

export default function FieldsForm() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newField, setNewField] = useState({
    label: "",
    field_type: "text",
    required: false,
  });

  const fetchFields = async () => {
    setLoading(true);
    try {
      const response = await api.get(fetchFormFieldsRoute);
      setFields(response.data?.results ?? response.data ?? []);
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to load form fields.",
        color: "red",
        icon: <Warning size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleAddField = () => {
    if (!newField.label.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Field label is required.",
        color: "red",
      });
      return;
    }

    const duplicate = fields.some(
      (f) => f.label.toLowerCase() === newField.label.trim().toLowerCase(),
    );
    if (duplicate) {
      showNotification({
        title: "Duplicate Field",
        message: "A field with this label already exists.",
        color: "orange",
      });
      return;
    }

    setFields((prev) => [
      ...prev,
      {
        id: `new_${Date.now()}`,
        label: newField.label.trim(),
        field_type: newField.field_type,
        required: newField.required,
        is_new: true,
      },
    ]);

    setNewField({ label: "", field_type: "text", required: false });
  };

  const handleRemoveField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(fetchFormFieldsRoute, { fields });
      setFields((prev) => prev.map((f) => ({ ...f, is_new: false })));
      showNotification({
        title: "Saved",
        message: "Form fields updated successfully.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });
    } catch (error) {
      showNotification({
        title: "Error",
        message:
          error.response?.data?.detail || "Failed to save form fields.",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

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
        <Title order={3}>
          <Group gap="xs">
            <TextT size={24} />
            Application Form Fields
          </Group>
        </Title>
        <Button
          onClick={handleSave}
          loading={saving}
          leftSection={<FloppyDisk size={18} />}
        >
          Save All
        </Button>
      </Group>

      <Card withBorder p="md" mb="lg" bg="gray.0">
        <Text fw={500} mb="sm">
          Add New Field
        </Text>
        <Group align="flex-end">
          <TextInput
            label="Label"
            placeholder="e.g. LinkedIn Profile"
            value={newField.label}
            onChange={(e) =>
              setNewField((prev) => ({
                ...prev,
                label: e.currentTarget.value,
              }))
            }
            style={{ flex: 1 }}
          />
          <Select
            label="Type"
            data={FIELD_TYPES}
            value={newField.field_type}
            onChange={(val) =>
              setNewField((prev) => ({ ...prev, field_type: val }))
            }
            w={180}
          />
          <Switch
            label="Required"
            checked={newField.required}
            onChange={(e) =>
              setNewField((prev) => ({
                ...prev,
                required: e.currentTarget.checked,
              }))
            }
            mt={24}
          />
          <Button
            onClick={handleAddField}
            leftSection={<Plus size={16} />}
          >
            Add
          </Button>
        </Group>
      </Card>

      <Divider mb="md" />

      {fields.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No custom fields configured. Add one above.
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {fields.map((field) => (
            <Card
              key={field.id}
              shadow="xs"
              padding="md"
              radius="md"
              withBorder
            >
              <Group justify="space-between" mb="xs">
                <Text fw={500}>{field.label}</Text>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => handleRemoveField(field.id)}
                  title="Remove field"
                >
                  <Trash size={16} />
                </ActionIcon>
              </Group>
              <Group gap="xs">
                <Badge variant="light" color="blue" size="sm">
                  {FIELD_TYPES.find((t) => t.value === field.field_type)
                    ?.label || field.field_type}
                </Badge>
                <Badge
                  variant="light"
                  color={field.required ? "red" : "gray"}
                  size="sm"
                >
                  {field.required ? "Required" : "Optional"}
                </Badge>
                {field.is_new && (
                  <Badge variant="light" color="green" size="sm">
                    New
                  </Badge>
                )}
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Paper>
  );
}

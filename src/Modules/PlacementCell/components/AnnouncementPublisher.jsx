import React, { useState } from "react";
import {
  Container,
  Title,
  Card,
  Text,
  Button,
  Textarea,
  Select,
  MultiSelect,
  Group,
  Stack,
  Loader,
  Center,
  Alert,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Megaphone, CheckCircle } from "@phosphor-icons/react";
import api from "../api";
import { chairmanAnnouncementRoute } from "../../../routes/placementCellRoutes";

const PRIORITY_OPTIONS = [
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const BATCH_OPTIONS = [
  "2022",
  "2023",
  "2024",
  "2025",
  "2026",
  "2027",
].map((b) => ({ value: b, label: `Batch ${b}` }));

const BRANCH_OPTIONS = [
  "CSE",
  "ECE",
  "EE",
  "ME",
  "CE",
  "Design",
  "Mathematics",
  "Physics",
  "NS",
].map((b) => ({ value: b, label: b }));

function AnnouncementPublisher() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    message: "",
    priority: "MEDIUM",
    batches: [],
    branches: [],
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const newErrors = {};
    if (!form.message.trim())
      newErrors.message = "Announcement message is required";
    if (!form.priority) newErrors.priority = "Priority is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setResult(null);
      const response = await api.post(chairmanAnnouncementRoute, {
        message: form.message,
        priority: form.priority,
        target_batches: form.batches,
        target_branches: form.branches,
      });

      const recipientCount =
        response.data.recipient_count ?? response.data.recipients ?? 0;
      setResult({ recipientCount });

      showNotification({
        title: "Success",
        message: `Announcement published to ${recipientCount} recipient(s)`,
        color: "green",
      });

      setForm({ message: "", priority: "MEDIUM", batches: [], branches: [] });
    } catch (error) {
      showNotification({
        title: "Error",
        message:
          error.response?.data?.detail || "Failed to publish announcement",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container fluid>
      <Title order={2} mb="lg">
        Publish Announcement
      </Title>

      {result && (
        <Alert
          icon={<CheckCircle size={20} />}
          title="Announcement Sent"
          color="green"
          mb="lg"
          withCloseButton
          onClose={() => setResult(null)}
        >
          Your announcement was successfully delivered to{" "}
          {result.recipientCount} recipient(s).
        </Alert>
      )}

      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Textarea
              label="Announcement Message"
              placeholder="Type your announcement here..."
              minRows={6}
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              error={errors.message}
              required
            />

            <Select
              label="Priority"
              placeholder="Select priority"
              data={PRIORITY_OPTIONS}
              value={form.priority}
              onChange={(val) => updateField("priority", val)}
              error={errors.priority}
              required
            />

            <MultiSelect
              label="Target Batches"
              placeholder="All batches if none selected"
              data={BATCH_OPTIONS}
              value={form.batches}
              onChange={(val) => updateField("batches", val)}
              searchable
              clearable
            />

            <MultiSelect
              label="Target Branches"
              placeholder="All branches if none selected"
              data={BRANCH_OPTIONS}
              value={form.branches}
              onChange={(val) => updateField("branches", val)}
              searchable
              clearable
            />

            <Group justify="flex-end" mt="md">
              <Button
                type="submit"
                loading={submitting}
                leftSection={<Megaphone size={16} />}
              >
                Publish Announcement
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Container>
  );
}

export default AnnouncementPublisher;

import React, { useState } from "react";
import {
  Paper,
  Title,
  Textarea,
  MultiSelect,
  Select,
  Button,
  Group,
  Checkbox,
  Text,
  Loader,
  Stack,
  Badge,
  Alert,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { PaperPlaneTilt, CheckCircle, Warning } from "@phosphor-icons/react";
import api from "../api";
import { sendNotifRoute } from "../../../routes/placementCellRoutes";

const BATCH_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: String(year), label: String(year) };
});

const BRANCH_OPTIONS = [
  { value: "CSE", label: "Computer Science" },
  { value: "ECE", label: "Electronics & Communication" },
  { value: "ME", label: "Mechanical Engineering" },
  { value: "CE", label: "Civil Engineering" },
  { value: "EE", label: "Electrical Engineering" },
  { value: "SM", label: "Smart Manufacturing" },
  { value: "Design", label: "Design" },
  { value: "NS", label: "Natural Sciences" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function SendNotificationForm() {
  const [message, setMessage] = useState("");
  const [batches, setBatches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [priority, setPriority] = useState("medium");
  const [sendToAll, setSendToAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Please enter a notification message.",
        color: "red",
      });
      return;
    }

    if (!sendToAll && batches.length === 0 && branches.length === 0) {
      showNotification({
        title: "Validation Error",
        message: "Select at least one batch or branch, or send to all.",
        color: "red",
      });
      return;
    }

    setLoading(true);
    setSuccessCount(null);

    try {
      const payload = {
        message: message.trim(),
        priority,
        send_to_all: sendToAll,
        ...(sendToAll ? {} : { batches, branches }),
      };

      const response = await api.post(sendNotifRoute, payload);
      const count = response.data?.sent_count ?? response.data?.count ?? 0;
      setSuccessCount(count);

      showNotification({
        title: "Notification Sent",
        message: `Successfully sent to ${count} student(s).`,
        color: "green",
        icon: <CheckCircle size={18} />,
      });

      setMessage("");
      setBatches([]);
      setBranches([]);
      setPriority("medium");
      setSendToAll(false);
    } catch (error) {
      showNotification({
        title: "Error",
        message:
          error.response?.data?.detail ||
          "Failed to send notification. Please try again.",
        color: "red",
        icon: <Warning size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper p="xl" radius="md" withBorder>
      <Title order={3} mb="lg">
        Send Notification
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Textarea
            label="Message"
            placeholder="Enter notification message..."
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            minRows={4}
            required
          />

          <Checkbox
            label="Send to all students"
            checked={sendToAll}
            onChange={(e) => setSendToAll(e.currentTarget.checked)}
          />

          {!sendToAll && (
            <Group grow>
              <MultiSelect
                label="Target Batch"
                placeholder="Select batches"
                data={BATCH_OPTIONS}
                value={batches}
                onChange={setBatches}
                clearable
                searchable
              />
              <MultiSelect
                label="Target Branch"
                placeholder="Select branches"
                data={BRANCH_OPTIONS}
                value={branches}
                onChange={setBranches}
                clearable
                searchable
              />
            </Group>
          )}

          <Select
            label="Priority"
            data={PRIORITY_OPTIONS}
            value={priority}
            onChange={setPriority}
            w={200}
          />

          <Group justify="flex-start" mt="md">
            <Button
              type="submit"
              loading={loading}
              leftSection={<PaperPlaneTilt size={18} />}
            >
              Send Notification
            </Button>
          </Group>

          {successCount !== null && (
            <Alert
              color="green"
              title="Sent Successfully"
              icon={<CheckCircle size={20} />}
            >
              <Text>
                Notification delivered to{" "}
                <Badge color="green" variant="light" size="lg">
                  {successCount}
                </Badge>{" "}
                student(s).
              </Text>
            </Alert>
          )}
        </Stack>
      </form>

      {loading && (
        <Group justify="center" mt="lg">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Sending notifications...
          </Text>
        </Group>
      )}
    </Paper>
  );
}

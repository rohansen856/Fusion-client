import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Button,
  TextInput,
  Textarea,
  FileInput,
  Badge,
  Loader,
  Center,
  Stack,
  Modal,
  Divider,
  Accordion,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  Plus,
  CheckCircle,
  FileText,
  ClockCounterClockwise,
} from "@phosphor-icons/react";
import api from "../api";
import {
  policiesRoute,
  policyApproveRoute,
} from "../../../routes/placementCellRoutes";

const STATUS_COLORS = {
  DRAFT: "gray",
  PENDING: "yellow",
  APPROVED: "green",
  REJECTED: "red",
  ARCHIVED: "blue",
};

function PolicyManager() {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [historyModal, setHistoryModal] = useState({
    open: false,
    policy: null,
  });

  const [form, setForm] = useState({
    title: "",
    content: "",
    document: null,
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  async function fetchPolicies() {
    try {
      setLoading(true);
      const response = await api.get(policiesRoute);
      setPolicies(response.data.results || response.data || []);
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to load policies",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePolicy(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showNotification({
        title: "Validation",
        message: "Title and content are required",
        color: "yellow",
      });
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      if (form.document) {
        formData.append("document", form.document);
      }

      await api.post(policiesRoute, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showNotification({
        title: "Success",
        message: "Policy created successfully",
        color: "green",
      });
      setShowForm(false);
      setForm({ title: "", content: "", document: null });
      fetchPolicies();
    } catch (error) {
      showNotification({
        title: "Error",
        message: error.response?.data?.detail || "Failed to create policy",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(policyId) {
    try {
      await api.post(policyApproveRoute(policyId));
      showNotification({
        title: "Success",
        message: "Policy approved",
        color: "green",
      });
      fetchPolicies();
    } catch (error) {
      showNotification({
        title: "Error",
        message: error.response?.data?.detail || "Failed to approve policy",
        color: "red",
      });
    }
  }

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Policy Manager</Title>
        <Button
          leftSection={<Plus size={16} />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "New Policy"}
        </Button>
      </Group>

      {showForm && (
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
          <Title order={4} mb="md">
            Create New Policy
          </Title>
          <form onSubmit={handleCreatePolicy}>
            <Stack gap="md">
              <TextInput
                label="Policy Title"
                placeholder="Enter policy title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
              <Textarea
                label="Policy Content"
                placeholder="Enter the full policy text..."
                minRows={6}
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
                required
              />
              <FileInput
                label="Supporting Document"
                placeholder="Upload document (optional)"
                value={form.document}
                onChange={(file) =>
                  setForm((prev) => ({ ...prev, document: file }))
                }
                accept=".pdf,.doc,.docx"
              />
              <Group justify="flex-end">
                <Button type="submit" loading={submitting}>
                  Create Policy
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      )}

      {policies.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No policies found.
        </Text>
      ) : (
        <Stack gap="md">
          {policies.map((policy) => (
            <Card
              key={policy.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <Group justify="space-between" mb="xs">
                <Group gap="sm">
                  <FileText size={20} />
                  <Text fw={600} size="lg">
                    {policy.title}
                  </Text>
                </Group>
                <Group gap="xs">
                  {policy.version && (
                    <Badge variant="outline" size="sm">
                      v{policy.version}
                    </Badge>
                  )}
                  <Badge
                    color={STATUS_COLORS[policy.status] || "gray"}
                    variant="light"
                  >
                    {policy.status || "DRAFT"}
                  </Badge>
                </Group>
              </Group>

              <Text size="sm" c="dimmed" lineClamp={3} mb="md">
                {policy.content}
              </Text>

              <Divider mb="sm" />

              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {policy.created_at
                    ? `Created: ${new Date(policy.created_at).toLocaleDateString()}`
                    : ""}
                  {policy.updated_at
                    ? ` · Updated: ${new Date(policy.updated_at).toLocaleDateString()}`
                    : ""}
                </Text>
                <Group gap="xs">
                  <Button
                    variant="subtle"
                    size="xs"
                    leftSection={<ClockCounterClockwise size={14} />}
                    onClick={() =>
                      setHistoryModal({ open: true, policy })
                    }
                  >
                    History
                  </Button>
                  {policy.status === "PENDING" && (
                    <Button
                      size="xs"
                      color="green"
                      leftSection={<CheckCircle size={14} />}
                      onClick={() => handleApprove(policy.id)}
                    >
                      Approve
                    </Button>
                  )}
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Modal
        opened={historyModal.open}
        onClose={() => setHistoryModal({ open: false, policy: null })}
        title={`Version History: ${historyModal.policy?.title || ""}`}
        size="lg"
      >
        {historyModal.policy?.versions &&
        historyModal.policy.versions.length > 0 ? (
          <Accordion>
            {historyModal.policy.versions.map((ver, idx) => (
              <Accordion.Item key={ver.version || idx} value={`v${ver.version || idx + 1}`}>
                <Accordion.Control>
                  <Group justify="space-between">
                    <Text fw={500}>Version {ver.version || idx + 1}</Text>
                    <Text size="xs" c="dimmed">
                      {ver.created_at
                        ? new Date(ver.created_at).toLocaleDateString()
                        : ""}
                    </Text>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text size="sm">{ver.content}</Text>
                  {ver.change_notes && (
                    <Text size="xs" c="dimmed" mt="xs">
                      Changes: {ver.change_notes}
                    </Text>
                  )}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        ) : (
          <Text c="dimmed" ta="center" py="md">
            No version history available.
          </Text>
        )}
      </Modal>
    </Container>
  );
}

export default PolicyManager;

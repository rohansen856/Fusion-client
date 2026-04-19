import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Paper,
  Card,
  Text,
  Badge,
  Button,
  Group,
  Stack,
  Loader,
  Center,
  Modal,
  ThemeIcon,
  Anchor,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  ClipboardText,
  ArrowSquareOut,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import api from "../api";
import {
  applicationsRoute,
  withdrawApplicationRoute,
} from "../../../routes/placementCellRoutes";

function extractErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (data.non_field_errors?.length) return data.non_field_errors.join(" ");
  if (typeof data === "object") {
    const fieldErr = Object.entries(data)
      .map(([k, v]) => {
        const val = Array.isArray(v) ? v.join(" ") : String(v);
        return `${k}: ${val}`;
      })
      .join(" | ");
    if (fieldErr) return fieldErr;
  }
  return fallback;
}

const STATUS_COLOR = {
  APPLIED: "blue",
  SHORTLISTED: "cyan",
  INTERVIEW: "indigo",
  SELECTED: "green",
  REJECTED: "red",
  WITHDRAWN: "gray",
  OFFER_MADE: "teal",
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawId, setWithdrawId] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(applicationsRoute);
      setApplications(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      showNotification({
        title: "Error",
        message: extractErrorMessage(err, "Failed to load applications"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawId) return;
    setWithdrawing(true);
    try {
      await api.post(withdrawApplicationRoute(withdrawId), {
        withdrawal_reason: "",
      });
      showNotification({
        title: "Withdrawn",
        message:
          "Application withdrawn. The recruiter and placement cell have been notified.",
        color: "green",
      });
      setWithdrawId(null);
      fetchApplications();
    } catch (err) {
      showNotification({
        title: "Error",
        message: extractErrorMessage(err, "Failed to withdraw application"),
        color: "red",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const canWithdraw = (status) =>
    ["APPLIED", "SHORTLISTED"].includes(status?.toUpperCase());

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="lg" py="md">
      <Title order={3} mb="md">
        My Applications
      </Title>

      {applications.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Center>
            <Stack align="center" gap="xs">
              <ThemeIcon size={48} variant="light" color="gray" radius="xl">
                <ClipboardText size={28} />
              </ThemeIcon>
              <Text c="dimmed" size="lg">
                You have not applied to any jobs yet.
              </Text>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Stack gap="md">
          {applications.map((app) => {
            const status = (app.status ?? "").toUpperCase();
            return (
              <Card key={app.id} withBorder radius="md" padding="lg">
                <Group justify="space-between" wrap="wrap" mb="xs">
                  <div>
                    <Text fw={600} size="md">
                      {app.job_title ?? app.title ?? "Untitled"}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {app.company ?? "—"}
                    </Text>
                  </div>
                  <Badge
                    color={STATUS_COLOR[status] ?? "gray"}
                    variant="light"
                    size="lg"
                  >
                    {status || "UNKNOWN"}
                  </Badge>
                </Group>

                {app.applied_on && (
                  <Text size="xs" c="dimmed" mb="xs">
                    Applied on{" "}
                    {new Date(app.applied_on).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                )}

                <Group justify="flex-end" gap="sm">
                  {app.job_id && (
                    <Anchor
                      href={`/placement-cell/timeline?job=${app.job_id}`}
                      size="sm"
                    >
                      <Group gap={4}>
                        <ArrowSquareOut size={14} />
                        Timeline
                      </Group>
                    </Anchor>
                  )}
                  {canWithdraw(status) && (
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      leftSection={<XCircle size={14} />}
                      onClick={() => setWithdrawId(app.id)}
                    >
                      Withdraw
                    </Button>
                  )}
                </Group>
              </Card>
            );
          })}
        </Stack>
      )}

      <Modal
        opened={withdrawId !== null}
        onClose={() => setWithdrawId(null)}
        title="Confirm Withdrawal"
        centered
      >
        <Stack gap="md">
          <Group gap="sm">
            <WarningCircle size={24} color="orange" />
            <Text size="sm">
              Are you sure you want to withdraw this application? This action
              cannot be undone.
            </Text>
          </Group>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              onClick={() => setWithdrawId(null)}
              disabled={withdrawing}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleWithdraw}
              loading={withdrawing}
            >
              Withdraw
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

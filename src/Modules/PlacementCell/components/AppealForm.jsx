import React, { useState, useEffect, useCallback } from "react";
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
  TextInput,
  Textarea,
  Select,
  ThemeIcon,
  Divider,
  Modal,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  Scales,
  PaperPlaneTilt,
  ClockCounterClockwise,
  XCircle,
} from "@phosphor-icons/react";
import api from "../api";
import {
  appealsRoute,
  applicationsRoute,
  withdrawAppealRoute,
} from "../../../routes/placementCellRoutes";

function extractErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === "string") {
    const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(data);
    if (looksLikeHtml) return fallback;
    const trimmed = data.trim();
    return trimmed.length > 240 ? fallback : trimmed || fallback;
  }
  return (
    data.detail ||
    data.message ||
    (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) ||
    fallback
  );
}

const STATUS_COLOR = {
  SUBMITTED: "blue",
  UNDER_REVIEW: "orange",
  RESOLVED: "green",
  DISMISSED: "red",
  WITHDRAWN: "gray",
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(target);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}

export default function AppealForm() {
  const [appeals, setAppeals] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [appealType, setAppealType] = useState("OTHER");
  const [againstApplication, setAgainstApplication] = useState(null);

  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [appealsRes, appsRes] = await Promise.all([
        api.get(appealsRoute),
        api.get(applicationsRoute),
      ]);
      setAppeals(
        Array.isArray(appealsRes.data)
          ? appealsRes.data
          : appealsRes.data.results ?? [],
      );
      const appsList = Array.isArray(appsRes.data)
        ? appsRes.data
        : appsRes.data.results ?? [];
      setApplications(appsList);
    } catch (err) {
      showNotification({
        title: "Error",
        message: extractErrorMessage(err, "Failed to load data"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const openWithdrawModal = (appeal) => {
    setWithdrawTarget(appeal);
    setWithdrawReason("");
  };

  const closeWithdrawModal = () => {
    if (withdrawing) return;
    setWithdrawTarget(null);
    setWithdrawReason("");
  };

  const confirmWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      await api.post(withdrawAppealRoute(withdrawTarget.id), {
        withdrawal_reason: withdrawReason.trim(),
      });
      showNotification({
        title: "Appeal withdrawn",
        message: "Your appeal has been withdrawn and the TPO was notified.",
        color: "green",
      });
      setWithdrawTarget(null);
      setWithdrawReason("");
      fetchData();
    } catch (err) {
      showNotification({
        title: "Could not withdraw appeal",
        message: extractErrorMessage(err, "Please try again."),
        color: "red",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      showNotification({
        title: "Validation",
        message: "Subject and description are required",
        color: "orange",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        subject: subject.trim(),
        description: description.trim(),
        appeal_type: appealType,
      };
      if (againstApplication) {
        payload.against_application = Number(againstApplication);
      }
      await api.post(appealsRoute, payload);
      showNotification({
        title: "Appeal Submitted",
        message: "Your appeal has been filed successfully",
        color: "green",
      });
      setSubject("");
      setDescription("");
      setAppealType("OTHER");
      setAgainstApplication(null);
      fetchData();
    } catch (err) {
      showNotification({
        title: "Error",
        message: extractErrorMessage(err, "Failed to submit appeal"),
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const applicationOptions = applications.map((app) => ({
    value: String(app.id),
    label: `${app.job_title ?? app.title ?? "Application"} — ${app.company ?? ""}`.trim(),
  }));

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
        Appeals
      </Title>

      <Paper withBorder radius="md" p="lg" mb="xl">
        <Title order={5} mb="sm">
          File a New Appeal
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput
              label="Subject"
              placeholder="Brief summary of your appeal"
              value={subject}
              onChange={(e) => setSubject(e.currentTarget.value)}
              required
            />
            <Select
              label="Appeal Type"
              data={[
                { value: "REJECTION", label: "Rejection Appeal" },
                { value: "POLICY_VIOLATION", label: "Policy Violation" },
                { value: "OTHER", label: "Other" },
              ]}
              value={appealType}
              onChange={setAppealType}
              required
            />
            <Textarea
              label="Description"
              placeholder="Provide details about your appeal…"
              minRows={4}
              autosize
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              required
            />
            <Select
              label="Against Application (optional)"
              placeholder="Select an application"
              data={applicationOptions}
              value={againstApplication}
              onChange={setAgainstApplication}
              clearable
              searchable
            />
            <Group justify="flex-end">
              <Button
                type="submit"
                leftSection={<PaperPlaneTilt size={16} />}
                loading={submitting}
              >
                Submit Appeal
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>

      <Divider mb="md" />

      <Title order={5} mb="sm">
        <Group gap="xs">
          <ClockCounterClockwise size={18} />
          Your Appeals
        </Group>
      </Title>

      {appeals.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Center>
            <Stack align="center" gap="xs">
              <ThemeIcon size={48} variant="light" color="gray" radius="xl">
                <Scales size={28} />
              </ThemeIcon>
              <Text c="dimmed" size="lg">
                You have not filed any appeals.
              </Text>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Stack gap="sm">
          {appeals.map((appeal) => {
            const status = (appeal.status ?? "").toUpperCase();
            const filedOn =
              formatDate(appeal.filed_at) ?? formatDate(appeal.created_at);
            const resolvedOn = formatDate(appeal.resolved_at);
            const resolver =
              appeal.resolved_by_username ?? appeal.resolved_by_name ?? "TPO";
            const resolution =
              appeal.resolution_text ?? appeal.resolution ?? "";
            const isPending =
              status === "SUBMITTED" || status === "UNDER_REVIEW";
            const daysLeft = isPending ? daysUntil(appeal.due_date) : null;
            const dueLabel = formatDate(appeal.due_date);

            let dueMessage = null;
            let dueColor = "dimmed";
            if (isPending && daysLeft !== null) {
              if (daysLeft > 1) {
                dueMessage = `Auto-dismisses in ${daysLeft} days (${dueLabel}) if the TPO doesn't respond.`;
              } else if (daysLeft === 1) {
                dueMessage = `Auto-dismisses tomorrow (${dueLabel}) if the TPO doesn't respond.`;
                dueColor = "orange";
              } else if (daysLeft === 0) {
                dueMessage = `Auto-dismisses today (${dueLabel}) if the TPO doesn't respond.`;
                dueColor = "orange";
              } else {
                dueMessage = `Overdue since ${dueLabel}. Will be auto-dismissed on next refresh.`;
                dueColor = "red";
              }
            }

            return (
              <Card key={appeal.id} withBorder radius="md" padding="md">
                <Group justify="space-between" mb={4} wrap="wrap">
                  <Text fw={600} size="sm">
                    {appeal.subject ?? "Untitled Appeal"}
                  </Text>
                  <Badge
                    color={STATUS_COLOR[status] ?? "gray"}
                    variant="light"
                  >
                    {status.replace("_", " ") || "UNKNOWN"}
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed" lineClamp={3}>
                  {appeal.description ?? "—"}
                </Text>
                {filedOn && (
                  <Text size="xs" c="dimmed" mt="xs">
                    Filed {filedOn}
                  </Text>
                )}
                {dueMessage && (
                  <Text size="xs" c={dueColor} mt={4}>
                    {dueMessage}
                  </Text>
                )}
                {(status === "RESOLVED" ||
                  status === "DISMISSED" ||
                  status === "WITHDRAWN") && (
                  <Paper
                    bg={
                      status === "RESOLVED"
                        ? "green.0"
                        : status === "WITHDRAWN"
                          ? "gray.0"
                          : "red.0"
                    }
                    p="sm"
                    radius="sm"
                    mt="sm"
                    withBorder
                  >
                    <Text size="xs" fw={600} mb={2}>
                      {status === "RESOLVED"
                        ? "Resolution from TPO"
                        : status === "WITHDRAWN"
                          ? "Withdrawal note"
                          : "Dismissal note"}
                    </Text>
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {resolution.trim()
                        ? resolution
                        : "No message was provided."}
                    </Text>
                    <Text size="xs" c="dimmed" mt={6}>
                      {status === "WITHDRAWN"
                        ? resolvedOn
                          ? `Withdrawn by you · ${resolvedOn}`
                          : "Withdrawn by you"
                        : resolvedOn
                          ? `By ${resolver} · ${resolvedOn}`
                          : `By ${resolver}`}
                    </Text>
                  </Paper>
                )}
                {isPending && (
                  <Group justify="flex-end" mt="sm">
                    <Button
                      variant="light"
                      color="red"
                      size="xs"
                      leftSection={<XCircle size={14} />}
                      onClick={() => openWithdrawModal(appeal)}
                    >
                      Withdraw appeal
                    </Button>
                  </Group>
                )}
              </Card>
            );
          })}
        </Stack>
      )}

      <Modal
        opened={Boolean(withdrawTarget)}
        onClose={closeWithdrawModal}
        title="Withdraw appeal"
        centered
        size="md"
      >
        <Stack gap="sm">
          <Text size="sm">
            Are you sure you want to withdraw{" "}
            <Text span fw={600}>
              {withdrawTarget?.subject ?? "this appeal"}
            </Text>
            ? The TPO will be notified and this action can&apos;t be undone —
            you would need to file a fresh appeal.
          </Text>
          <Textarea
            label="Reason (optional)"
            placeholder="Let the TPO know why you're withdrawing this appeal…"
            minRows={3}
            autosize
            value={withdrawReason}
            onChange={(e) => setWithdrawReason(e.currentTarget.value)}
            disabled={withdrawing}
          />
          <Group justify="flex-end" mt="sm">
            <Button
              variant="default"
              onClick={closeWithdrawModal}
              disabled={withdrawing}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={withdrawing}
              leftSection={<XCircle size={16} />}
              onClick={confirmWithdraw}
            >
              Withdraw appeal
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

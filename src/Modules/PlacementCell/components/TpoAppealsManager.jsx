import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  ArrowClockwise,
  CheckCircle,
  ClockCounterClockwise,
  MagnifyingGlass,
  Scales,
  ShieldCheck,
  XCircle,
} from "@phosphor-icons/react";
import api from "../api";
import {
  allAppealsRoute,
  resolveAppealRoute,
  reviewAppealRoute,
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

const STATUS_LABEL = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
  WITHDRAWN: "Withdrawn",
};

const TYPE_LABEL = {
  REJECTION: "Rejection Appeal",
  POLICY_VIOLATION: "Policy Violation",
  OTHER: "Other",
};

const STATUS_FILTERS = [
  { value: "ALL", label: "All appeals" },
  { value: "PENDING", label: "Pending (Submitted / Under review)" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

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

function formatDateTime(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function StudentInfo({ appeal }) {
  const name =
    appeal.filed_by_full_name ||
    appeal.filed_by_username ||
    `User ${appeal.filed_by ?? ""}`;
  const username = appeal.filed_by_username;
  return (
    <Text size="sm" fw={600}>
      {name}
      {username && username !== name && (
        <Text span size="xs" c="dimmed" ml={6}>
          @{username}
        </Text>
      )}
    </Text>
  );
}

function JobContext({ appeal }) {
  if (!appeal.application_id && !appeal.application_job_title) return null;
  const title = appeal.application_job_title || `Application #${appeal.application_id}`;
  const company = appeal.application_company;
  return (
    <Text size="xs" c="dimmed">
      Against: <Text span fw={500}>{title}</Text>
      {company ? ` · ${company}` : ""}
    </Text>
  );
}

export default function TpoAppealsManager() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");

  const [reviewingId, setReviewingId] = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolveStatus, setResolveStatus] = useState("RESOLVED");
  const [resolutionText, setResolutionText] = useState("");
  const [resolving, setResolving] = useState(false);

  const fetchAppeals = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await api.get(allAppealsRoute);
      const payload = Array.isArray(res.data)
        ? res.data
        : res.data?.results ?? [];
      setAppeals(payload);
    } catch (err) {
      showNotification({
        title: "Could not load appeals",
        message: extractErrorMessage(err, "Please try again."),
        color: "red",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);

  const handleMarkReview = async (appeal) => {
    setReviewingId(appeal.id);
    try {
      await api.post(reviewAppealRoute(appeal.id));
      showNotification({
        title: "Appeal under review",
        message: `${appeal.subject || "Appeal"} was moved to Under review. The student has been notified.`,
        color: "orange",
      });
      fetchAppeals({ quiet: true });
    } catch (err) {
      showNotification({
        title: "Could not update appeal",
        message: extractErrorMessage(err, "Please try again."),
        color: "red",
      });
    } finally {
      setReviewingId(null);
    }
  };

  const openResolve = (appeal, status) => {
    setResolveTarget(appeal);
    setResolveStatus(status);
    setResolutionText("");
  };

  const closeResolve = () => {
    if (resolving) return;
    setResolveTarget(null);
    setResolutionText("");
  };

  const submitResolve = async () => {
    if (!resolveTarget) return;
    const trimmed = resolutionText.trim();
    if (trimmed.length < 5) {
      showNotification({
        title: "Please add a note",
        message: "The student will see this note — at least 5 characters required.",
        color: "orange",
      });
      return;
    }
    setResolving(true);
    try {
      await api.post(resolveAppealRoute(resolveTarget.id), {
        status: resolveStatus,
        resolution_text: trimmed,
      });
      showNotification({
        title: resolveStatus === "RESOLVED" ? "Appeal resolved" : "Appeal dismissed",
        message: `The student and placement staff have been notified.`,
        color: resolveStatus === "RESOLVED" ? "green" : "red",
      });
      setResolveTarget(null);
      setResolutionText("");
      fetchAppeals({ quiet: true });
    } catch (err) {
      showNotification({
        title: "Could not update appeal",
        message: extractErrorMessage(err, "Please try again."),
        color: "red",
      });
    } finally {
      setResolving(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appeals.filter((appeal) => {
      const status = (appeal.status || "").toUpperCase();
      if (statusFilter === "PENDING") {
        if (!(status === "SUBMITTED" || status === "UNDER_REVIEW")) return false;
      } else if (statusFilter !== "ALL") {
        if (status !== statusFilter) return false;
      }
      if (!q) return true;
      const haystack = [
        appeal.subject,
        appeal.description,
        appeal.filed_by_username,
        appeal.filed_by_full_name,
        appeal.application_job_title,
        appeal.application_company,
        appeal.appeal_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [appeals, search, statusFilter]);

  const counts = useMemo(() => {
    const base = {
      total: appeals.length,
      pending: 0,
      under_review: 0,
      resolved: 0,
      dismissed: 0,
      withdrawn: 0,
    };
    appeals.forEach((appeal) => {
      const s = (appeal.status || "").toUpperCase();
      if (s === "SUBMITTED") base.pending += 1;
      else if (s === "UNDER_REVIEW") base.under_review += 1;
      else if (s === "RESOLVED") base.resolved += 1;
      else if (s === "DISMISSED") base.dismissed += 1;
      else if (s === "WITHDRAWN") base.withdrawn += 1;
    });
    return base;
  }, [appeals]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="lg" py="md">
      <Group justify="space-between" mb="sm" wrap="wrap">
        <Title order={3}>
          <Group gap="xs">
            <Scales size={22} />
            Student Appeals
          </Group>
        </Title>
        <Group gap="xs">
          <Tooltip label="Refresh">
            <Button
              variant="light"
              leftSection={<ArrowClockwise size={16} />}
              onClick={() => fetchAppeals({ quiet: true })}
              loading={refreshing}
            >
              Refresh
            </Button>
          </Tooltip>
        </Group>
      </Group>

      <Group gap="xs" mb="md" wrap="wrap">
        <Badge color="blue" variant="light">
          {counts.pending} submitted
        </Badge>
        <Badge color="orange" variant="light">
          {counts.under_review} under review
        </Badge>
        <Badge color="green" variant="light">
          {counts.resolved} resolved
        </Badge>
        <Badge color="red" variant="light">
          {counts.dismissed} dismissed
        </Badge>
        <Badge color="gray" variant="light">
          {counts.withdrawn} withdrawn
        </Badge>
      </Group>

      <Paper withBorder radius="md" p="md" mb="md">
        <Group align="flex-end" wrap="wrap">
          <TextInput
            label="Search"
            placeholder="Subject, student, job, company…"
            leftSection={<MagnifyingGlass size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            w={320}
          />
          <Select
            label="Status"
            data={STATUS_FILTERS}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val || "ALL")}
            w={260}
          />
        </Group>
      </Paper>

      <Divider mb="md" />

      {filtered.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Center>
            <Stack align="center" gap="xs">
              <ThemeIcon size={48} variant="light" color="gray" radius="xl">
                <Scales size={28} />
              </ThemeIcon>
              <Text c="dimmed" size="lg">
                No appeals match the current filters.
              </Text>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Stack gap="sm">
          {filtered.map((appeal) => {
            const status = (appeal.status || "").toUpperCase();
            const isPending =
              status === "SUBMITTED" || status === "UNDER_REVIEW";
            const filedOn = formatDateTime(appeal.filed_at);
            const resolvedOn = formatDateTime(appeal.resolved_at);
            const resolver =
              appeal.resolved_by_full_name ||
              appeal.resolved_by_username ||
              "TPO";
            const resolution = appeal.resolution_text || "";
            const daysLeft = isPending ? daysUntil(appeal.due_date) : null;
            const dueLabel = formatDate(appeal.due_date);
            let dueMessage = null;
            let dueColor = "dimmed";
            if (isPending && daysLeft !== null) {
              if (daysLeft > 1) {
                dueMessage = `Auto-dismisses in ${daysLeft} days (${dueLabel}) if not actioned.`;
              } else if (daysLeft === 1) {
                dueMessage = `Auto-dismisses tomorrow (${dueLabel}) if not actioned.`;
                dueColor = "orange";
              } else if (daysLeft === 0) {
                dueMessage = `Auto-dismisses today (${dueLabel}) if not actioned.`;
                dueColor = "orange";
              } else {
                dueMessage = `Overdue since ${dueLabel}. Will be auto-dismissed on next refresh.`;
                dueColor = "red";
              }
            }

            return (
              <Card key={appeal.id} withBorder radius="md" padding="md">
                <Group justify="space-between" mb={4} wrap="wrap">
                  <Stack gap={2}>
                    <Text fw={600} size="sm">
                      {appeal.subject || "Untitled appeal"}
                    </Text>
                    <StudentInfo appeal={appeal} />
                    <JobContext appeal={appeal} />
                  </Stack>
                  <Stack gap={4} align="flex-end">
                    <Badge
                      color={STATUS_COLOR[status] ?? "gray"}
                      variant="light"
                    >
                      {STATUS_LABEL[status] ?? status ?? "Unknown"}
                    </Badge>
                    <Badge variant="outline" color="gray" size="sm">
                      {TYPE_LABEL[appeal.appeal_type] || appeal.appeal_type || "OTHER"}
                    </Badge>
                  </Stack>
                </Group>

                <Text size="sm" mt="xs" style={{ whiteSpace: "pre-wrap" }}>
                  {appeal.description || "—"}
                </Text>

                <Group gap="md" mt="xs" wrap="wrap">
                  {filedOn && (
                    <Text size="xs" c="dimmed">
                      Filed {filedOn}
                    </Text>
                  )}
                  {dueMessage && (
                    <Text size="xs" c={dueColor}>
                      {dueMessage}
                    </Text>
                  )}
                </Group>

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
                      {resolution.trim() || "No message was provided."}
                    </Text>
                    <Text size="xs" c="dimmed" mt={6}>
                      {status === "WITHDRAWN"
                        ? resolvedOn
                          ? `Withdrawn by student · ${resolvedOn}`
                          : "Withdrawn by student"
                        : resolvedOn
                          ? `By ${resolver} · ${resolvedOn}`
                          : `By ${resolver}`}
                    </Text>
                  </Paper>
                )}

                {isPending && (
                  <Group justify="flex-end" mt="sm" gap="xs">
                    {status === "SUBMITTED" && (
                      <Button
                        variant="light"
                        color="orange"
                        size="xs"
                        leftSection={<ClockCounterClockwise size={14} />}
                        loading={reviewingId === appeal.id}
                        onClick={() => handleMarkReview(appeal)}
                      >
                        Mark under review
                      </Button>
                    )}
                    <Button
                      variant="light"
                      color="green"
                      size="xs"
                      leftSection={<CheckCircle size={14} />}
                      onClick={() => openResolve(appeal, "RESOLVED")}
                    >
                      Resolve
                    </Button>
                    <Button
                      variant="light"
                      color="red"
                      size="xs"
                      leftSection={<XCircle size={14} />}
                      onClick={() => openResolve(appeal, "DISMISSED")}
                    >
                      Dismiss
                    </Button>
                  </Group>
                )}
              </Card>
            );
          })}
        </Stack>
      )}

      <Modal
        opened={Boolean(resolveTarget)}
        onClose={closeResolve}
        centered
        size="md"
        title={
          <Group gap="xs">
            <ThemeIcon
              size={28}
              radius="md"
              variant="light"
              color={resolveStatus === "RESOLVED" ? "green" : "red"}
            >
              <ShieldCheck size={18} />
            </ThemeIcon>
            <Text fw={600}>
              {resolveStatus === "RESOLVED"
                ? "Resolve appeal"
                : "Dismiss appeal"}
            </Text>
          </Group>
        }
      >
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Provide a message for{" "}
            <Text span fw={600}>
              {resolveTarget?.filed_by_full_name ||
                resolveTarget?.filed_by_username ||
                "the student"}
            </Text>
            . They and the other placement staff will be notified.
          </Text>
          <Select
            label="Outcome"
            data={[
              { value: "RESOLVED", label: "Resolved — grant the appeal" },
              { value: "DISMISSED", label: "Dismissed — decline the appeal" },
            ]}
            value={resolveStatus}
            onChange={(val) => setResolveStatus(val || "RESOLVED")}
            disabled={resolving}
          />
          <Textarea
            label="Message to the student"
            placeholder="Explain the decision so the student has context…"
            minRows={4}
            autosize
            value={resolutionText}
            onChange={(e) => setResolutionText(e.currentTarget.value)}
            disabled={resolving}
          />
          <Group justify="flex-end" mt="xs">
            <Button variant="default" onClick={closeResolve} disabled={resolving}>
              Cancel
            </Button>
            <Button
              color={resolveStatus === "RESOLVED" ? "green" : "red"}
              loading={resolving}
              leftSection={
                resolveStatus === "RESOLVED" ? (
                  <CheckCircle size={16} />
                ) : (
                  <XCircle size={16} />
                )
              }
              onClick={submitResolve}
            >
              {resolveStatus === "RESOLVED" ? "Resolve appeal" : "Dismiss appeal"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

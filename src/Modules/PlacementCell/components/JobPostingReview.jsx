import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Card,
  Text,
  Group,
  Button,
  Badge,
  Loader,
  Stack,
  Modal,
  Textarea,
  SimpleGrid,
  Alert,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  Briefcase,
  CheckCircle,
  XCircle,
  ArrowsClockwise,
  CurrencyDollar,
  Buildings,
  Warning,
} from "@phosphor-icons/react";
import api from "../api";
import {
  jobPostingReviewListRoute,
  jobPostingReviewRoute,
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
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) {
    return data.non_field_errors[0];
  }
  for (const key of Object.keys(data)) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value;
    if (Array.isArray(value) && value[0]) return String(value[0]);
  }
  return fallback;
}

export default function JobPostingReview() {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [reasonModal, setReasonModal] = useState({
    open: false,
    id: null,
    action: null,
    title: "",
  });
  const [reason, setReason] = useState("");

  const fetchPostings = async () => {
    setLoading(true);
    try {
      const response = await api.get(jobPostingReviewListRoute);
      setPostings(response.data?.results ?? response.data ?? []);
    } catch (error) {
      showNotification({
        title: "Error",
        message: extractErrorMessage(
          error,
          "Failed to fetch pending job postings.",
        ),
        color: "red",
        icon: <Warning size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.post(jobPostingReviewRoute(id), { action: "approve" });
      showNotification({
        title: "Approved",
        message: "Job posting approved and published.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });
      setPostings((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      showNotification({
        title: "Error",
        message: extractErrorMessage(error, "Failed to approve job posting."),
        color: "red",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openReasonModal = (id, action, title) => {
    setReasonModal({ open: true, id, action, title });
    setReason("");
  };

  const handleReasonSubmit = async () => {
    if (!reason.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Please provide a reason.",
        color: "red",
      });
      return;
    }

    setActionLoading(reasonModal.id);
    try {
      await api.post(jobPostingReviewRoute(reasonModal.id), {
        action: reasonModal.action,
        reason: reason.trim(),
      });

      const label =
        reasonModal.action === "reject" ? "Rejected" : "Revision Requested";
      showNotification({
        title: label,
        message: `Job posting has been ${label.toLowerCase()}.`,
        color: reasonModal.action === "reject" ? "red" : "orange",
        icon:
          reasonModal.action === "reject" ? (
            <XCircle size={18} />
          ) : (
            <ArrowsClockwise size={18} />
          ),
      });

      setPostings((prev) =>
        prev.filter((p) => p.id !== reasonModal.id),
      );
      setReasonModal({ open: false, id: null, action: null, title: "" });
    } catch (error) {
      showNotification({
        title: "Error",
        message: extractErrorMessage(error, "Action failed."),
        color: "red",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatCTC = (val) => {
    if (val === null || val === undefined || val === "") return "—";
    const num = Number(val);
    if (Number.isNaN(num)) return String(val);
    // package_ctc is stored in LPA on the backend (e.g. 18.00 = 18 LPA), but
    // be safe for legacy rows stored as raw rupees per annum.
    return num >= 10000
      ? `${(num / 100000).toFixed(2)} LPA`
      : `${num.toFixed(2)} LPA`;
  };

  const formatDeadline = (raw) => {
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
      <Title order={3} mb="lg">
        <Group gap="xs">
          <Briefcase size={24} />
          Job Posting Review
        </Group>
      </Title>

      {postings.length === 0 ? (
        <Alert color="blue" title="All Clear">
          No job postings pending review.
        </Alert>
      ) : (
        <Stack gap="md">
          {postings.map((posting) => {
            const role =
              posting.role_offered ||
              posting.role ||
              posting.designation ||
              "—";
            const ctc =
              posting.package_ctc ?? posting.ctc ?? null;
            const branches = Array.isArray(posting.eligible_branches)
              ? posting.eligible_branches
              : posting.branches || [];
            const programmes = Array.isArray(posting.eligible_programmes)
              ? posting.eligible_programmes
              : [];
            const deadline = formatDeadline(posting.application_deadline);
            const cgpa = posting.eligibility_cgpa;
            return (
            <Card
              key={posting.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <Group justify="space-between" mb="sm">
                <div>
                  <Title order={4}>
                    {posting.title || posting.job_title || "Untitled posting"}
                  </Title>
                  <Group gap="xs" mt={4}>
                    <Buildings size={14} />
                    <Text size="sm" c="dimmed">
                      {posting.company_name || posting.company || "—"}
                    </Text>
                  </Group>
                </div>
                <Badge color="yellow" variant="light" size="lg">
                  Pending
                </Badge>
              </Group>

              {posting.description && (
                <Text size="sm" mb="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {posting.description}
                </Text>
              )}

              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mb="sm">
                <div>
                  <Text size="xs" c="dimmed">
                    Role
                  </Text>
                  <Text size="sm" fw={500}>
                    {role}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    CTC
                  </Text>
                  <Group gap={4}>
                    <CurrencyDollar size={14} />
                    <Text size="sm" fw={500}>
                      {formatCTC(ctc)}
                    </Text>
                  </Group>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Location
                  </Text>
                  <Text size="sm" fw={500}>
                    {posting.location || "—"}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Min CGPA
                  </Text>
                  <Text size="sm" fw={500}>
                    {cgpa !== null && cgpa !== undefined && cgpa !== ""
                      ? Number(cgpa).toFixed(2)
                      : "—"}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Deadline
                  </Text>
                  <Text size="sm" fw={500}>
                    {deadline || "—"}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Positions / Max Apps
                  </Text>
                  <Text size="sm" fw={500}>
                    {(posting.positions_available ?? "—")} ·{" "}
                    {(posting.max_applications ?? "—")}
                  </Text>
                </div>
              </SimpleGrid>

              <div>
                <Text size="xs" c="dimmed">
                  Eligible Branches
                </Text>
                <Group gap={4} mt={2}>
                  {branches.length > 0 ? (
                    branches.map((b) => (
                      <Badge key={b} size="xs" variant="light">
                        {b}
                      </Badge>
                    ))
                  ) : (
                    <Text size="sm">All branches</Text>
                  )}
                </Group>
              </div>

              {programmes.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text size="xs" c="dimmed">
                    Eligible Programmes
                  </Text>
                  <Group gap={4} mt={2}>
                    {programmes.map((p) => (
                      <Badge key={p} size="xs" variant="outline">
                        {p}
                      </Badge>
                    ))}
                  </Group>
                </div>
              )}

              <Divider my="sm" />

              <Group>
                <Button
                  color="green"
                  size="xs"
                  onClick={() => handleApprove(posting.id)}
                  loading={actionLoading === posting.id}
                  leftSection={<CheckCircle size={16} />}
                >
                  Approve
                </Button>
                <Button
                  color="red"
                  variant="outline"
                  size="xs"
                  onClick={() =>
                    openReasonModal(
                      posting.id,
                      "reject",
                      posting.title || posting.job_title,
                    )
                  }
                  disabled={actionLoading === posting.id}
                  leftSection={<XCircle size={16} />}
                >
                  Reject
                </Button>
                <Button
                  color="orange"
                  variant="light"
                  size="xs"
                  onClick={() =>
                    openReasonModal(
                      posting.id,
                      "request_revision",
                      posting.title || posting.job_title,
                    )
                  }
                  disabled={actionLoading === posting.id}
                  leftSection={<ArrowsClockwise size={16} />}
                >
                  Request Revision
                </Button>
              </Group>
            </Card>
            );
          })}
        </Stack>
      )}

      <Modal
        opened={reasonModal.open}
        onClose={() =>
          setReasonModal({ open: false, id: null, action: null, title: "" })
        }
        title={`${reasonModal.action === "reject" ? "Reject" : "Request Revision"}: ${reasonModal.title}`}
        centered
      >
        <Stack gap="md">
          <Textarea
            label={
              reasonModal.action === "reject"
                ? "Reason for Rejection"
                : "Revision Comments"
            }
            placeholder="Provide details..."
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            minRows={3}
            required
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() =>
                setReasonModal({
                  open: false,
                  id: null,
                  action: null,
                  title: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              color={reasonModal.action === "reject" ? "red" : "orange"}
              onClick={handleReasonSubmit}
              loading={actionLoading === reasonModal.id}
            >
              {reasonModal.action === "reject"
                ? "Confirm Reject"
                : "Send Revision Request"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}

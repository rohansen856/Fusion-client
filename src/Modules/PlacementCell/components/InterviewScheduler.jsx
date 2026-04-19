import React, { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Title,
  Group,
  Button,
  Select,
  TextInput,
  NumberInput,
  Loader,
  Modal,
  Stack,
  Badge,
  Divider,
  Text,
  Card,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import {
  CalendarPlus,
  ArrowsClockwise,
  CheckCircle,
  Warning,
} from "@phosphor-icons/react";
import api from "../api";
import {
  interviewsRoute,
  interviewRescheduleRoute,
  approvedJobsRoute,
} from "../../../routes/placementCellRoutes";

// Must match the backend ``RoundType`` TextChoices enum.
const INTERVIEW_TYPES = [
  { value: "ONLINE_TEST", label: "Online Test" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "HR", label: "HR" },
  { value: "GROUP_DISCUSSION", label: "Group Discussion" },
  { value: "OTHER", label: "Other" },
];

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

function formatDate(raw) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function InterviewScheduler() {
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    job_id: null,
    round_number: 1,
    interview_type: null,
    date: null,
    time: "",
    location: "",
  });

  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    interview: null,
  });
  const [rescheduleData, setRescheduleData] = useState({
    date: null,
    time: "",
  });
  const [rescheduling, setRescheduling] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [interviewRes, jobsRes] = await Promise.all([
        api.get(interviewsRoute),
        api.get(approvedJobsRoute),
      ]);
      setInterviews(
        interviewRes.data?.results ?? interviewRes.data ?? [],
      );
      const jobData = jobsRes.data?.results ?? jobsRes.data ?? [];
      setJobs(
        jobData.map((j) => ({
          value: String(j.id),
          label: `${j.title || j.job_title || "Untitled"} — ${j.company_name || j.company || ""}`.trim(),
        })),
      );
    } catch (error) {
      showNotification({
        title: "Error",
        message: extractErrorMessage(error, "Failed to load interview data."),
        color: "red",
        icon: <Warning size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.job_id || !formData.interview_type || !formData.date) {
      showNotification({
        title: "Validation Error",
        message: "Please fill in all required fields.",
        color: "red",
      });
      return;
    }

    if (!formData.time) {
      showNotification({
        title: "Validation Error",
        message: "Please choose a time for the interview.",
        color: "red",
      });
      return;
    }

    setCreating(true);
    try {
      const time = formData.time.length === 5
        ? `${formData.time}:00`
        : formData.time;
      const payload = {
        job: Number(formData.job_id),
        round_number: formData.round_number,
        round_type: formData.interview_type,
        scheduled_date: formData.date.toISOString().split("T")[0],
        scheduled_time: time,
        location: formData.location || "",
      };

      const response = await api.post(interviewsRoute, payload);
      setInterviews((prev) => [...prev, response.data]);

      showNotification({
        title: "Interview Scheduled",
        message: "New interview round has been created.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });

      setFormData({
        job_id: null,
        round_number: 1,
        interview_type: null,
        date: null,
        time: "",
        location: "",
      });
    } catch (error) {
      showNotification({
        title: "Error",
        message: extractErrorMessage(error, "Failed to schedule interview."),
        color: "red",
      });
    } finally {
      setCreating(false);
    }
  };

  const openReschedule = (interview) => {
    const rescheduleCount = interview.reschedule_count || 0;
    if (rescheduleCount >= 2) {
      showNotification({
        title: "Limit Reached",
        message: "This interview has already been rescheduled twice.",
        color: "orange",
        icon: <Warning size={18} />,
      });
      return;
    }
    setRescheduleModal({ open: true, interview });
    setRescheduleData({ date: null, time: "" });
  };

  const handleReschedule = async () => {
    if (!rescheduleData.date) {
      showNotification({
        title: "Validation Error",
        message: "Please select a new date.",
        color: "red",
      });
      return;
    }

    if (!rescheduleData.time) {
      showNotification({
        title: "Validation Error",
        message: "Please choose a new time.",
        color: "red",
      });
      return;
    }

    setRescheduling(true);
    try {
      const time = rescheduleData.time.length === 5
        ? `${rescheduleData.time}:00`
        : rescheduleData.time;
      const payload = {
        scheduled_date: rescheduleData.date.toISOString().split("T")[0],
        scheduled_time: time,
      };

      await api.post(
        interviewRescheduleRoute(rescheduleModal.interview.id),
        payload,
      );

      setInterviews((prev) =>
        prev.map((iv) =>
          iv.id === rescheduleModal.interview.id
            ? {
                ...iv,
                scheduled_date: payload.scheduled_date,
                scheduled_time: payload.scheduled_time,
                reschedule_count: (iv.reschedule_count || 0) + 1,
              }
            : iv,
        ),
      );

      showNotification({
        title: "Rescheduled",
        message: "Interview has been rescheduled.",
        color: "green",
        icon: <ArrowsClockwise size={18} />,
      });

      setRescheduleModal({ open: false, interview: null });
    } catch (error) {
      showNotification({
        title: "Error",
        message: extractErrorMessage(error, "Failed to reschedule interview."),
        color: "red",
      });
    } finally {
      setRescheduling(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "job_title",
        header: "Job",
        accessorFn: (row) =>
          row.job_title || row.title || `Job #${row.job ?? row.job_id ?? "—"}`,
      },
      {
        accessorKey: "round_number",
        header: "Round",
        size: 80,
      },
      {
        accessorKey: "round_type",
        header: "Type",
        Cell: ({ cell }) => (
          <Badge variant="light">
            {INTERVIEW_TYPES.find((t) => t.value === cell.getValue())
              ?.label || cell.getValue() || "—"}
          </Badge>
        ),
      },
      {
        accessorKey: "scheduled_date",
        header: "Date",
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        accessorKey: "scheduled_time",
        header: "Time",
        Cell: ({ cell }) => {
          const v = cell.getValue();
          if (!v) return "—";
          return typeof v === "string" ? v.slice(0, 5) : v;
        },
      },
      {
        accessorKey: "location",
        header: "Location",
        Cell: ({ cell }) => cell.getValue() || "—",
      },
      {
        accessorKey: "reschedule_count",
        header: "Reschedules",
        size: 100,
        Cell: ({ row }) => {
          const count = row.original.reschedule_count || 0;
          return (
            <Badge color={count >= 2 ? "red" : "gray"} variant="light">
              {count}/2
            </Badge>
          );
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        enableSorting: false,
        Cell: ({ row }) => (
          <Button
            size="xs"
            variant="light"
            color="orange"
            onClick={() => openReschedule(row.original)}
            disabled={(row.original.reschedule_count || 0) >= 2}
            leftSection={<ArrowsClockwise size={14} />}
          >
            Reschedule
          </Button>
        ),
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: interviews,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
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
      <Title order={3} mb="lg">
        <Group gap="xs">
          <CalendarPlus size={24} />
          Interview Scheduler
        </Group>
      </Title>

      <Card withBorder p="md" mb="lg" bg="gray.0">
        <Text fw={500} mb="sm">
          Schedule New Interview
        </Text>
        <form onSubmit={handleCreate}>
          <Group align="flex-end" grow>
            <Select
              label="Job"
              placeholder="Select a job"
              data={jobs}
              value={formData.job_id}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, job_id: val }))
              }
              searchable
              required
            />
            <NumberInput
              label="Round Number"
              value={formData.round_number}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  round_number: val,
                }))
              }
              min={1}
              max={20}
              w={120}
            />
            <Select
              label="Interview Type"
              placeholder="Select type"
              data={INTERVIEW_TYPES}
              value={formData.interview_type}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  interview_type: val,
                }))
              }
              required
            />
          </Group>
          <Group align="flex-end" grow mt="sm">
            <DateInput
              label="Date"
              placeholder="Select date"
              value={formData.date}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, date: val }))
              }
              minDate={new Date()}
              required
            />
            <TimeInput
              label="Time"
              value={formData.time}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  time: e.currentTarget.value,
                }))
              }
            />
            <TextInput
              label="Location"
              placeholder="e.g. Room 301, Main Building"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location: e.currentTarget.value,
                }))
              }
            />
          </Group>
          <Group mt="md">
            <Button
              type="submit"
              loading={creating}
              leftSection={<CalendarPlus size={18} />}
            >
              Schedule Interview
            </Button>
          </Group>
        </form>
      </Card>

      <Divider mb="md" />

      <Title order={4} mb="sm">
        Scheduled Interviews
      </Title>
      <MantineReactTable table={table} />

      <Modal
        opened={rescheduleModal.open}
        onClose={() =>
          setRescheduleModal({ open: false, interview: null })
        }
        title="Reschedule Interview"
        centered
      >
        <Stack gap="md">
          {rescheduleModal.interview && (
            <Text size="sm" c="dimmed">
              Rescheduling round {rescheduleModal.interview.round_number}{" "}
              for{" "}
              {rescheduleModal.interview.job_title ||
                rescheduleModal.interview.title}
              . (Used {rescheduleModal.interview.reschedule_count || 0}
              /2 reschedules)
            </Text>
          )}
          <DateInput
            label="New Date"
            placeholder="Select new date"
            value={rescheduleData.date}
            onChange={(val) =>
              setRescheduleData((prev) => ({ ...prev, date: val }))
            }
            minDate={new Date()}
            required
          />
          <TimeInput
            label="New Time"
            value={rescheduleData.time}
            onChange={(e) =>
              setRescheduleData((prev) => ({
                ...prev,
                time: e.currentTarget.value,
              }))
            }
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() =>
                setRescheduleModal({ open: false, interview: null })
              }
            >
              Cancel
            </Button>
            <Button
              color="orange"
              onClick={handleReschedule}
              loading={rescheduling}
            >
              Confirm Reschedule
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}

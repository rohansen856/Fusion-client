import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Button,
  TextInput,
  Select,
  Textarea,
  Badge,
  Loader,
  Center,
  Stack,
  Grid,
  Divider,
  Modal,
  Table,
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import {
  CalendarPlus,
  ChatTeardropText,
  Clock,
  ArrowLeft,
} from "@phosphor-icons/react";
import api from "../api";
import {
  myJobsRoute,
  myJobInterviewsRoute,
  submitFeedbackRoute,
} from "../../../routes/placementCellRoutes";

const ROUND_TYPES = [
  { value: "TECHNICAL", label: "Technical" },
  { value: "HR", label: "HR" },
  { value: "GROUP_DISCUSSION", label: "Group Discussion" },
  { value: "CODING", label: "Coding Test" },
  { value: "CASE_STUDY", label: "Case Study" },
];

function InterviewManager({ jobId: propJobId }) {
  const [selectedJobId, setSelectedJobId] = useState(propJobId || null);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(!propJobId);
  const [loading, setLoading] = useState(false);
  const [rounds, setRounds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({
    open: false,
    roundId: null,
    candidateId: null,
    candidateName: "",
  });
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState("");

  const [newRound, setNewRound] = useState({
    type: "",
    date: null,
    time: "",
    location: "",
  });

  const jobId = propJobId || selectedJobId;

  useEffect(() => {
    if (!propJobId) fetchJobs();
  }, [propJobId]);

  useEffect(() => {
    if (jobId) fetchInterviews();
  }, [jobId]);

  async function fetchJobs() {
    try {
      setJobsLoading(true);
      const response = await api.get(myJobsRoute);
      setJobs(response.data.results || response.data || []);
    } catch (error) {
      showNotification({ title: "Error", message: "Failed to load jobs", color: "red" });
    } finally {
      setJobsLoading(false);
    }
  }

  async function fetchInterviews() {
    try {
      setLoading(true);
      const response = await api.get(myJobInterviewsRoute(jobId));
      setRounds(response.data.results || response.data || []);
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to load interview rounds",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRound(e) {
    e.preventDefault();
    if (!newRound.type || !newRound.date) {
      showNotification({
        title: "Validation Error",
        message: "Type and date are required",
        color: "yellow",
      });
      return;
    }

    try {
      setSubmitting(true);
      await api.post(myJobInterviewsRoute(jobId), {
        round_type: newRound.type,
        date: newRound.date?.toISOString().split("T")[0],
        time: newRound.time || null,
        location: newRound.location,
      });
      showNotification({
        title: "Success",
        message: "Interview round scheduled",
        color: "green",
      });
      setShowForm(false);
      setNewRound({ type: "", date: null, time: "", location: "" });
      fetchInterviews();
    } catch (error) {
      showNotification({
        title: "Error",
        message:
          error.response?.data?.detail || "Failed to create interview round",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitFeedback() {
    if (!feedbackText.trim()) {
      showNotification({
        title: "Validation",
        message: "Please provide feedback text",
        color: "yellow",
      });
      return;
    }

    try {
      setSubmitting(true);
      await api.post(submitFeedbackRoute(jobId), {
        round_id: feedbackModal.roundId,
        candidate_id: feedbackModal.candidateId,
        feedback: feedbackText,
        rating: feedbackRating || null,
      });
      showNotification({
        title: "Success",
        message: `Feedback submitted for ${feedbackModal.candidateName}`,
        color: "green",
      });
      setFeedbackModal({ open: false, roundId: null, candidateId: null, candidateName: "" });
      setFeedbackText("");
      setFeedbackRating("");
      fetchInterviews();
    } catch (error) {
      showNotification({
        title: "Error",
        message:
          error.response?.data?.detail || "Failed to submit feedback",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (jobsLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!jobId) {
    return (
      <Container fluid>
        <Title order={2} mb="lg">Interview Manager</Title>
        {jobs.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No job postings found. Create a job posting first.
          </Text>
        ) : (
          <Stack gap="sm">
            <Text c="dimmed" mb="xs">Select a job posting to manage its interviews:</Text>
            {jobs.map((job) => (
              <Card
                key={job.id}
                shadow="sm"
                padding="md"
                radius="md"
                withBorder
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedJobId(job.id)}
              >
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>{job.title}</Text>
                    <Text size="sm" c="dimmed">{job.role_offered} &middot; {job.location}</Text>
                  </div>
                  <Badge color={job.posting_status === "ACTIVE" ? "green" : "yellow"} variant="light">
                    {job.posting_status}
                  </Badge>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    );
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
        <Group gap="sm">
          {!propJobId && (
            <Button
              variant="subtle"
              leftSection={<ArrowLeft size={16} />}
              onClick={() => { setSelectedJobId(null); setRounds([]); }}
            >
              Back
            </Button>
          )}
          <Title order={2}>Interview Manager</Title>
        </Group>
        <Button
          leftSection={<CalendarPlus size={16} />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Schedule New Round"}
        </Button>
      </Group>

      {showForm && (
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
          <Title order={4} mb="md">
            New Interview Round
          </Title>
          <form onSubmit={handleCreateRound}>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Round Type"
                  placeholder="Select type"
                  data={ROUND_TYPES}
                  value={newRound.type}
                  onChange={(val) =>
                    setNewRound((prev) => ({ ...prev, type: val }))
                  }
                  required
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <DatePickerInput
                  label="Date"
                  placeholder="Select date"
                  value={newRound.date}
                  onChange={(val) =>
                    setNewRound((prev) => ({ ...prev, date: val }))
                  }
                  minDate={new Date()}
                  required
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TimeInput
                  label="Time"
                  value={newRound.time}
                  onChange={(e) =>
                    setNewRound((prev) => ({ ...prev, time: e.target.value }))
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Location"
                  placeholder="e.g. Room 201, Main Building"
                  value={newRound.location}
                  onChange={(e) =>
                    setNewRound((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </Grid.Col>
            </Grid>
            <Group justify="flex-end" mt="md">
              <Button type="submit" loading={submitting}>
                Schedule Round
              </Button>
            </Group>
          </form>
        </Card>
      )}

      {rounds.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No interview rounds scheduled yet.
        </Text>
      ) : (
        <Stack gap="md">
          {rounds.map((round, index) => (
            <Card key={round.id || index} shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="sm">
                <Group gap="sm">
                  <Badge variant="light" size="lg">
                    Round {index + 1}
                  </Badge>
                  <Badge
                    color={
                      round.round_type === "TECHNICAL"
                        ? "blue"
                        : round.round_type === "HR"
                          ? "green"
                          : "violet"
                    }
                    variant="light"
                  >
                    {round.round_type?.replace(/_/g, " ") || "Interview"}
                  </Badge>
                </Group>
                <Group gap="xs">
                  <Clock size={14} />
                  <Text size="sm" c="dimmed">
                    {round.date
                      ? new Date(round.date).toLocaleDateString()
                      : "TBD"}
                    {round.time ? ` at ${round.time}` : ""}
                  </Text>
                </Group>
              </Group>

              {round.location && (
                <Text size="sm" c="dimmed" mb="sm">
                  Location: {round.location}
                </Text>
              )}

              <Divider my="sm" />

              {round.candidates && round.candidates.length > 0 ? (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Candidate</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Feedback</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {round.candidates.map((candidate) => (
                      <Table.Tr key={candidate.id}>
                        <Table.Td>{candidate.name}</Table.Td>
                        <Table.Td>
                          <Badge
                            color={
                              candidate.status === "PASSED"
                                ? "green"
                                : candidate.status === "FAILED"
                                  ? "red"
                                  : "gray"
                            }
                            variant="light"
                            size="sm"
                          >
                            {candidate.status || "PENDING"}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={1}>
                            {candidate.feedback || "—"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Button
                            variant="light"
                            size="xs"
                            leftSection={<ChatTeardropText size={14} />}
                            onClick={() =>
                              setFeedbackModal({
                                open: true,
                                roundId: round.id,
                                candidateId: candidate.id,
                                candidateName: candidate.name,
                              })
                            }
                          >
                            Feedback
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text size="sm" c="dimmed">
                  No candidates assigned to this round.
                </Text>
              )}
            </Card>
          ))}
        </Stack>
      )}

      <Modal
        opened={feedbackModal.open}
        onClose={() =>
          setFeedbackModal({ open: false, roundId: null, candidateId: null, candidateName: "" })
        }
        title={`Feedback for ${feedbackModal.candidateName}`}
      >
        <Stack gap="md">
          <Select
            label="Rating"
            placeholder="Select rating"
            data={[
              { value: "EXCELLENT", label: "Excellent" },
              { value: "GOOD", label: "Good" },
              { value: "AVERAGE", label: "Average" },
              { value: "BELOW_AVERAGE", label: "Below Average" },
              { value: "POOR", label: "Poor" },
            ]}
            value={feedbackRating}
            onChange={setFeedbackRating}
          />
          <Textarea
            label="Feedback"
            placeholder="Provide detailed feedback..."
            minRows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            required
          />
          <Group justify="flex-end">
            <Button loading={submitting} onClick={handleSubmitFeedback}>
              Submit Feedback
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default InterviewManager;

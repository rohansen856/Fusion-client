import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Button,
  Switch,
  TextInput,
  Textarea,
  Badge,
  Loader,
  Center,
  Stack,
  Divider,
  Modal,
  Grid,
  Tabs,
  TagsInput,
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import {
  Chats,
  CalendarPlus,
  ToggleLeft,
  Clock,
  User,
} from "@phosphor-icons/react";
import api from "../api";
import { mentorshipRoute } from "../../../routes/placementCellRoutes";

const SESSION_STATUS_COLORS = {
  SCHEDULED: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
  REQUESTED: "yellow",
  IN_PROGRESS: "violet",
};

function MentorshipPanel() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [available, setAvailable] = useState(false);
  const [topics, setTopics] = useState([]);
  const [toggling, setToggling] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [requestForm, setRequestForm] = useState({
    topic: "",
    message: "",
    preferred_date: null,
    preferred_time: "",
  });

  useEffect(() => {
    fetchMentorshipData();
  }, []);

  async function fetchMentorshipData() {
    try {
      setLoading(true);
      const response = await api.get(mentorshipRoute);
      const data = response.data;

      setSessions(data.sessions || data.results || []);
      setAvailable(data.is_available ?? false);
      setTopics(data.topics || []);
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to load mentorship data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAvailability(checked) {
    try {
      setToggling(true);
      setAvailable(checked);
      await api.put(mentorshipRoute, { is_available: checked });
      showNotification({
        title: "Updated",
        message: checked
          ? "You are now available for mentorship"
          : "Mentorship availability turned off",
        color: checked ? "green" : "gray",
      });
    } catch (error) {
      setAvailable(!checked);
      showNotification({
        title: "Error",
        message: "Failed to update availability",
        color: "red",
      });
    } finally {
      setToggling(false);
    }
  }

  async function handleSaveTopics(newTopics) {
    setTopics(newTopics);
    try {
      await api.put(mentorshipRoute, { topics: newTopics });
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to save topics",
        color: "red",
      });
    }
  }

  async function handleRequestSession(e) {
    e.preventDefault();
    if (!requestForm.topic.trim()) {
      showNotification({
        title: "Validation",
        message: "Please specify a topic",
        color: "yellow",
      });
      return;
    }

    try {
      setSubmitting(true);
      await api.post(mentorshipRoute, {
        topic: requestForm.topic,
        message: requestForm.message,
        preferred_date: requestForm.preferred_date
          ?.toISOString()
          .split("T")[0],
        preferred_time: requestForm.preferred_time || null,
      });
      showNotification({
        title: "Success",
        message: "Mentorship session requested",
        color: "green",
      });
      setShowRequestForm(false);
      setRequestForm({
        topic: "",
        message: "",
        preferred_date: null,
        preferred_time: "",
      });
      fetchMentorshipData();
    } catch (error) {
      showNotification({
        title: "Error",
        message:
          error.response?.data?.detail || "Failed to request session",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const now = new Date();
  const upcoming = sessions.filter(
    (s) =>
      s.status !== "COMPLETED" &&
      s.status !== "CANCELLED" &&
      (!s.date || new Date(s.date) >= now),
  );
  const past = sessions.filter(
    (s) =>
      s.status === "COMPLETED" ||
      s.status === "CANCELLED" ||
      (s.date && new Date(s.date) < now),
  );

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
        <Title order={2}>Mentorship Panel</Title>
        <Button
          leftSection={<CalendarPlus size={16} />}
          onClick={() => setShowRequestForm(!showRequestForm)}
        >
          {showRequestForm ? "Cancel" : "Request Session"}
        </Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
        <Group justify="space-between">
          <Group gap="md">
            <ToggleLeft size={24} />
            <div>
              <Text fw={500}>Mentor Availability</Text>
              <Text size="sm" c="dimmed">
                Toggle to let students know you're available for mentoring
              </Text>
            </div>
          </Group>
          <Switch
            checked={available}
            onChange={(e) => handleToggleAvailability(e.currentTarget.checked)}
            disabled={toggling}
            size="lg"
            label={available ? "Available" : "Unavailable"}
          />
        </Group>

        <Divider my="md" />

        <TagsInput
          label="Mentorship Topics"
          placeholder="Add a topic and press Enter"
          value={topics}
          onChange={handleSaveTopics}
          description="Topics you can mentor students on"
        />
      </Card>

      {showRequestForm && (
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
          <Title order={4} mb="md">
            Request a Mentorship Session
          </Title>
          <form onSubmit={handleRequestSession}>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Topic"
                  placeholder="e.g. Career guidance, Technical interview prep"
                  value={requestForm.topic}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      topic: e.target.value,
                    }))
                  }
                  required
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 3 }}>
                <DatePickerInput
                  label="Preferred Date"
                  placeholder="Select date"
                  value={requestForm.preferred_date}
                  onChange={(val) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      preferred_date: val,
                    }))
                  }
                  minDate={new Date()}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 3 }}>
                <TimeInput
                  label="Preferred Time"
                  value={requestForm.preferred_time}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      preferred_time: e.target.value,
                    }))
                  }
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Message (optional)"
                  placeholder="Describe what you'd like help with..."
                  minRows={3}
                  value={requestForm.message}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                />
              </Grid.Col>
            </Grid>
            <Group justify="flex-end" mt="md">
              <Button type="submit" loading={submitting}>
                Submit Request
              </Button>
            </Group>
          </form>
        </Card>
      )}

      <Tabs defaultValue="upcoming">
        <Tabs.List mb="md">
          <Tabs.Tab value="upcoming" leftSection={<Clock size={16} />}>
            Upcoming ({upcoming.length})
          </Tabs.Tab>
          <Tabs.Tab value="past" leftSection={<Chats size={16} />}>
            Past ({past.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="upcoming">
          {upcoming.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No upcoming sessions.
            </Text>
          ) : (
            <Stack gap="md">
              {upcoming.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="past">
          {past.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No past sessions.
            </Text>
          ) : (
            <Stack gap="md">
              {past.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </Stack>
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

function SessionCard({ session }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Group gap="sm">
          <User size={18} />
          <Text fw={500}>
            {session.student_name || session.mentor_name || "Session"}
          </Text>
        </Group>
        <Badge
          color={SESSION_STATUS_COLORS[session.status] || "gray"}
          variant="light"
        >
          {session.status?.replace(/_/g, " ") || "SCHEDULED"}
        </Badge>
      </Group>
      <Text size="sm" fw={500} mb="xs">
        {session.topic || "General mentorship"}
      </Text>
      {session.message && (
        <Text size="sm" c="dimmed" lineClamp={2} mb="xs">
          {session.message}
        </Text>
      )}
      <Group gap="lg">
        {session.date && (
          <Text size="xs" c="dimmed">
            Date: {new Date(session.date).toLocaleDateString()}
          </Text>
        )}
        {session.time && (
          <Text size="xs" c="dimmed">
            Time: {session.time}
          </Text>
        )}
      </Group>
    </Card>
  );
}

export default MentorshipPanel;

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Title,
  Paper,
  Table,
  Loader,
  Center,
  Text,
  Badge,
  Group,
  Stack,
  ThemeIcon,
  Button,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  CalendarBlank,
  MapPin,
  Buildings,
  Sparkle,
} from "@phosphor-icons/react";
import api from "../api";
import {
  fetchPlacementScheduleRoute,
  seedDemoPlacementSchedulesRoute,
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

const SORT_KEYS = ["date", "company", "location"];

export default function PlacementSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("asc");

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(fetchPlacementScheduleRoute);
      setSchedules(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      showNotification({
        title: "Error",
        message: extractErrorMessage(err, "Failed to load schedules"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const { data } = await api.post(seedDemoPlacementSchedulesRoute);
      showNotification({
        title: "Demo schedules added",
        message: data?.detail ?? "Demo schedules created.",
        color: "green",
      });
      await fetchSchedules();
    } catch (err) {
      showNotification({
        title: "Could not seed demo schedules",
        message: extractErrorMessage(err, "Please try again."),
        color: "red",
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleSort = (key) => {
    if (!SORT_KEYS.includes(key)) return;
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    const copy = [...schedules];
    copy.sort((a, b) => {
      const valA = (a[sortBy] ?? "").toString().toLowerCase();
      const valB = (b[sortBy] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [schedules, sortBy, sortDir]);

  const sortIndicator = (key) => {
    if (sortBy !== key) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  const formatDate = (raw) => {
    if (!raw) return "—";
    const d = new Date(raw);
    return Number.isNaN(d.getTime())
      ? raw
      : d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const isUpcoming = (raw) => {
    if (!raw) return false;
    return new Date(raw) >= new Date(new Date().toDateString());
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (sorted.length === 0) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Center>
            <Stack align="center" gap="sm">
              <ThemeIcon size={48} variant="light" color="gray" radius="xl">
                <CalendarBlank size={28} />
              </ThemeIcon>
              <Text c="dimmed" size="lg">
                No placement schedules found.
              </Text>
              <Text c="dimmed" size="sm" ta="center">
                The placement cell hasn&apos;t published any sessions yet.
                You can load a few demo entries to try out the view.
              </Text>
              <Button
                leftSection={<Sparkle size={16} />}
                variant="light"
                loading={seeding}
                onClick={handleSeedDemo}
              >
                Seed demo schedules
              </Button>
            </Stack>
          </Center>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" py="md">
      <Group justify="space-between" mb="md" wrap="wrap">
        <Title order={3}>Placement Schedule</Title>
        <Button
          leftSection={<Sparkle size={16} />}
          variant="light"
          loading={seeding}
          onClick={handleSeedDemo}
        >
          Seed demo schedules
        </Button>
      </Group>

      <Paper withBorder radius="md" p={0} style={{ overflow: "hidden" }}>
        <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("date")}
              >
                Date{sortIndicator("date")}
              </Table.Th>
              <Table.Th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("company")}
              >
                Company{sortIndicator("company")}
              </Table.Th>
              <Table.Th
                style={{ cursor: "pointer" }}
                onClick={() => handleSort("location")}
              >
                Location{sortIndicator("location")}
              </Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {sorted.map((item, idx) => (
              <Table.Tr key={item.id ?? idx}>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <CalendarBlank size={16} weight="bold" />
                    <Text size="sm">{formatDate(item.date)}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <Buildings size={16} />
                    <Text size="sm" fw={500}>
                      {item.company ?? "—"}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <MapPin size={16} />
                    <Text size="sm">{item.location ?? "—"}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={2}>
                    {item.description ?? "—"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={isUpcoming(item.date) ? "teal" : "gray"}
                    variant="light"
                  >
                    {isUpcoming(item.date) ? "Upcoming" : "Past"}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}

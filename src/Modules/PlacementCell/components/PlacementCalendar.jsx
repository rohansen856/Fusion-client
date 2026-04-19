import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Paper,
  Loader,
  Center,
  Text,
  Badge,
  Group,
  Stack,
  Card,
  ThemeIcon,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import { CalendarBlank, Clock, MapPin } from "@phosphor-icons/react";
import api from "../api";
import { placementSchedulesRoute } from "../../../routes/placementCellRoutes";

const TYPE_COLORS = {
  interview: "blue",
  test: "orange",
  workshop: "teal",
  deadline: "red",
  orientation: "violet",
  default: "gray",
};

function eventColor(type) {
  return TYPE_COLORS[(type ?? "").toLowerCase()] ?? TYPE_COLORS.default;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function PlacementCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get(placementSchedulesRoute);
        setEvents(Array.isArray(data) ? data : data.results ?? []);
      } catch (err) {
        showNotification({
          title: "Error",
          message:
            err.response?.data?.message ?? "Failed to load calendar events",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const eventDates = new Set(
    events
      .map((e) => {
        const d = new Date(e.date);
        return Number.isNaN(d.getTime()) ? null : d.toDateString();
      })
      .filter(Boolean),
  );

  const eventsForDate = events.filter((e) => {
    const d = new Date(e.date);
    return !Number.isNaN(d.getTime()) && sameDay(d, selected);
  });

  const renderDay = (date) => {
    const hasEvent = eventDates.has(date.toDateString());
    const isSelected = sameDay(date, selected);
    return (
      <div style={{ position: "relative" }}>
        <div>{date.getDate()}</div>
        {hasEvent && (
          <div
            style={{
              position: "absolute",
              bottom: 2,
              left: "50%",
              transform: "translateX(-50%)",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: isSelected ? "#fff" : "#228be6",
            }}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="md" py="md">
      <Title order={3} mb="md">
        Placement Calendar
      </Title>

      <Paper withBorder radius="md" p="md" mb="md">
        <Center>
          <DatePicker
            value={selected}
            onChange={(d) => d && setSelected(d)}
            size="md"
            renderDay={renderDay}
          />
        </Center>
      </Paper>

      <Title order={5} mb="sm">
        Events on{" "}
        {selected.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </Title>

      {eventsForDate.length === 0 ? (
        <Paper p="lg" radius="md" withBorder>
          <Center>
            <Stack align="center" gap="xs">
              <ThemeIcon size={40} variant="light" color="gray" radius="xl">
                <CalendarBlank size={22} />
              </ThemeIcon>
              <Text c="dimmed">No events on this date.</Text>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Stack gap="sm">
          {eventsForDate.map((evt, idx) => (
            <Card key={evt.id ?? idx} withBorder radius="md" padding="md">
              <Group justify="space-between" mb={4}>
                <Text fw={600} size="md">
                  {evt.title ?? evt.company ?? "Event"}
                </Text>
                <Badge color={eventColor(evt.type)} variant="light">
                  {evt.type ?? "General"}
                </Badge>
              </Group>

              {evt.company && (
                <Text size="sm" c="dimmed">
                  {evt.company}
                </Text>
              )}

              <Group gap="lg" mt="xs">
                {evt.time && (
                  <Group gap={4}>
                    <Clock size={14} />
                    <Text size="xs">{evt.time}</Text>
                  </Group>
                )}
                {evt.location && (
                  <Group gap={4}>
                    <MapPin size={14} />
                    <Text size="xs">{evt.location}</Text>
                  </Group>
                )}
              </Group>

              {evt.description && (
                <Text size="sm" mt="xs" lineClamp={3}>
                  {evt.description}
                </Text>
              )}
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}

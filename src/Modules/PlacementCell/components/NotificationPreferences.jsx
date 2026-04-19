import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Switch,
  Loader,
  Center,
  Stack,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Bell, EnvelopeSimple, DeviceMobile } from "@phosphor-icons/react";
import api from "../api";
import { notificationPreferencesRoute } from "../../../routes/placementCellRoutes";

function NotificationPreferences() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    portal: true,
    email: true,
    sms: false,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    try {
      setLoading(true);
      const response = await api.get(notificationPreferencesRoute);
      const data = response.data;
      setPrefs({
        portal: data.portal ?? data.portal_notifications ?? true,
        email: data.email ?? data.email_notifications ?? true,
        sms: data.sms ?? data.sms_notifications ?? false,
      });
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to load notification preferences",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(channel, checked) {
    const previousPrefs = { ...prefs };
    const updated = { ...prefs, [channel]: checked };
    setPrefs(updated);

    try {
      setSaving(true);
      await api.put(notificationPreferencesRoute, {
        portal: updated.portal,
        email: updated.email,
        sms: updated.sms,
      });
      showNotification({
        title: "Saved",
        message: `${channel.charAt(0).toUpperCase() + channel.slice(1)} notifications ${checked ? "enabled" : "disabled"}`,
        color: "green",
      });
    } catch (error) {
      setPrefs(previousPrefs);
      showNotification({
        title: "Error",
        message: "Failed to update preferences",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Center h={300}>
        <Loader size="lg" />
      </Center>
    );
  }

  const channels = [
    {
      key: "portal",
      label: "Portal Notifications",
      description: "Receive notifications within the placement portal",
      icon: Bell,
      color: "blue",
    },
    {
      key: "email",
      label: "Email Notifications",
      description: "Receive notifications via email",
      icon: EnvelopeSimple,
      color: "violet",
    },
    {
      key: "sms",
      label: "SMS Notifications",
      description: "Receive notifications via SMS",
      icon: DeviceMobile,
      color: "teal",
    },
  ];

  return (
    <Container fluid>
      <Title order={2} mb="lg">
        Notification Preferences
      </Title>

      <Card shadow="sm" padding="xl" radius="md" withBorder maw={600}>
        <Stack gap={0}>
          {channels.map((channel, index) => (
            <React.Fragment key={channel.key}>
              {index > 0 && <Divider my="md" />}
              <Group justify="space-between" py="xs">
                <Group gap="md">
                  <ThemeIcon
                    variant="light"
                    color={channel.color}
                    size="lg"
                    radius="md"
                  >
                    <channel.icon size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>{channel.label}</Text>
                    <Text size="xs" c="dimmed">
                      {channel.description}
                    </Text>
                  </div>
                </Group>
                <Switch
                  checked={prefs[channel.key]}
                  onChange={(e) =>
                    handleToggle(channel.key, e.currentTarget.checked)
                  }
                  disabled={saving}
                  size="md"
                />
              </Group>
            </React.Fragment>
          ))}
        </Stack>
      </Card>
    </Container>
  );
}

export default NotificationPreferences;

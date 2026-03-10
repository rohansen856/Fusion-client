import React, { useState, useEffect } from "react";
import { Paper, Button, ScrollArea, Box, Group } from "@mantine/core";
import axios from "axios";
import {
  notificationReadRoute,
  notificationDeleteRoute,
  getNotificationsRoute,
} from "../../../../routes/dashboardRoutes";

function SideNotifications() {
  const [activeTab, setActiveTab] = useState("notifications");
  const [notificationsList, setNotificationsList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return console.error("No authentication token found!");

      try {
        setLoading(true);
        const { data } = await axios.get(getNotificationsRoute, {
          headers: { Authorization: `Token ${token}` },
        });
        const { notifications } = data;
        const notificationsData = notifications.map((item) => ({
          ...item,
          data: JSON.parse(item.data.replace(/'/g, '"')),
        }));

        setNotificationsList(
          notificationsData.filter(
            (item) => item.data?.flag !== "announcement",
          ),
        );
        setAnnouncementsList(
          notificationsData.filter(
            (item) => item.data?.flag === "announcement",
          ),
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notifId) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        notificationReadRoute,
        { id: notifId },
        { headers: { Authorization: `Token ${token}` } },
      );
      if (response.status === 200) {
        setNotificationsList((prev) =>
          prev.map((notif) =>
            notif.id === notifId ? { ...notif, unread: false } : notif,
          ),
        );
        setAnnouncementsList((prev) =>
          prev.map((notif) =>
            notif.id === notifId ? { ...notif, unread: false } : notif,
          ),
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const deleteNotification = async (notifId) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        notificationDeleteRoute,
        { id: notifId },
        { headers: { Authorization: `Token ${token}` } },
      );
      if (response.status === 200) {
        setNotificationsList((prev) =>
          prev.filter((notif) => notif.id !== notifId),
        );
        setAnnouncementsList((prev) =>
          prev.filter((notif) => notif.id !== notifId),
        );
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const renderItems = (items) =>
    items
      .filter((item) => !item.deleted)
      .map((item) => (
        <Paper key={item.id} withBorder p="xs" mb="xs" radius="sm">
          <Box>
            <Group position="apart">
              <Box>
                <strong>{item.verb}</strong>
                {item.data?.module && <span> - {item.data.module}</span>}
              </Box>
              <Button
                variant="subtle"
                size="xs"
                onClick={() => deleteNotification(item.id)}
              >
                ×
              </Button>
            </Group>
            <Box mt="xs">{item.description || "No description available."}</Box>
            <Group position="apart" mt="xs">
              <small>{new Date(item.timestamp).toLocaleDateString()}</small>
              {item.unread && (
                <Button
                  variant="light"
                  size="xs"
                  onClick={() => markAsRead(item.id)}
                >
                  Mark as read
                </Button>
              )}
            </Group>
          </Box>
        </Paper>
      ));

  return (
    <Paper
      shadow="md"
      radius="md"
      sx={(theme) => ({
        position: "fixed",
        right: "32px",
        top: "32px",
        width: "1000px",
        height: "600px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
      })}
    >
      <Box
        px="md"
        py="xs"
        sx={(theme) => ({
          backgroundColor: theme.colors.gray[1],
          borderBottom: `1px solid ${theme.colors.gray[3]}`,
        })}
      >
        <Group
          position="center"
          grow
          sx={{ width: "100%" }}
          px="md"
          py="xs"
          style={{ gap: "10px" }}
        >
          <Button
            variant={activeTab === "notifications" ? "filled" : "subtle"}
            onClick={() => setActiveTab("notifications")}
            size="md"
            style={{ flex: 1 }}
          >
            Notifications
          </Button>
          <Button
            variant={activeTab === "announcements" ? "filled" : "subtle"}
            onClick={() => setActiveTab("announcements")}
            size="md"
            style={{ flex: 1 }}
          >
            Announcements
          </Button>
        </Group>
      </Box>

      <ScrollArea
        style={{ flex: 1, height: "calc(600px - 56px)" }}
        offsetScrollbars
      >
        <Box p="md">
          {loading ? (
            <Box ta="center" py="xl">
              Loading...
            </Box>
          ) : (
            renderItems(
              activeTab === "notifications"
                ? notificationsList
                : announcementsList,
            )
          )}
        </Box>
      </ScrollArea>
    </Paper>
  );
}

export default SideNotifications;

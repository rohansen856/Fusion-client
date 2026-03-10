import React, { useState, useEffect } from "react";
import {
  Text,
  Badge,
  Stack,
  ScrollArea,
  Loader,
  Container,
  Button,
  Modal,
  Group,
  Card,
  Box,
  ActionIcon,
} from "@mantine/core";
import { X } from "tabler-icons-react";
import axios from "axios";
import CreateNotice from "../../components/warden/CreateNotice";
import {
  getNotices,
  deleteNotice,
} from "../../../../routes/hostelManagementRoutes";
import { Empty } from "../../../../components/empty";

const getScopeType = (scope) => (scope === "1" ? "global" : "hall");

export default function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateNoticeOpen, setIsCreateNoticeOpen] = useState(false);

  const fetchNotices = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(getNotices, {
        headers: { Authorization: `Token ${token}` },
      });
      console.log(response);

      const transformedNotices = response.data
        .map((notice) => ({
          ...notice,
          hall: notice.hall_id,
          scope: getScopeType(notice.scope),
          posted_date: new Date().toLocaleDateString(),
        }))
        .sort((a, b) => b.id - a.id); // Sort notices by ID in descending order

      setNotices(transformedNotices);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch notices. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDeleteNotice = async (noticeId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    try {
      const response = await axios.post(
        deleteNotice,
        { id: noticeId },
        {
          headers: { Authorization: `Token ${token}` },
        },
      );

      if (response.status === 200) {
        setNotices((prev) => prev.filter((notice) => notice.id !== noticeId));
        console.log("Notice deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting notice:", err);
      setError("Failed to delete notice. Please try again.");
    }
  };

  const handleCreateNoticeSubmit = (announcement) => {
    console.log("New announcement:", announcement);
    setIsCreateNoticeOpen(false);
  };

  return (
    <Container size="md" px="md">
      <Card shadow="sm" p={0} radius="md" withBorder>
        <Box
          py="md"
          px="lg"
          sx={(theme) => ({
            backgroundColor: theme.colors.gray[0],
            borderBottom: `1px solid ${theme.colors.gray[3]}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          })}
        >
          <Button
            size="sm"
            color="blue"
            onClick={() => setIsCreateNoticeOpen(true)}
          >
            Create Notice
          </Button>
        </Box>

        <Box p="md" sx={{ height: "70vh" }}>
          <ScrollArea style={{ height: "100%" }}>
            {loading ? (
              <Container
                py="xl"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <Loader size="lg" />
              </Container>
            ) : error ? (
              <Text align="center" color="red" size="lg">
                {error}
              </Text>
            ) : notices.length === 0 ? (
              <Empty />
            ) : (
              <Stack spacing="md">
                {notices.map((notice) => (
                  <Card
                    key={notice.id}
                    p="md"
                    withBorder
                    radius="sm"
                    sx={(theme) => ({
                      backgroundColor:
                        notice.scope === "global"
                          ? theme.fn.rgba(theme.colors.yellow[1], 0.5)
                          : theme.white,
                      borderColor:
                        notice.scope === "global"
                          ? theme.colors.yellow[4]
                          : theme.colors.gray[3],
                      position: "relative",
                    })}
                  >
                    <Group position="apart" mb="xs" align="flex-start">
                      <Text
                        size="lg"
                        weight={600}
                        color={notice.scope === "global" ? "dark" : "dimmed"}
                        style={{ flex: 1 }}
                      >
                        {notice.head_line}
                      </Text>
                      <ActionIcon
                        color="gray"
                        variant="subtle"
                        onClick={() => handleDeleteNotice(notice.id)}
                      >
                        <X size={16} />
                      </ActionIcon>
                    </Group>

                    <Text size="md" mb="xs">
                      {notice.content}
                    </Text>

                    <Text size="sm" color="dimmed" mb="sm">
                      {notice.description}
                    </Text>

                    <Group position="apart" mt="md">
                      <Badge
                        size="md"
                        variant={
                          notice.scope === "global" ? "filled" : "outline"
                        }
                        color={notice.scope === "global" ? "yellow" : "blue"}
                      >
                        {notice.hall}
                      </Badge>

                      <Text size="sm" color="dimmed">
                        Posted by: {notice.posted_by}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Box>
      </Card>

      <Modal
        opened={isCreateNoticeOpen}
        onClose={() => setIsCreateNoticeOpen(false)}
        title="Create New Notice"
        size="lg"
      >
        <CreateNotice onSubmit={handleCreateNoticeSubmit} />
      </Modal>
    </Container>
  );
}

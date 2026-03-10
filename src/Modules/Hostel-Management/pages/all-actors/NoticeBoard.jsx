import {
  Text,
  Badge,
  Stack,
  ScrollArea,
  Loader,
  Container,
  Box,
  Card,
  Group,
} from "@mantine/core";
import { useEffect, useState } from "react";
import axios from "axios";
import { getNotices } from "../../../../routes/hostelManagementRoutes";
import { Empty } from "../../../../components/empty";

// Helper function to transform scope number to string
const getScopeType = (scope) => {
  return scope === "1" ? "global" : "hall";
};

export default function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // Transform and sort the notices by id in descending order
      const transformedNotices = response.data
        .map((notice) => ({
          ...notice,
          hall: notice.hall_id,
          scope: getScopeType(notice.scope),
          posted_date: new Date().toLocaleDateString(),
        }))
        .sort((a, b) => b.id - a.id); // Sorting by id in descending order

      setNotices(transformedNotices);
      setError(null);
    } catch (err) {
      console.error("Error fetching notices:", err);
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

  return (
    <Container size="md" px="md">
      <Card shadow="sm" p={0} radius="md" withBorder>
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
                    })}
                  >
                    <Text
                      size="lg"
                      weight={600}
                      mb="xs"
                      color={notice.scope === "global" ? "dark" : "dimmed"}
                    >
                      {notice.head_line}
                    </Text>

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
    </Container>
  );
}

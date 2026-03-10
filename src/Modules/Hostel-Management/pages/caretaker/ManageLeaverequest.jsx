import React, { useState, useEffect } from "react";
import {
  Text,
  Group,
  Avatar,
  Button,
  Stack,
  Flex,
  ScrollArea,
  Badge,
  Box,
  Container,
  Loader,
  Card,
  Tabs,
} from "@mantine/core";
import { CalendarBlank } from "@phosphor-icons/react";
import axios from "axios";
import {
  show_leave_request,
  update_leave_status,
} from "../../../../routes/hostelManagementRoutes";

export default function ManageLeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  const fetchLeaveRequests = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(show_leave_request, {
        headers: { Authorization: `Token ${token}` },
      });
      setLeaveRequests(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to fetch leave requests. Please try again later.",
      );
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleStatusUpdate = async (id, status, remark = "") => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    try {
      const response = await axios.post(
        update_leave_status,
        {
          leave_id: id,
          status,
          remark,
        },
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      if (response.data.status === "success") {
        setLeaveRequests(
          leaveRequests.map((request) =>
            request.id === id ? { ...request, status, remark } : request,
          ),
        );
        if (status === "approved" || status === "rejected") {
          setActiveTab("past");
        }
      }
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Failed to update leave status. Please try again later.",
      );
    }
  };

  const activeRequests = leaveRequests.filter(
    (request) => request.status === "pending",
  );

  const pastRequests = leaveRequests.filter(
    (request) => request.status === "approved" || request.status === "rejected",
  );

  const renderLeaveRequests = (requests) => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <Loader size="lg" />
        </Box>
      );
    }

    if (error) {
      return (
        <Text align="center" color="red" size="lg" py="xl">
          {error}
        </Text>
      );
    }

    if (requests.length === 0) {
      return (
        <Text align="center" color="dimmed" py="xl">
          No leave requests found in this category.
        </Text>
      );
    }

    return (
      <Stack spacing="md">
        {requests.map((request) => (
          <Card key={request.id} p="md" withBorder radius="sm" shadow="xs">
            <Flex
              gap="md"
              align="flex-start"
              justify="space-between"
              wrap="wrap"
            >
              <Group spacing="md" noWrap style={{ flex: "0 0 220px" }}>
                <Avatar
                  color="blue"
                  radius="xl"
                  size="md"
                  sx={(theme) => ({
                    backgroundColor: theme.fn.rgba(theme.colors.blue[5], 0.2),
                    color: theme.colors.blue[7],
                  })}
                >
                  {request.student_name[0]}
                </Avatar>
                <Box>
                  <Text weight={600} size="sm" lineClamp={1}>
                    {request.student_name}
                  </Text>
                  <Badge size="sm" variant="outline" color="blue" mt={4}>
                    {request.roll_num}
                  </Badge>
                </Box>
              </Group>

              <Box sx={{ flex: 1, minWidth: "200px" }}>
                <Text size="sm" lineClamp={2}>
                  {request.reason}
                </Text>
              </Box>

              <Box sx={{ width: "180px" }}>
                <Group spacing="xs" mb={6}>
                  <CalendarBlank size={14} weight="bold" color="#5C7CFA" />
                  <Text size="xs" color="dimmed">
                    From:{" "}
                    <Text component="span" weight={500} color="dark" size="xs">
                      {request.start_date}
                    </Text>
                  </Text>
                </Group>
                <Group spacing="xs" mb={8}>
                  <CalendarBlank size={14} weight="bold" color="#5C7CFA" />
                  <Text size="xs" color="dimmed">
                    To:{" "}
                    <Text component="span" weight={500} color="dark" size="xs">
                      {request.end_date}
                    </Text>
                  </Text>
                </Group>

                {request.status === "pending" ? (
                  <Group spacing="xs">
                    <Button
                      color="green"
                      size="xs"
                      variant="light"
                      onClick={() => handleStatusUpdate(request.id, "approved")}
                    >
                      Accept
                    </Button>
                    <Button
                      color="red"
                      size="xs"
                      variant="light"
                      onClick={() => handleStatusUpdate(request.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </Group>
                ) : (
                  <Badge
                    color={request.status === "approved" ? "green" : "red"}
                    variant="filled"
                  >
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </Badge>
                )}
              </Box>
            </Flex>
          </Card>
        ))}
      </Stack>
    );
  };

  return (
    <Container size="md" px="md">
      <Card shadow="sm" radius="md" withBorder>
        <Box p="lg" sx={{ height: "70vh" }}>
          <Tabs value={activeTab} onChange={setActiveTab} radius="md" mb="md">
            <Tabs.List grow>
              <Tabs.Tab
                value="active"
                rightSection={
                  <Badge
                    size="sm"
                    variant="filled"
                    radius="xl"
                    sx={(theme) => ({
                      backgroundColor:
                        activeTab === "active"
                          ? theme.white
                          : theme.colors.blue[5],
                      color:
                        activeTab === "active"
                          ? theme.colors.blue[7]
                          : theme.white,
                    })}
                  >
                    {activeRequests.length}
                  </Badge>
                }
              >
                Pending Requests
              </Tabs.Tab>
              <Tabs.Tab
                value="past"
                rightSection={
                  <Badge
                    size="sm"
                    variant="filled"
                    radius="xl"
                    sx={(theme) => ({
                      backgroundColor:
                        activeTab === "past"
                          ? theme.white
                          : theme.colors.blue[5],
                      color:
                        activeTab === "past"
                          ? theme.colors.blue[7]
                          : theme.white,
                    })}
                  >
                    {pastRequests.length}
                  </Badge>
                }
              >
                Past Requests
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="active" pt="xs">
              <ScrollArea style={{ height: "calc(70vh - 120px)" }}>
                <Box p="xs">{renderLeaveRequests(activeRequests)}</Box>
              </ScrollArea>
            </Tabs.Panel>

            <Tabs.Panel value="past" pt="xs">
              <ScrollArea style={{ height: "calc(70vh - 120px)" }}>
                <Box p="xs">{renderLeaveRequests(pastRequests)}</Box>
              </ScrollArea>
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Card>
    </Container>
  );
}

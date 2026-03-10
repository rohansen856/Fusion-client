import React, { useState, useEffect } from "react";
import {
  Paper,
  Group,
  Text,
  Stack,
  Select,
  ScrollArea,
  Loader,
  Container,
  Card,
  Box,
  Tabs,
  Badge,
} from "@mantine/core";
import axios from "axios";
import LeaveApplicationCard from "../../components/students/LeaveApplicationCard";
import { my_leaves } from "../../../../routes/hostelManagementRoutes";

export default function LeaveStatus() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  const fetchLeaves = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(my_leaves, {
        headers: { Authorization: `Token ${token}` },
      });

      setLeaves(response.data.leaves);
      setError(null);
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch leaves. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const activeLeaves = leaves.filter(
    (leave) => leave.status.toLowerCase() === "pending",
  );
  const pastLeaves = leaves.filter(
    (leave) => leave.status.toLowerCase() !== "pending",
  );

  const renderLeavesList = (leavesList) => {
    if (leavesList.length === 0) {
      return (
        <Text align="center" color="dimmed" py="xl">
          No leave requests found in this category.
        </Text>
      );
    }

    return (
      <Stack spacing="lg">
        {leavesList.map((leave) => (
          <Paper withBorder radius="md" p={0} shadow="xs" mb="md">
            <LeaveApplicationCard
              key={leave.roll_num + leave.start_date}
              student_name={leave.student_name}
              roll_num={leave.roll_num}
              reason={leave.reason}
              phone_number={leave.phone_number}
              start_date={leave.start_date}
              end_date={leave.end_date}
              status={leave.status}
              remark={leave.remark}
            />
          </Paper>
        ))}
      </Stack>
    );
  };

  return (
    <Container size="md" px="md">
      <Card shadow="sm" radius="md" withBorder>
        <Box p="lg" sx={{ height: "70vh" }}>
          <Group position="apart" mb="md">
            <Group spacing="xs">
              <Text size="sm" color="dimmed">
                Sort By:
              </Text>
              <Select
                placeholder="Date"
                data={[{ value: "date", label: "Date" }]}
                style={{ width: "100px" }}
                variant="filled"
                size="sm"
              />
            </Group>
          </Group>

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
                    {activeLeaves.length}
                  </Badge>
                }
              >
                Active Requests
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
                    {pastLeaves.length}
                  </Badge>
                }
              >
                Past Requests
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {loading ? (
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
          ) : error ? (
            <Text align="center" color="red" size="lg" py="xl">
              {error}
            </Text>
          ) : (
            <ScrollArea style={{ height: "calc(70vh - 140px)" }}>
              <Box p="xs">
                {activeTab === "active"
                  ? renderLeavesList(activeLeaves)
                  : renderLeavesList(pastLeaves)}
              </Box>
            </ScrollArea>
          )}
        </Box>
      </Card>
    </Container>
  );
}

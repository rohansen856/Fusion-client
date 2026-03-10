import React, { useState, useEffect } from "react";
import {
  Text,
  Group,
  Button,
  Stack,
  ScrollArea,
  Badge,
  Container,
  Loader,
  Card,
  Box,
  Divider,
} from "@mantine/core";
import axios from "axios";
import {
  fetch_fines_url,
  update_fine_status_url,
} from "../../../../routes/hostelManagementRoutes";

export default function ManageFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFines = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(fetch_fines_url, {
        headers: { Authorization: `Token ${token}` },
      });
      setFines(Array.isArray(response.data?.fines) ? response.data.fines : []);
      console.log(fines);
      setError(null);
    } catch (err) {
      console.error("Error fetching fines:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch fines. Please try again later.",
      );
      setFines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    if (!id) {
      console.error("Invalid fine ID:", id);
      setError("Invalid fine ID. Unable to update fine status.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    try {
      const response = await axios.post(
        update_fine_status_url(id),
        { status },
        { headers: { Authorization: `Token ${token}` } },
      );

      if (response.status === 200) {
        setFines((prevFines) =>
          prevFines.map((fine) =>
            fine.fine_id === id ? { ...fine, status } : fine,
          ),
        );
        setError(null);
      }
    } catch (err) {
      console.error("Error updating fine status:", err);
      setError(
        err.response?.data?.error ||
          "Failed to update fine status. Please try again later.",
      );
    }
  };

  const handleMarkPaid = (id) => handleStatusUpdate(id, "Paid");
  const handleMarkPending = (id) => handleStatusUpdate(id, "Pending");

  return (
    <Container size="md" px="md">
      <Card shadow="sm" p={0} radius="md" withBorder>
        <Box p="lg" sx={{ height: "70vh" }}>
          <ScrollArea style={{ height: "100%" }}>
            {loading ? (
              <Group position="center" style={{ height: "100%" }}>
                <Loader size="lg" />
              </Group>
            ) : error ? (
              <Text align="center" color="red" mt="xl">
                {error}
              </Text>
            ) : fines.length === 0 ? (
              <Text align="center" color="dimmed" mt="xl">
                No fines available.
              </Text>
            ) : (
              <Stack spacing="md">
                {fines.map((fine) => (
                  <Card
                    key={fine.fine_id}
                    p="md"
                    withBorder
                    radius="sm"
                    sx={(theme) => ({
                      borderColor: theme.colors.gray[3],
                    })}
                  >
                    <Group position="apart" mb="sm">
                      <Group>
                        <Text weight={500}>{fine.student_id}</Text>
                        <Badge
                          size="sm"
                          variant="light"
                          color={fine.status === "Paid" ? "green" : "orange"}
                        >
                          {fine.status}
                        </Badge>
                      </Group>
                      <Text
                        weight={600}
                        color={fine.status === "Pending" ? "red" : "dark"}
                      >
                        ₹{fine.amount}
                      </Text>
                    </Group>

                    <Text size="sm" color="dimmed" mb="md">
                      {fine.reason || "No reason specified"}
                    </Text>

                    <Divider my="sm" />

                    <Group position="right" mt="sm">
                      {fine.status === "Pending" ? (
                        <Button
                          color="green"
                          variant="light"
                          size="sm"
                          onClick={() => handleMarkPaid(fine.fine_id)}
                        >
                          Mark as Paid
                        </Button>
                      ) : (
                        <Button
                          color="orange"
                          variant="light"
                          size="sm"
                          onClick={() => handleMarkPending(fine.fine_id)}
                        >
                          Mark as Pending
                        </Button>
                      )}
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

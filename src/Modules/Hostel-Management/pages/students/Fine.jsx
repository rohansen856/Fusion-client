import React, { useState, useEffect } from "react";
import {
  Text,
  Stack,
  ScrollArea,
  Loader,
  Group,
  Alert,
  Container,
  Card,
  Box,
  Divider,
} from "@mantine/core";
import axios from "axios";
import FineCard from "../../components/students/FineCard";
import { fine_show } from "../../../../routes/hostelManagementRoutes"; // Adjust this import path if necessary

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken"); // Get the auth token from local storage

  const fetchFines = async () => {
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch fines from the backend
      const response = await axios.get(fine_show, {
        headers: { Authorization: `Token ${token}` },
      });

      if (response.data.student_fines) {
        setFines(response.data.student_fines);
      }
      // ✅ Handle case when no fines are imposed
      else if (response.data.message === "There is no fine imposed on you.") {
        setFines([]); // No fines to display
      } else {
        setError("Unexpected response from the server.");
      }
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to fetch fines. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines(); // Fetch fines on component mount
  }, []);

  if (loading) {
    return (
      <Container size="md" px="md" style={{ height: "100%" }}>
        <Card
          shadow="sm"
          p="xl"
          radius="md"
          withBorder
          style={{ height: "100%" }}
        >
          <Group position="center" style={{ height: "100%" }}>
            <Loader size="md" />
          </Group>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md" px="md">
        <Alert title="Error" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  const activeFines = fines.filter((fine) => fine.status === "Pending");
  const pastFines = fines.filter((fine) => fine.status === "Paid");

  return (
    <Container size="md" px="md">
      <Card shadow="sm" p={0} radius="md" withBorder>
        <Box p="lg" sx={{ height: "70vh" }}>
          <ScrollArea style={{ height: "100%" }}>
            <Stack spacing="xl">
              {/* Active Fines */}
              <div>
                <Text weight={500} size="lg" mb="md">
                  Active Fines
                </Text>
                <Stack spacing="md">
                  {activeFines.length > 0 ? (
                    activeFines.map((fine) => (
                      <FineCard
                        key={fine.fine_id}
                        fine_id={fine.fine_id}
                        student_name={fine.student_name}
                        hall={fine.hall}
                        amount={fine.amount}
                        status={fine.status}
                        reason={fine.reason}
                        isPastFine={false}
                      />
                    ))
                  ) : (
                    <Text color="dimmed" align="center" py="md">
                      No active fines
                    </Text>
                  )}
                </Stack>
              </div>

              <Divider my="md" />

              {/* Past Fines */}
              <div>
                <Text weight={500} size="lg" mb="md">
                  Past Fines History
                </Text>
                <Stack spacing="md">
                  {pastFines.length > 0 ? (
                    pastFines.map((fine) => (
                      <FineCard
                        key={fine.fine_id}
                        fine_id={fine.fine_id}
                        student_name={fine.student_name}
                        hall={fine.hall}
                        amount={fine.amount}
                        status={fine.status}
                        reason={fine.reason}
                        isPastFine
                      />
                    ))
                  ) : (
                    <Text color="dimmed" align="center" py="md">
                      No past fines found.
                    </Text>
                  )}
                </Stack>
              </div>
            </Stack>
          </ScrollArea>
        </Box>
      </Card>
    </Container>
  );
}

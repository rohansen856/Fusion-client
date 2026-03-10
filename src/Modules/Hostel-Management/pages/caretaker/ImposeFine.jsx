import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Text,
  Input,
  Group,
  Card,
  ScrollArea,
  Modal,
  Container,
  Stack,
  Button,
  Textarea,
  Loader,
  Box,
} from "@mantine/core";
import { MagnifyingGlass } from "@phosphor-icons/react";
import {
  getStudentsInfo2,
  imposeFineRoute,
} from "../../../../routes/hostelManagementRoutes"; // Adjust the path as needed

export default function ImposeFine() {
  const [opened, setOpened] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fineAmount, setFineAmount] = useState("");
  const [fineReason, setFineReason] = useState("");

  // Fetch students data
  const fetchStudents = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(getStudentsInfo2, {
        headers: { Authorization: `Token ${token}` },
      });
      setStudents(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch student information. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      (student.id__user__username &&
        student.id__user__username
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (student.room_no &&
        student.room_no.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleImposeFine = async () => {
    if (!fineAmount || !fineReason || !selectedStudent) {
      alert("Please fill in all fields before imposing a fine.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    try {
      // Make the API call to impose the fine
      const response = await axios.post(
        imposeFineRoute, // Use the predefined route
        {
          studentId: selectedStudent.id__user__username, // Use selected student's ID
          fineAmount,
          fineReason,
        },
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      alert("Fine imposed successfully!");
      console.log(response);
      setOpened(false);
      setFineAmount(""); // Reset fine amount input
      setFineReason(""); // Reset fine reason input
    } catch (err) {
      console.error("Error imposing fine:", err);
      alert(
        err.response?.data?.message ||
          "Failed to impose fine. Please try again later.",
      );
    }
  };

  return (
    <Container size="md" px="md">
      <Card shadow="sm" p={0} radius="md" withBorder>
        <Box p="lg">
          <Input
            placeholder="Search by student ID or room number"
            icon={<MagnifyingGlass size={16} />}
            mb="lg"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
          />

          <ScrollArea style={{ height: "60vh" }}>
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
            ) : (
              <Stack spacing="sm">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <Card
                      key={index}
                      padding="sm"
                      withBorder
                      radius="sm"
                      onClick={() => {
                        setSelectedStudent(student);
                        setOpened(true);
                      }}
                      sx={(theme) => ({
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: theme.colors.gray[0],
                        },
                      })}
                    >
                      <Group position="apart">
                        <Box style={{ width: "66%" }}>
                          <Text weight={500}>{student.id__user__username}</Text>
                        </Box>
                        <Group spacing="md">
                          <Text color="dimmed" size="sm">
                            {student.programme}
                          </Text>
                          <Text
                            size="sm"
                            sx={(theme) => ({
                              backgroundColor: theme.colors.gray[1],
                              padding: "3px 10px",
                              borderRadius: theme.radius.sm,
                            })}
                          >
                            Room {student.room_no}
                          </Text>
                        </Group>
                      </Group>
                    </Card>
                  ))
                ) : (
                  <Text align="center" color="dimmed" mt="xl">
                    No students found matching your search criteria.
                  </Text>
                )}
              </Stack>
            )}
          </ScrollArea>
        </Box>
      </Card>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Impose Fine"
        size="md"
      >
        {selectedStudent && (
          <Stack spacing="md">
            <Card p="md" radius="sm" withBorder>
              <Group position="apart">
                <Text size="sm" color="dimmed">
                  Student ID
                </Text>
                <Text weight={500}>{selectedStudent.id__user__username}</Text>
              </Group>
              <Group position="apart" mt="xs">
                <Text size="sm" color="dimmed">
                  Room
                </Text>
                <Text>{selectedStudent.room_no}</Text>
              </Group>
            </Card>

            <Input
              placeholder="Enter amount"
              value={fineAmount}
              onChange={(e) => setFineAmount(e.currentTarget.value)}
              label="Fine Amount"
            />

            <Textarea
              placeholder="Enter reason for imposing fine"
              value={fineReason}
              onChange={(e) => setFineReason(e.currentTarget.value)}
              label="Reason"
              minRows={3}
            />

            <Group position="right" mt="md">
              <Button variant="default" onClick={() => setOpened(false)}>
                Cancel
              </Button>
              <Button onClick={handleImposeFine}>Impose Fine</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Paper,
  Text,
  Input,
  Group,
  Card,
  ScrollArea,
  Modal,
  Container,
  Stack,
  SimpleGrid,
  Loader,
} from "@mantine/core";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { getStudentsInfo } from "../../../../routes/hostelManagementRoutes"; // Adjust this import path as needed

export default function StudentInfo() {
  const [opened, setOpened] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedBlock = "All";
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(getStudentsInfo, {
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

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setOpened(true);
  };

  const filteredStudents = students.filter(
    (student) =>
      (student.id__user__username &&
        student.id__user__username
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (student.room_no &&
        student.room_no.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <Paper
      shadow="md"
      p="md"
      withBorder
      sx={(theme) => ({
        position: "fixed",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.white,
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
      })}
    >
      <Text
        align="left"
        mb="xl"
        size="24px"
        style={{ color: "#4299E1", fontWeight: "bold" }}
      >
        Hostel Residents
      </Text>

      <Group mb="md">
        <Input
          placeholder="Search"
          icon={<MagnifyingGlass size={16} />}
          style={{ flex: 1 }}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
        />
      </Group>

      <ScrollArea style={{ flex: 1, height: "calc(62vh)" }}>
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
            {filteredStudents.map((student, index) => (
              <Card
                key={index}
                padding="sm"
                withBorder
                onClick={() => handleOpenModal(student)}
                sx={(theme) => ({
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: theme.colors.gray[0],
                  },
                })}
              >
                <Group align="center" spacing="xs">
                  <Text style={{ flex: 1 }}>{student.id__user__username}</Text>
                  <Text style={{ flex: 1 }}>{student.programme}</Text>
                  <Text
                    size="sm"
                    style={{
                      textAlign: "right",
                      backgroundColor: "#f1f3f5",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    Room {student.room_no}
                  </Text>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </ScrollArea>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        size="md"
        styles={(theme) => ({
          body: {
            backgroundColor: theme.colors.gray[0],
          },
        })}
      >
        {selectedStudent && (
          <Container>
            <Stack spacing="md">
              <Paper p="md" radius="md" withBorder>
                <Group position="apart">
                  <Text size="lg" weight={500} color="blue">
                    Name:
                  </Text>
                  <Text size="lg">{selectedStudent.id__user__username}</Text>
                </Group>
              </Paper>
              <SimpleGrid cols={2} spacing="md">
                <Paper p="md" radius="md" withBorder>
                  <Text weight={500} color="dimmed">
                    Programme:
                  </Text>
                  <Text size="lg">{selectedStudent.programme}</Text>
                </Paper>
                <Paper p="md" radius="md" withBorder>
                  <Text weight={500} color="dimmed">
                    Room:
                  </Text>
                  <Text size="lg">{selectedStudent.room_no}</Text>
                </Paper>
                <Paper p="md" radius="md" withBorder>
                  <Text weight={500} color="dimmed">
                    Batch:
                  </Text>
                  <Text size="lg">{selectedStudent.batch}</Text>
                </Paper>
                <Paper p="md" radius="md" withBorder>
                  <Text weight={500} color="dimmed">
                    CPI:
                  </Text>
                  <Text size="lg">{selectedStudent.cpi}</Text>
                </Paper>
                <Paper p="md" radius="md" withBorder>
                  <Text weight={500} color="dimmed">
                    Category:
                  </Text>
                  <Text size="lg">{selectedStudent.category}</Text>
                </Paper>
                <Paper p="md" radius="md" withBorder>
                  <Text weight={500} color="dimmed">
                    Hall:
                  </Text>
                  <Text size="lg">{selectedStudent.hall_id}</Text>
                </Paper>
                <Paper p="md" radius="md" withBorder>
                  <Text weight={500} color="dimmed">
                    Specialization:
                  </Text>
                  <Text size="lg">{selectedStudent.specialization}</Text>
                </Paper>
                <Paper p="md" radius="md" withBorder>
                  <Text weight={500} color="dimmed">
                    Current Semester:
                  </Text>
                  <Text size="lg">{selectedStudent.curr_semester_no}</Text>
                </Paper>
              </SimpleGrid>
            </Stack>
          </Container>
        )}
      </Modal>
    </Paper>
  );
}

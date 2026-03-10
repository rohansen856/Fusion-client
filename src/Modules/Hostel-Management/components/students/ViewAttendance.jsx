import {
  Paper,
  Title,
  Container,
  Stack,
  Select,
  Loader,
  Button,
  Image,
  Group,
  Text,
  Box,
  Divider,
  Badge,
} from "@mantine/core";
import {
  IconDownload,
  IconCalendar,
  IconSearch,
  IconFileReport,
} from "@tabler/icons-react";
import axios from "axios";
import { useState } from "react";
import { view_attendance } from "../../../../routes/hostelManagementRoutes";

export default function ViewAttendanceComponent() {
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attendanceFile, setAttendanceFile] = useState(null);
  const [error, setError] = useState(null);

  const years = Array.from({ length: 20 }, (_, i) => 2025 - i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleFetchAttendance = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please login again");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${view_attendance}?year=${year}&month=${month}`,
        {
          headers: { Authorization: `Token ${token}` },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      const fileUrl = URL.createObjectURL(blob);
      setAttendanceFile({
        url: fileUrl,
        type: blob.type,
        name: `Attendance_${year}_${month}${blob.type.includes("pdf") ? ".pdf" : ".png"}`,
      });
    } catch (err) {
      let errorMessage = "Error fetching attendance";

      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = "Attendance record not found";
        }
        if (error.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            errorMessage = text || errorMessage;
          } catch (e) {
            console.error("Error reading error message:", e);
          }
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="md" px="xs">
      <Paper shadow="xs" p={30} radius="md" withBorder>
        <Stack spacing="lg">
          <Box ta="center">
            <Title order={3} style={{ color: "#4299E1" }}>
              View Attendance Records
            </Title>
          </Box>

          <Divider />

          {error && (
            <Text color="red" size="sm" fw={500} ta="center">
              {error}
            </Text>
          )}

          <Group grow spacing={20} align="flex-end">
            <Box>
              <Text fw={500} mb={8} size="sm">
                <IconCalendar size={14} style={{ marginRight: 5 }} />
                Year
              </Text>
              <Select
                placeholder="Select year"
                data={years.map((yr) => yr.toString())}
                value={year}
                onChange={setYear}
                searchable
                size="md"
              />
            </Box>

            <Box>
              <Text fw={500} mb={8} size="sm">
                <IconCalendar size={14} style={{ marginRight: 5 }} />
                Month
              </Text>
              <Select
                placeholder="Select month"
                data={months}
                value={month}
                onChange={setMonth}
                disabled={!year}
                searchable
                size="md"
              />
            </Box>
          </Group>

          <Box ta="center">
            <Button
              mt="md"
              onClick={handleFetchAttendance}
              disabled={!year || !month}
              leftIcon={<IconSearch size={18} />}
              size="md"
              sx={{
                minWidth: 200,
                backgroundColor: "#4299E1",
                "&:hover": {
                  backgroundColor: "#3182CE", // optional hover shade
                },
              }}
            >
              View Attendance
            </Button>
          </Box>

          {loading && (
            <Box ta="center" py="md">
              <Loader size="md" variant="dots" />
              <Text size="sm" color="dimmed" mt="xs">
                Fetching attendance record...
              </Text>
            </Box>
          )}

          {attendanceFile && !loading && (
            <Paper mt="lg" p="lg" shadow="xs" radius="md" withBorder>
              <Stack spacing="md">
                <Group position="apart">
                  <Group>
                    <IconFileReport size={20} />
                    <Text fw={500}>
                      Attendance Record: {month} {year}
                    </Text>
                  </Group>
                  <Badge
                    color={
                      attendanceFile.type.includes("pdf") ? "blue" : "green"
                    }
                    variant="filled"
                    size="sm"
                  >
                    {attendanceFile.type.includes("pdf") ? "PDF" : "Image"}
                  </Badge>
                </Group>

                <Divider />

                {attendanceFile.type.includes("image") ? (
                  <Box sx={{ overflow: "hidden", borderRadius: 4 }}>
                    <Image
                      src={attendanceFile.url}
                      alt="Attendance Record"
                      withPlaceholder
                      radius="md"
                    />
                  </Box>
                ) : (
                  <Box>
                    <iframe
                      src={attendanceFile.url}
                      style={{
                        width: "100%",
                        height: "500px",
                        border: "none",
                        borderRadius: 4,
                      }}
                      title="Attendance PDF Viewer"
                    />
                  </Box>
                )}

                <Button
                  component="a"
                  href={attendanceFile.url}
                  download={attendanceFile.name}
                  leftIcon={<IconDownload size={18} />}
                  variant="light"
                  fullWidth
                  styles={{
                    root: {
                      color: "#4299E1",
                      borderColor: "#4299E1",
                      "&:hover": {
                        backgroundColor: "#EBF8FF",
                      },
                    },
                  }}
                >
                  Download{" "}
                  {attendanceFile.type.includes("pdf") ? "PDF" : "Image"}
                </Button>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}

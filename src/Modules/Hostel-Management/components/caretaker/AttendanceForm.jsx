import {
  Paper,
  Button,
  Title,
  Container,
  Stack,
  Select,
  Text,
  Box,
  Divider,
} from "@mantine/core";
import { Upload } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import {
  viewHostel,
  upload_attendance,
} from "../../../../routes/hostelManagementRoutes";

export default function UploadAttendanceComponent() {
  const [file, setFile] = useState(null);
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [selectedHall, setSelectedHall] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [hostelsData, setHostelsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await fetch(viewHostel, {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setHostelsData(data.hostel_details);
        if (data.hostel_details.length > 0) {
          setSelectedHall(data.hostel_details[0].hall_id);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching hostel data:", error);
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  const selectedHallData = hostelsData.find((h) => h.hall_id === selectedHall);

  useEffect(() => {
    setSelectedBatch("");
  }, [selectedHall]);

  const years = Array.from({ length: 10 }, (_, i) => 2025 + i);
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("year", year);
    formData.append("month", month);
    formData.append("selectedHall", selectedHall);
    formData.append("selectedBatch", selectedBatch);
    formData.append("file", file);

    try {
      const response = await fetch(upload_attendance, {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      setFile(null);
      setYear(null);
      setMonth(null);
      setSelectedBatch("");

      alert("Attendance uploaded successfully!");
    } catch (error) {
      console.error("Error uploading attendance:", error);
      alert("Failed to upload attendance. Please try again.");
    }
  };

  if (loading) {
    return (
      <Text align="center" mt="xl" color="dimmed">
        Loading...
      </Text>
    );
  }

  return (
    <Container size="sm" px="xs">
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Box ta="center" mb="lg">
          <Title order={2} color="#4299E1">
            Upload Attendance
          </Title>
          <Text color="dimmed" size="sm" mt={4}>
            Fill in the details and upload the attendance sheet
          </Text>
        </Box>

        <Divider mb="lg" />

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Select
              label="Year"
              placeholder="Select year"
              data={years.map((yr) => yr.toString())}
              value={year}
              onChange={setYear}
              required
            />

            {year && (
              <Select
                label="Month"
                placeholder="Select month"
                data={months}
                value={month}
                onChange={setMonth}
                required
              />
            )}

            {month && (
              <Select
                label="Hall"
                data={hostelsData.map((hostel) => ({
                  value: hostel.hall_id,
                  label: hostel.hall_name,
                }))}
                value={selectedHall}
                onChange={setSelectedHall}
                placeholder="Select Hall"
                required
              />
            )}

            {selectedHallData?.assigned_batch?.length > 0 && (
              <Select
                label="Batch"
                placeholder="Select Batch"
                data={selectedHallData.assigned_batch.map((b) => ({
                  value: b,
                  label: b,
                }))}
                value={selectedBatch}
                onChange={setSelectedBatch}
                required
              />
            )}

            <Divider
              my="sm"
              label="Attach Attendance Document"
              labelPosition="center"
            />

            <input
              type="file"
              id="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <Button
              component="label"
              htmlFor="file"
              variant="filled"
              size="md"
              color="#4299E1"
              leftIcon={<Upload size={20} />}
              fullWidth
              styles={{
                root: {
                  backgroundColor: "#4299E1",
                  "&:hover": { backgroundColor: "#3182CE" },
                },
              }}
            >
              {file ? file.name : "Attach Document"}
            </Button>

            <Button
              type="submit"
              variant="filled"
              fullWidth
              mt="sm"
              size="md"
              styles={{
                root: {
                  backgroundColor: "#4299E1",
                  "&:hover": { backgroundColor: "#3182CE" },
                },
              }}
            >
              Submit
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

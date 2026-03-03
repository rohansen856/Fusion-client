import React, { useState, useEffect } from "react";
import {
  Card,
  Paper,
  Table,
  Text,
  Group,
  Button,
  Loader,
  Alert,
  Select,
  Stack,
  Badge,
  Center,
  Switch,
  Grid,
  Flex,
  Modal,
  ActionIcon,
} from "@mantine/core";
import { IconCheck, IconX, IconClock, IconDownload, IconEye } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  grade_status,
  get_student_grades_academic_years,
  download_grades_prof,
} from "./routes/examinationRoutes.jsx";

export default function GradeStatus() {
  const userRole = useSelector((state) => state.user.role);
  const [gradeStatusData, setGradeStatusData] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedSemesterType, setSelectedSemesterType] = useState("");
  
  // Filter toggles
  const [showSubmitted, setShowSubmitted] = useState(true);
  const [showNotSubmitted, setShowNotSubmitted] = useState(true);
  const [viewModal, setViewModal] = useState({ open: false, pdfUrl: null, loading: false, error: null, title: "" });

  const semesterTypes = [
    { value: "Odd Semester", label: "Odd Semester" },
    { value: "Even Semester", label: "Even Semester" },
    { value: "Summer Semester", label: "Summer Semester" },
  ];

  // Fetch academic years on component mount
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(get_student_grades_academic_years, {
          headers: { Authorization: `Token ${token}` },
        });
        setAcademicYears(
          response.data.academic_years.slice().sort((a, b) => b.localeCompare(a)).map((year) => ({
            value: year,
            label: year,
          }))
        );
      } catch (error) {
        console.error("Error fetching academic years:", error);
        showNotification({
          title: "Error",
          message: "Failed to fetch academic years",
          color: "red",
        });
      }
    };

    fetchAcademicYears();
  }, []);

  // Fetch grade status when both academic year and semester type are selected
  const fetchGradeStatus = async () => {
    if (!selectedAcademicYear || !selectedSemesterType) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        grade_status,
        {
          Role: userRole,
          academic_year: selectedAcademicYear,
          semester_type: selectedSemesterType,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      setGradeStatusData(response.data.grade_status);
    } catch (error) {
      console.error("Error fetching grade status:", error);
      setError("Failed to fetch grade status data");
      showNotification({
        title: "Error",
        message: "Failed to fetch grade status data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, type) => {
    const statusConfig = {
      submitted: {
        "Submitted": { color: "green", icon: IconCheck },
        "Not Submitted": { color: "red", icon: IconX },
      },
      verified: {
        "Verified": { color: "blue", icon: IconCheck },
        "Not Verified": { color: "orange", icon: IconClock },
      },
      validated: {
        "Validated": { color: "purple", icon: IconCheck },
        "Not Validated": { color: "gray", icon: IconClock },
      },
    };

    const config = statusConfig[type]?.[status] || { color: "gray", icon: IconX };
    const IconComponent = config.icon;

    return (
      <Badge
        color={config.color}
        variant="filled"
        leftSection={<IconComponent size={12} />}
        size="sm"
      >
        {status.replace("Not ", "")}
      </Badge>
    );
  };

  const handleViewGrades = async (course) => {
    setViewModal({ open: true, pdfUrl: null, loading: true, error: null, title: `${course.course_code} - ${course.course_name}` });
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios({
        url: download_grades_prof,
        method: "POST",
        data: {
          Role: userRole,
          course_id: course.course_id,
          academic_year: selectedAcademicYear,
          semester_type: selectedSemesterType,
        },
        headers: { Authorization: `Token ${token}` },
        responseType: "blob",
      });
      const fileName = `${course.course_code}_${course.course_name.replace(/[/\\?%*:|"<>]/g, "_")}.pdf`;
      const pdfUrl = URL.createObjectURL(new File([response.data], fileName, { type: "application/pdf" }));
      setViewModal(prev => ({ ...prev, loading: false, pdfUrl }));
    } catch (err) {
      const errText = err.response?.data ? await err.response.data.text?.() : err.message;
      setViewModal(prev => ({ ...prev, loading: false, error: errText || "Failed to load PDF" }));
    }
  };

  const closeViewModal = () => {
    if (viewModal.pdfUrl) URL.revokeObjectURL(viewModal.pdfUrl);
    setViewModal({ open: false, pdfUrl: null, loading: false, error: null, title: "" });
  };

  const getFilteredData = () => {
    return gradeStatusData.filter((course) => {
      if (course.submitted === "Submitted" && !showSubmitted) return false;
      if (course.submitted === "Not Submitted" && !showNotSubmitted) return false;
      return true;
    });
  };

  // Get counts for different statuses
  const getCounts = () => {
    const submitted = gradeStatusData.filter(c => c.submitted === "Submitted").length;
    const notSubmitted = gradeStatusData.filter(c => c.submitted === "Not Submitted").length;
    const verified = gradeStatusData.filter(c => c.verified === "Verified").length;
    const validated = gradeStatusData.filter(c => c.validated === "Validated").length;
    
    return { submitted, notSubmitted, verified, validated, total: gradeStatusData.length };
  };

  // Export to Excel function
  const exportToExcel = () => {
    const filteredData = getFilteredData();
    
    // Create CSV content
    const headers = ["Course Code", "Course Name", "Professor Name", "Credits", "Submitted", "Verified", "Validated"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(course => [
        course.course_code,
        `"${course.course_name}"`,
        `"${course.professor_name}"`,
        course.credits,
        course.submitted,
        course.verified,
        course.validated
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Grade_Status_${selectedAcademicYear}_${selectedSemesterType.replace(" ", "_")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification({
      title: "Export Successful",
      message: "Grade status data exported to Excel successfully",
      color: "green",
    });
  };

  const renderTable = () => {
    const filteredData = getFilteredData();

    if (filteredData.length === 0) {
      return (
        <Center style={{ minHeight: 200 }}>
          <Text c="dimmed">No courses match the current filter settings</Text>
        </Center>
      );
    }

    const rows = filteredData.map((course) => (
      <Table.Tr key={course.course_id}>
        <Table.Td>
          <Text fw={500}>{course.course_code}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{course.course_name}</Text>
          <Text size="xs" c="dimmed">
            Credits: {course.credits} | Version: {course.version}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{course.professor_name}</Text>
        </Table.Td>
        <Table.Td>
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => handleViewGrades(course)}
            title="View submitted grade sheet"
          >
            <IconEye size={16} />
          </ActionIcon>
        </Table.Td>
        <Table.Td>
          {getStatusBadge(course.submitted, "submitted")}
        </Table.Td>
        <Table.Td>
          {getStatusBadge(course.verified, "verified")}
        </Table.Td>
        <Table.Td>
          {getStatusBadge(course.validated, "validated")}
        </Table.Td>
      </Table.Tr>
    ));

    return (
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Course Code</Table.Th>
            <Table.Th>Course Name</Table.Th>
            <Table.Th>Professor Name</Table.Th>
            <Table.Th>View</Table.Th>
            <Table.Th>Submitted</Table.Th>
            <Table.Th>Verified</Table.Th>
            <Table.Th>Validated</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    );
  };

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Paper p="md" style={{ position: "relative" }}>
        <h1>
          Grade Status
        </h1>

        {error && (
          <Alert color="red" mb="md" title="Error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid gutter="md">
          <Grid.Col xs={12} sm={6}>
            <Select
              label="Academic Year"
              placeholder="Select academic year"
              value={selectedAcademicYear}
              onChange={setSelectedAcademicYear}
              data={academicYears}
              disabled={loading}
              required
            />
          </Grid.Col>
          <Grid.Col xs={12} sm={6}>
            <Select
              label="Semester Type"
              placeholder="Select semester type"
              value={selectedSemesterType}
              onChange={setSelectedSemesterType}
              data={semesterTypes}
              disabled={loading}
              required
            />
          </Grid.Col>
        </Grid>

        {selectedAcademicYear && selectedSemesterType && (
          <Grid gutter="md" mt="md">
            <Grid.Col xs={12} sm={8}>
              {/* Empty space for alignment */}
            </Grid.Col>
            <Grid.Col xs={12} sm={4} style={{ display: "flex", alignItems: "flex-end" }}>
              <Button
                onClick={fetchGradeStatus}
                fullWidth
                disabled={!selectedAcademicYear || !selectedSemesterType || loading}
                size="md"
                loading={loading}
              >
                View Grade Status
              </Button>
            </Grid.Col>
          </Grid>
        )}

        {(selectedAcademicYear && selectedSemesterType && !loading && gradeStatusData.length > 0) && (
          <Stack spacing="md" mt="md">
            <Group justify="space-between" align="center">
              <Text fw={600}>
                Grade Status - {selectedAcademicYear} ({selectedSemesterType})
              </Text>
              <Group spacing="lg">
                <Flex align="center" gap="sm">
                  <Switch
                    checked={showSubmitted}
                    onChange={(event) => setShowSubmitted(event.currentTarget.checked)}
                    color="green"
                    label=""
                    size="sm"
                  />
                  <Group spacing="xs">
                    <Badge color="green" variant="filled" size="sm">
                      Submitted
                    </Badge>
                    <Text size="sm" c="dimmed">({getCounts().submitted})</Text>
                  </Group>
                </Flex>
                <Flex align="center" gap="sm">
                  <Switch
                    checked={showNotSubmitted}
                    onChange={(event) => setShowNotSubmitted(event.currentTarget.checked)}
                    color="red"
                    label=""
                    size="sm"
                  />
                  <Group spacing="xs">
                    <Badge color="red" variant="filled" size="sm">
                      Not Submitted
                    </Badge>
                    <Text size="sm" c="dimmed">({getCounts().notSubmitted})</Text>
                  </Group>
                </Flex>
                <Button
                  onClick={exportToExcel}
                  leftSection={<IconDownload size={16} />}
                  variant="outline"
                  color="blue"
                  size="sm"
                >
                  Export Excel
                </Button>
              </Group>
            </Group>

            <Paper withBorder style={{ overflow: "auto" }}>
              {renderTable()}
            </Paper>

            <Group spacing="xl">
              <Text size="sm" c="dimmed">
                <strong>Legend:</strong>
              </Text>
              <Group spacing="sm">
                {getStatusBadge("Submitted", "submitted")}
                <Text size="xs">Professor Submitted</Text>
              </Group>
              <Group spacing="sm">
                {getStatusBadge("Verified", "verified")}
                <Text size="xs">Admin Verified</Text>
              </Group>
              <Group spacing="sm">
                {getStatusBadge("Validated", "validated")}
                <Text size="xs">Dean Validated</Text>
              </Group>
            </Group>
          </Stack>
        )}
      </Paper>
      {/* View Grade PDF Modal */}
      <Modal
        opened={viewModal.open}
        onClose={closeViewModal}
        title={<Text fw={600}>{viewModal.title}</Text>}
        size="90%"
        styles={{ body: { padding: 0, height: "80vh" } }}
      >
        {viewModal.loading && (
          <Center style={{ height: "80vh" }}>
            <Loader />
          </Center>
        )}
        {viewModal.error && (
          <Alert color="red" m="md">{viewModal.error}</Alert>
        )}
        {viewModal.pdfUrl && (
          <iframe
            src={viewModal.pdfUrl}
            style={{ width: "100%", height: "80vh", border: "none" }}
            title="Grade Sheet PDF"
          />
        )}
      </Modal>
    </Card>
  );
}
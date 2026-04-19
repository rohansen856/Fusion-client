import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Flex,
  Input,
  Tabs,
  Text,
  Button,
  Textarea,
  Table,
  Divider,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import axios from "axios";
import {
  updateProfileDataRoute,
  deleteProfileDataRoute,
} from "../../../routes/dashboardRoutes";

function authHeaders() {
  return { Authorization: `Token ${localStorage.getItem("authToken")}` };
}

function extractError(error, fallback) {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.error) return data.error;
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    if (Array.isArray(val)) return `${firstKey}: ${val[0]}`;
    if (typeof val === "string") return `${firstKey}: ${val}`;
  }
  return fallback;
}

function todayIsoDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function EducationTab({ educationData }) {
  const [rows, setRows] = useState(educationData || []);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    degree: "",
    stream: "",
    institute: "",
    grade: "",
    sdate: "",
    edate: "",
  });

  const today = todayIsoDate();

  useEffect(() => {
    setRows(educationData || []);
  }, [educationData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (formData.sdate && formData.sdate > today) {
      notifications.show({
        title: "Invalid start date",
        message: "Start date can't be in the future.",
        color: "red",
      });
      return;
    }
    if (formData.sdate && formData.edate && formData.edate < formData.sdate) {
      notifications.show({
        title: "Invalid end date",
        message: "End date must be on or after the start date.",
        color: "red",
      });
      return;
    }
    try {
      const res = await axios.put(
        updateProfileDataRoute,
        { education: formData },
        { headers: authHeaders() },
      );
      if (res.data && res.data.id) {
        setRows((prev) => [...prev, res.data]);
      }
      notifications.show({
        message: "Education Added Successfully!",
        color: "green",
      });
      setFormData({
        degree: "",
        stream: "",
        institute: "",
        grade: "",
        sdate: "",
        edate: "",
      });
    } catch (error) {
      notifications.show({
        message: extractError(error, "Failed! Please try later."),
        color: "red",
      });
    }
  };

  const handleDelete = async (row) => {
    if (!row?.id) return;
    setDeletingId(row.id);
    try {
      await axios.delete(deleteProfileDataRoute(row.id), {
        headers: authHeaders(),
        data: { deleteedu: true },
      });
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      notifications.show({
        message: "Education entry removed.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: extractError(error, "Failed to remove education."),
        color: "red",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Flex
      w="100%"
      p="md"
      direction="column"
      style={{ border: "1px solid lightgray", borderRadius: "5px" }}
    >
      <Text fw={500} mb="md">
        Add a New Educational Qualification
      </Text>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Degree" w="48%">
          <Input
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
        <Input.Wrapper label="Stream" w="48%">
          <Input
            name="stream"
            value={formData.stream}
            onChange={handleChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
      </Flex>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Institute Name" w="65%">
          <Input
            name="institute"
            value={formData.institute}
            onChange={handleChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
        <Input.Wrapper label="Grade" w="30%">
          <Input
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
      </Flex>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper
          label="Start Date"
          description="Cannot be in the future"
          w="48%"
        >
          <Input
            name="sdate"
            type="date"
            value={formData.sdate}
            onChange={handleChange}
            max={today}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
        <Input.Wrapper label="End Date" w="48%">
          <Input
            name="edate"
            type="date"
            value={formData.edate}
            onChange={handleChange}
            min={formData.sdate || undefined}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
      </Flex>
      <Button onClick={handleSubmit} size="md" w="fit-content" mt="lg">
        Submit
      </Button>
      <Divider my="md" />
      <Text fw={500} mb="md">
        Your Educations
      </Text>
      {rows.length > 0 ? (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Degree</Table.Th>
              <Table.Th>Stream</Table.Th>
              <Table.Th>Institute</Table.Th>
              <Table.Th>Grade</Table.Th>
              <Table.Th visibleFrom="sm">Start Date</Table.Th>
              <Table.Th visibleFrom="sm">End Date</Table.Th>
              <Table.Th style={{ width: 70 }}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((edu, index) => (
              <Table.Tr key={edu.id ?? index}>
                <Table.Td style={{ textAlign: "center" }}>
                  {edu.degree}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {edu.stream}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {edu.institute}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>{edu.grade}</Table.Td>
                <Table.Td style={{ textAlign: "center" }} visibleFrom="sm">
                  {edu.sdate}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }} visibleFrom="sm">
                  {edu.edate}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Tooltip label="Remove" withArrow>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      disabled={!edu.id}
                      loading={deletingId === edu.id}
                      onClick={() => handleDelete(edu)}
                      aria-label="Remove education"
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text mt="lg" style={{ textAlign: "center" }}>
          No data found!
        </Text>
      )}
    </Flex>
  );
}

function CoursesTab({ coursesData }) {
  const [rows, setRows] = useState(coursesData || []);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    course_name: "",
    license_no: "",
    sdate: "",
    edate: "",
    description: "",
  });

  useEffect(() => {
    setRows(coursesData || []);
  }, [coursesData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(
        updateProfileDataRoute,
        { coursesubmit: formData },
        { headers: authHeaders() },
      );
      if (res.data && res.data.id) {
        setRows((prev) => [...prev, res.data]);
      }
      notifications.show({
        message: "Certificate added successfully!",
        color: "green",
      });
      setFormData({
        course_name: "",
        license_no: "",
        sdate: "",
        edate: "",
        description: "",
      });
    } catch (error) {
      notifications.show({
        message: extractError(error, "Failed! Please try later."),
        color: "red",
      });
    }
  };

  const handleDelete = async (row) => {
    if (!row?.id) return;
    setDeletingId(row.id);
    try {
      await axios.delete(deleteProfileDataRoute(row.id), {
        headers: authHeaders(),
        data: { deletecourse: true },
      });
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      notifications.show({
        message: "Certificate removed.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: extractError(error, "Failed to remove certificate."),
        color: "red",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Flex
      w="100%"
      p="md"
      direction="column"
      style={{ border: "1px solid lightgray", borderRadius: "5px" }}
    >
      <Text fw={500} mb="md">
        Add a New Certification Course
      </Text>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Course Name" w="65%">
          <Input
            name="course_name"
            value={formData.course_name}
            onChange={handleChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
        <Input.Wrapper label="License No." w="30%">
          <Input
            name="license_no"
            value={formData.license_no}
            onChange={handleChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
      </Flex>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Start Date" w="48%">
          <Input
            name="sdate"
            type="date"
            value={formData.sdate}
            onChange={handleChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
        <Input.Wrapper label="End Date" w="48%">
          <Input
            name="edate"
            type="date"
            value={formData.edate}
            onChange={handleChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
      </Flex>
      <Input.Wrapper label="Description" w={{ base: "100%", sm: "80%" }}>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          autosize
          minRows={5}
          resize="vertical"
          mt="xs"
        />
      </Input.Wrapper>
      <Button onClick={handleSubmit} size="md" mt="lg">
        Submit
      </Button>
      <Divider my="md" />
      <Text fw={500} mb="md">
        Your Certificates
      </Text>
      {rows.length > 0 ? (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Course Name</Table.Th>
              <Table.Th>License No.</Table.Th>
              <Table.Th>Start Date</Table.Th>
              <Table.Th>Completion Date</Table.Th>
              <Table.Th style={{ width: 70 }}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((course, index) => (
              <Table.Tr key={course.id ?? index}>
                <Table.Td style={{ textAlign: "center" }}>
                  {course.course_name}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {course.license_no}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {course.sdate}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {course.edate}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Tooltip label="Remove" withArrow>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      disabled={!course.id}
                      loading={deletingId === course.id}
                      onClick={() => handleDelete(course)}
                      aria-label="Remove certificate"
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Text mt="lg" style={{ textAlign: "center" }}>
          No data found!
        </Text>
      )}
    </Flex>
  );
}

export default function EducationCoursesComponent({ education, courses }) {
  return (
    <Flex
      w={{ base: "100%", sm: "60%" }}
      p="md"
      h="auto"
      style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      direction="column"
      justify="space-evenly"
    >
      <Tabs defaultValue="education">
        <Tabs.List mb="sm">
          <Tabs.Tab value="education">
            <Text fw={500} size="1.2rem">
              Education
            </Text>
          </Tabs.Tab>
          <Tabs.Tab value="courses">
            <Text fw={500} size="1.2rem">
              Certificate Courses
            </Text>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="education">
          <EducationTab educationData={education} />
        </Tabs.Panel>
        <Tabs.Panel value="courses">
          <CoursesTab coursesData={courses} />
        </Tabs.Panel>
      </Tabs>
    </Flex>
  );
}

const eduShape = PropTypes.shape({
  id: PropTypes.number,
  degree: PropTypes.string,
  stream: PropTypes.string,
  institute: PropTypes.string,
  grade: PropTypes.string,
  sdate: PropTypes.string,
  edate: PropTypes.string,
});

const courseShape = PropTypes.shape({
  id: PropTypes.number,
  course_name: PropTypes.string,
  license_no: PropTypes.string,
  sdate: PropTypes.string,
  edate: PropTypes.string,
  description: PropTypes.string,
});

EducationCoursesComponent.propTypes = {
  education: PropTypes.arrayOf(eduShape),
  courses: PropTypes.arrayOf(courseShape),
};

EducationTab.propTypes = {
  educationData: PropTypes.arrayOf(eduShape),
};

CoursesTab.propTypes = {
  coursesData: PropTypes.arrayOf(courseShape),
};

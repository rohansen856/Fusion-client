import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Flex,
  Input,
  Tabs,
  Text,
  Button,
  Select,
  Table,
  Textarea,
  Divider,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
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

function InternshipsTab({ internshipsData }) {
  const [rows, setRows] = useState(internshipsData || []);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    company: "",
    location: "",
    title: "",
    status: "ONGOING",
    sdate: "",
    edate: "",
    description: "",
  });

  useEffect(() => {
    setRows(internshipsData || []);
  }, [internshipsData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(
        updateProfileDataRoute,
        { experiencesubmit: formData },
        { headers: authHeaders() },
      );
      if (res.data && res.data.id) {
        setRows((prev) => [...prev, res.data]);
      }
      notifications.show({
        message: "Internship Added Successfully!",
        color: "green",
      });
      setFormData({
        company: "",
        location: "",
        title: "",
        status: "ONGOING",
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
        data: { deleteexp: true },
      });
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      notifications.show({
        message: "Internship removed.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: extractError(error, "Failed to remove internship."),
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
        Add a New Internship
      </Text>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Organization Name" w="65%">
          <Input
            name="company"
            value={formData.company}
            onChange={handleChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
        <Input.Wrapper label="Location" w="30%">
          <Input
            name="location"
            value={formData.location}
            onChange={handleChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
      </Flex>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Job Profile Title" w="65%">
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
        <Input.Wrapper label="Status" w="30%">
          <Select
            name="status"
            data={["ONGOING", "COMPLETED"]}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
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
      <Input.Wrapper label="Description" w="100%">
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
        Your Experience
      </Text>

      {rows.length > 0 ? (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Organization</Table.Th>
              <Table.Th>Location</Table.Th>
              <Table.Th>Job Title</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Start Date</Table.Th>
              <Table.Th>End Date</Table.Th>
              <Table.Th style={{ width: 70 }}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((internship, index) => (
              <Table.Tr key={internship.id ?? index}>
                <Table.Td style={{ textAlign: "center" }}>
                  {internship.company}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {internship.location}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {internship.title}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {internship.status}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {internship.sdate}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {internship.edate}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Tooltip label="Remove" withArrow>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      disabled={!internship.id}
                      loading={deletingId === internship.id}
                      onClick={() => handleDelete(internship)}
                      aria-label="Remove internship"
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

function ProjectsTab({ projectsData }) {
  const [rows, setRows] = useState(projectsData || []);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    project_name: "",
    project_status: "ONGOING",
    project_link: "",
    sdate: "",
    edate: "",
    summary: "",
  });

  useEffect(() => {
    setRows(projectsData || []);
  }, [projectsData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(
        updateProfileDataRoute,
        { projectsubmit: formData },
        { headers: authHeaders() },
      );
      if (res.data && res.data.id) {
        setRows((prev) => [...prev, res.data]);
      }
      notifications.show({
        message: "Project Added Successfully!",
        color: "green",
      });
      setFormData({
        project_name: "",
        project_status: "ONGOING",
        project_link: "",
        sdate: "",
        edate: "",
        summary: "",
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
        data: { deletepro: true },
      });
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      notifications.show({
        message: "Project removed.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: extractError(error, "Failed to remove project."),
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
        Add a New Project
      </Text>
      <Flex align="center" justify="space-between" mb="md">
        <Input.Wrapper label="Project Name" w="65%">
          <Input
            name="project_name"
            value={formData.project_name}
            onChange={handleChange}
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
        <Input.Wrapper label="Status" w="30%">
          <Select
            name="project_status"
            data={["ONGOING", "COMPLETED"]}
            value={formData.project_status}
            onChange={(value) =>
              setFormData({ ...formData, project_status: value })
            }
            size="md"
            mt="xs"
          />
        </Input.Wrapper>
      </Flex>
      <Input.Wrapper label="Project Link" w="100%" mb="md">
        <Input
          name="project_link"
          value={formData.project_link}
          onChange={handleChange}
          size="md"
          mt="xs"
        />
      </Input.Wrapper>
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
      <Input.Wrapper label="Description" w="100%" mb="md">
        <Textarea
          name="summary"
          value={formData.summary}
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
        Your Projects
      </Text>
      {rows.length > 0 ? (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Project Name</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Project Link</Table.Th>
              <Table.Th>Start Date</Table.Th>
              <Table.Th>End Date</Table.Th>
              <Table.Th style={{ width: 70 }}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((project, index) => (
              <Table.Tr key={project.id ?? index}>
                <Table.Td style={{ textAlign: "center" }}>
                  {project.project_name}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {project.project_status}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {project.project_link && (
                    <a
                      href={project.project_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.project_link}
                    </a>
                  )}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {project.sdate}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  {project.edate}
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Tooltip label="Remove" withArrow>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      disabled={!project.id}
                      loading={deletingId === project.id}
                      onClick={() => handleDelete(project)}
                      aria-label="Remove project"
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

export default function WorkExperienceComponent({ experience, project }) {
  return (
    <Flex
      w={{ base: "100%", sm: "60%" }}
      p="md"
      h="auto"
      style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      direction="column"
      justify="space-evenly"
    >
      <Tabs defaultValue="internships">
        <Tabs.List mb="sm">
          <Tabs.Tab value="internships">
            <Text fw={500} size="1.2rem">
              Internships
            </Text>
          </Tabs.Tab>
          <Tabs.Tab value="projects">
            <Text fw={500} size="1.2rem">
              Projects
            </Text>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="internships">
          <InternshipsTab internshipsData={experience} />
        </Tabs.Panel>
        <Tabs.Panel value="projects">
          <ProjectsTab projectsData={project} />
        </Tabs.Panel>
      </Tabs>
    </Flex>
  );
}

const experienceShape = PropTypes.shape({
  id: PropTypes.number,
  company: PropTypes.string,
  location: PropTypes.string,
  title: PropTypes.string,
  status: PropTypes.string,
  sdate: PropTypes.string,
  edate: PropTypes.string,
  description: PropTypes.string,
});

const projectShape = PropTypes.shape({
  id: PropTypes.number,
  project_name: PropTypes.string,
  project_status: PropTypes.string,
  project_link: PropTypes.string,
  sdate: PropTypes.string,
  edate: PropTypes.string,
  summary: PropTypes.string,
});

WorkExperienceComponent.propTypes = {
  experience: PropTypes.arrayOf(experienceShape),
  project: PropTypes.arrayOf(projectShape),
};

InternshipsTab.propTypes = {
  internshipsData: PropTypes.arrayOf(experienceShape),
};

ProjectsTab.propTypes = {
  projectsData: PropTypes.arrayOf(projectShape),
};

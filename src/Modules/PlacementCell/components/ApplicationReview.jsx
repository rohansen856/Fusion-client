import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Title,
  Badge,
  Button,
  Group,
  Loader,
  Center,
  Checkbox,
  Text,
  Card,
  Stack,
  Select,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { ListChecks, ArrowLeft } from "@phosphor-icons/react";
import api from "../api";
import {
  myJobsRoute,
  myJobApplicationsRoute,
  shortlistCandidatesRoute,
} from "../../../routes/placementCellRoutes";

const STATUS_COLORS = {
  APPLIED: "blue",
  SHORTLISTED: "cyan",
  UNDER_REVIEW: "yellow",
  INTERVIEW: "violet",
  SELECTED: "green",
  REJECTED: "red",
  WITHDRAWN: "gray",
};

function ApplicationReview({ jobId: propJobId }) {
  const [selectedJobId, setSelectedJobId] = useState(propJobId || null);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(!propJobId);
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState([]);
  const [shortlisting, setShortlisting] = useState(false);

  const jobId = propJobId || selectedJobId;

  useEffect(() => {
    if (!propJobId) fetchJobs();
  }, [propJobId]);

  useEffect(() => {
    if (jobId) fetchApplications();
  }, [jobId]);

  async function fetchJobs() {
    try {
      setJobsLoading(true);
      const response = await api.get(myJobsRoute);
      setJobs(response.data.results || response.data || []);
    } catch (error) {
      showNotification({ title: "Error", message: "Failed to load jobs", color: "red" });
    } finally {
      setJobsLoading(false);
    }
  }

  async function fetchApplications() {
    try {
      setLoading(true);
      const response = await api.get(myJobApplicationsRoute(jobId));
      setApplications(response.data.results || response.data || []);
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to load applications",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  function toggleSelection(appId) {
    setSelected((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId],
    );
  }

  function toggleAll() {
    const eligible = applications
      .filter((a) => a.status === "APPLIED" || a.status === "UNDER_REVIEW")
      .map((a) => a.id);
    if (selected.length === eligible.length) {
      setSelected([]);
    } else {
      setSelected(eligible);
    }
  }

  async function handleShortlist() {
    if (selected.length === 0) {
      showNotification({
        title: "Warning",
        message: "Select at least one application to shortlist",
        color: "yellow",
      });
      return;
    }

    try {
      setShortlisting(true);
      await api.post(shortlistCandidatesRoute(jobId), {
        application_ids: selected,
      });
      showNotification({
        title: "Success",
        message: `${selected.length} candidate(s) shortlisted`,
        color: "green",
      });
      setSelected([]);
      fetchApplications();
    } catch (error) {
      showNotification({
        title: "Error",
        message:
          error.response?.data?.detail || "Failed to shortlist candidates",
        color: "red",
      });
    } finally {
      setShortlisting(false);
    }
  }

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: () => {
          const eligible = applications.filter(
            (a) => a.status === "APPLIED" || a.status === "UNDER_REVIEW",
          );
          return (
            <Checkbox
              checked={
                eligible.length > 0 && selected.length === eligible.length
              }
              indeterminate={
                selected.length > 0 && selected.length < eligible.length
              }
              onChange={toggleAll}
            />
          );
        },
        accessorKey: "id",
        enableSorting: false,
        enableColumnFilter: false,
        size: 50,
        Cell: ({ row }) => {
          const isEligible =
            row.original.status === "APPLIED" ||
            row.original.status === "UNDER_REVIEW";
          return (
            <Checkbox
              checked={selected.includes(row.original.id)}
              onChange={() => toggleSelection(row.original.id)}
              disabled={!isEligible}
            />
          );
        },
      },
      {
        header: "Student Name",
        accessorKey: "student_name",
        accessorFn: (row) =>
          row.student_name || row.student?.name || "Unknown",
      },
      {
        header: "Applied Date",
        accessorKey: "applied_at",
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return val ? new Date(val).toLocaleDateString() : "—";
        },
      },
      {
        header: "CGPA",
        accessorKey: "cgpa",
        Cell: ({ cell }) => cell.getValue() ?? "—",
      },
      {
        header: "Eligible",
        accessorKey: "is_eligible",
        Cell: ({ cell }) => (
          <Badge color={cell.getValue() !== false ? "green" : "red"} variant="light">
            {cell.getValue() !== false ? "Yes" : "No"}
          </Badge>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        Cell: ({ cell }) => {
          const status = cell.getValue() || "APPLIED";
          return (
            <Badge
              color={STATUS_COLORS[status] || "gray"}
              variant="light"
            >
              {status.replace(/_/g, " ")}
            </Badge>
          );
        },
      },
    ],
    [applications, selected],
  );

  const table = useMantineReactTable({
    columns,
    data: applications,
    enableRowSelection: false,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    initialState: { density: "xs" },
    mantineTableProps: { striped: true, highlightOnHover: true },
  });

  if (jobsLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!jobId) {
    return (
      <Container fluid>
        <Title order={2} mb="lg">Application Review</Title>
        {jobs.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No job postings found. Create a job posting first.
          </Text>
        ) : (
          <Stack gap="sm">
            <Text c="dimmed" mb="xs">Select a job posting to review its applications:</Text>
            {jobs.map((job) => (
              <Card
                key={job.id}
                shadow="sm"
                padding="md"
                radius="md"
                withBorder
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedJobId(job.id)}
              >
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>{job.title}</Text>
                    <Text size="sm" c="dimmed">{job.role_offered} &middot; {job.location}</Text>
                  </div>
                  <Group gap="xs">
                    <Badge variant="light">{job.application_count || 0} applications</Badge>
                    <Badge color={job.posting_status === "ACTIVE" ? "green" : "yellow"} variant="light">
                      {job.posting_status}
                    </Badge>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    );
  }

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          {!propJobId && (
            <Button
              variant="subtle"
              leftSection={<ArrowLeft size={16} />}
              onClick={() => { setSelectedJobId(null); setApplications([]); }}
            >
              Back
            </Button>
          )}
          <Title order={2}>Application Review</Title>
        </Group>
        <Button
          leftSection={<ListChecks size={16} />}
          loading={shortlisting}
          onClick={handleShortlist}
          disabled={selected.length === 0}
        >
          Shortlist Selected ({selected.length})
        </Button>
      </Group>

      <MantineReactTable table={table} />
    </Container>
  );
}

export default ApplicationReview;

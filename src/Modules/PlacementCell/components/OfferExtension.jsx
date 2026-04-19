import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Button,
  TextInput,
  NumberInput,
  Badge,
  Loader,
  Center,
  Checkbox,
  Stack,
  Grid,
  Table,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { PaperPlaneTilt, ArrowLeft } from "@phosphor-icons/react";
import api from "../api";
import {
  myJobsRoute,
  myJobApplicationsRoute,
  extendOffersRoute,
} from "../../../routes/placementCellRoutes";

const OFFER_STATUS_COLORS = {
  PENDING: "yellow",
  ACCEPTED: "green",
  DECLINED: "red",
  EXPIRED: "gray",
};

function OfferExtension({ jobId: propJobId }) {
  const [selectedJobId, setSelectedJobId] = useState(propJobId || null);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(!propJobId);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [existingOffers, setExistingOffers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [offerForm, setOfferForm] = useState({
    role_offered: "",
    package_ctc: "",
    deadline_hours: 72,
  });

  const jobId = propJobId || selectedJobId;

  useEffect(() => {
    if (!propJobId) fetchJobs();
  }, [propJobId]);

  useEffect(() => {
    if (jobId) fetchData();
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

  async function fetchData() {
    try {
      setLoading(true);
      const [appsRes, offersRes] = await Promise.all([
        api.get(myJobApplicationsRoute(jobId)),
        api.get(extendOffersRoute(jobId)).catch(() => ({ data: [] })),
      ]);

      const allApps = appsRes.data.results || appsRes.data || [];
      const selectedCandidates = allApps.filter(
        (a) => a.status === "SELECTED",
      );
      setCandidates(selectedCandidates);

      const offers = offersRes.data.results || offersRes.data || [];
      setExistingOffers(offers);
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to load data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  function toggleCandidate(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  async function handleExtendOffers(e) {
    e.preventDefault();
    if (selected.length === 0) {
      showNotification({
        title: "Warning",
        message: "Select at least one candidate",
        color: "yellow",
      });
      return;
    }
    if (!offerForm.role_offered.trim()) {
      showNotification({
        title: "Validation",
        message: "Role offered is required",
        color: "yellow",
      });
      return;
    }

    try {
      setSubmitting(true);
      await api.post(extendOffersRoute(jobId), {
        application_ids: selected,
        role_offered: offerForm.role_offered,
        package_ctc: offerForm.package_ctc,
        deadline_hours: offerForm.deadline_hours,
      });
      showNotification({
        title: "Success",
        message: `Offers extended to ${selected.length} candidate(s)`,
        color: "green",
      });
      setSelected([]);
      fetchData();
    } catch (error) {
      showNotification({
        title: "Error",
        message:
          error.response?.data?.detail || "Failed to extend offers",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const offerColumns = useMemo(
    () => [
      {
        header: "Candidate",
        accessorFn: (row) =>
          row.student_name || row.candidate?.name || "Unknown",
      },
      { header: "Role Offered", accessorKey: "role_offered" },
      {
        header: "Package CTC",
        accessorKey: "package_ctc",
        Cell: ({ cell }) =>
          cell.getValue() ? `${cell.getValue()} LPA` : "—",
      },
      {
        header: "Status",
        accessorKey: "status",
        Cell: ({ cell }) => {
          const status = cell.getValue() || "PENDING";
          return (
            <Badge
              color={OFFER_STATUS_COLORS[status] || "gray"}
              variant="light"
            >
              {status}
            </Badge>
          );
        },
      },
      {
        header: "Responded At",
        accessorKey: "responded_at",
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return val ? new Date(val).toLocaleDateString() : "—";
        },
      },
    ],
    [],
  );

  const offersTable = useMantineReactTable({
    columns: offerColumns,
    data: existingOffers,
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
        <Title order={2} mb="lg">Offer Extension</Title>
        {jobs.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No job postings found. Create a job posting first.
          </Text>
        ) : (
          <Stack gap="sm">
            <Text c="dimmed" mb="xs">Select a job posting to manage its offers:</Text>
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
                  <Badge color={job.posting_status === "ACTIVE" ? "green" : "yellow"} variant="light">
                    {job.posting_status}
                  </Badge>
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
      <Group mb="lg" gap="sm">
        {!propJobId && (
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            onClick={() => { setSelectedJobId(null); setCandidates([]); setExistingOffers([]); }}
          >
            Back
          </Button>
        )}
        <Title order={2}>Offer Extension</Title>
      </Group>

      {candidates.length > 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
          <Title order={4} mb="md">
            Selected Candidates
          </Title>
          <form onSubmit={handleExtendOffers}>
            <Table striped highlightOnHover mb="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={50}>
                    <Checkbox
                      checked={
                        candidates.length > 0 &&
                        selected.length === candidates.length
                      }
                      indeterminate={
                        selected.length > 0 &&
                        selected.length < candidates.length
                      }
                      onChange={() => {
                        if (selected.length === candidates.length) {
                          setSelected([]);
                        } else {
                          setSelected(candidates.map((c) => c.id));
                        }
                      }}
                    />
                  </Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>CGPA</Table.Th>
                  <Table.Th>Branch</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {candidates.map((c) => (
                  <Table.Tr key={c.id}>
                    <Table.Td>
                      <Checkbox
                        checked={selected.includes(c.id)}
                        onChange={() => toggleCandidate(c.id)}
                      />
                    </Table.Td>
                    <Table.Td>
                      {c.student_name || c.student?.name || "Unknown"}
                    </Table.Td>
                    <Table.Td>{c.cgpa ?? "—"}</Table.Td>
                    <Table.Td>{c.branch || c.student?.branch || "—"}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput
                  label="Role Offered"
                  placeholder="e.g. Software Engineer"
                  value={offerForm.role_offered}
                  onChange={(e) =>
                    setOfferForm((prev) => ({
                      ...prev,
                      role_offered: e.target.value,
                    }))
                  }
                  required
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Package CTC (LPA)"
                  placeholder="e.g. 15"
                  value={offerForm.package_ctc}
                  onChange={(val) =>
                    setOfferForm((prev) => ({ ...prev, package_ctc: val }))
                  }
                  min={0}
                  decimalScale={2}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Response Deadline (hours)"
                  placeholder="e.g. 72"
                  value={offerForm.deadline_hours}
                  onChange={(val) =>
                    setOfferForm((prev) => ({ ...prev, deadline_hours: val }))
                  }
                  min={1}
                />
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="md">
              <Button
                type="submit"
                loading={submitting}
                leftSection={<PaperPlaneTilt size={16} />}
                disabled={selected.length === 0}
              >
                Extend Offers ({selected.length})
              </Button>
            </Group>
          </form>
        </Card>
      )}

      {candidates.length === 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
          <Text c="dimmed" ta="center" py="md">
            No selected candidates available for offer extension.
          </Text>
        </Card>
      )}

      {existingOffers.length > 0 && (
        <Stack gap="md">
          <Title order={4}>Existing Offers</Title>
          <MantineReactTable table={offersTable} />
        </Stack>
      )}
    </Container>
  );
}

export default OfferExtension;

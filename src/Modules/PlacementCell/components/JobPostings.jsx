import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Title,
  TextInput,
  Group,
  Paper,
  Card,
  Text,
  Badge,
  Button,
  Stack,
  Loader,
  Center,
  Pagination,
  RangeSlider,
  ThemeIcon,
  Divider,
  Tooltip,
  Anchor,
  SimpleGrid,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  MagnifyingGlass,
  Briefcase,
  MapPin,
  CurrencyInr,
  Clock,
  PaperPlaneTilt,
  GraduationCap,
  Buildings,
  Users,
  CaretDown,
  CaretUp,
  Info,
} from "@phosphor-icons/react";
import api from "../api";
import {
  jobsRoute,
  applicationsRoute,
} from "../../../routes/placementCellRoutes";

const PAGE_SIZE = 6;

const formatCTC = (value) => {
  if (value == null || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `₹ ${num.toFixed(2)} LPA`;
};

const formatDeadline = (raw) => {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime())
    ? raw
    : d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const isExpired = (raw) => {
  if (!raw) return false;
  return new Date(raw) < new Date();
};

function JobCard({ job, applyingId, onApply }) {
  const [expanded, setExpanded] = useState(false);

  const expired = isExpired(job.application_deadline);
  const eligible = job.is_eligible !== false;
  const alreadyApplied = job.has_applied === true;

  const canApply = !expired && eligible && !alreadyApplied;

  const disabledReason = alreadyApplied
    ? "You have already applied for this job."
    : expired
      ? "Application deadline has passed."
      : !eligible
        ? job.eligibility_reason ||
          "You do not meet the eligibility criteria for this job."
        : null;

  const branches = Array.isArray(job.eligible_branches)
    ? job.eligible_branches
    : [];
  const programmes = Array.isArray(job.eligible_programmes)
    ? job.eligible_programmes
    : [];

  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" mb="xs" wrap="wrap" align="flex-start">
        <div style={{ flex: 1, minWidth: 240 }}>
          <Text fw={600} size="lg">
            {job.title ?? "Untitled Role"}
          </Text>
          <Group gap="xs" mt={2} wrap="wrap">
            <Briefcase size={14} />
            <Text size="sm" c="dimmed">
              {job.company_name ?? "—"}
            </Text>
            {job.role_offered && (
              <>
                <Divider orientation="vertical" />
                <Text size="sm" c="dimmed">
                  {job.role_offered}
                </Text>
              </>
            )}
            {job.location && (
              <>
                <Divider orientation="vertical" />
                <MapPin size={14} />
                <Text size="sm" c="dimmed">
                  {job.location}
                </Text>
              </>
            )}
          </Group>
        </div>
        <Group gap="xs">
          {alreadyApplied && (
            <Badge color="blue" variant="light" size="lg">
              Applied
            </Badge>
          )}
          {expired ? (
            <Badge color="gray" variant="light" size="lg">
              Closed
            </Badge>
          ) : (
            <Badge
              color={eligible ? "green" : "red"}
              variant="light"
              size="lg"
            >
              {eligible ? "Eligible" : "Not Eligible"}
            </Badge>
          )}
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" mb="sm" mt="xs">
        <Group gap={6} wrap="nowrap">
          <CurrencyInr size={16} weight="bold" />
          <Text size="sm" fw={500}>
            {formatCTC(job.package_ctc) ?? "CTC TBD"}
          </Text>
        </Group>
        <Group gap={6} wrap="nowrap">
          <GraduationCap size={16} />
          <Text size="sm">
            Min CPI:{" "}
            <Text span fw={500}>
              {job.eligibility_cgpa != null
                ? Number(job.eligibility_cgpa).toFixed(2)
                : "—"}
            </Text>
          </Text>
        </Group>
        <Group gap={6} wrap="nowrap">
          <Users size={16} />
          <Text size="sm">
            Positions:{" "}
            <Text span fw={500}>
              {job.positions_available ?? 1}
            </Text>
          </Text>
        </Group>
        <Group gap={6} wrap="nowrap">
          <Clock size={16} />
          <Text
            size="sm"
            c={expired ? "red" : undefined}
            fw={expired ? 600 : 400}
          >
            {expired
              ? "Expired"
              : job.application_deadline
                ? formatDeadline(job.application_deadline)
                : "No deadline"}
          </Text>
        </Group>
      </SimpleGrid>

      {(branches.length > 0 || programmes.length > 0) && (
        <Group gap="xs" mb="sm" wrap="wrap">
          {branches.length > 0 && (
            <Group gap={6} wrap="nowrap">
              <Buildings size={14} />
              <Text size="xs" c="dimmed">
                Branches:
              </Text>
              {branches.map((b) => (
                <Badge key={b} size="sm" variant="outline" color="blue">
                  {b}
                </Badge>
              ))}
            </Group>
          )}
          {programmes.length > 0 && (
            <Group gap={6} wrap="nowrap">
              <Text size="xs" c="dimmed">
                Programmes:
              </Text>
              {programmes.map((p) => (
                <Badge key={p} size="sm" variant="outline" color="grape">
                  {p}
                </Badge>
              ))}
            </Group>
          )}
        </Group>
      )}

      {job.description && (
        <>
          <Text size="sm" lineClamp={expanded ? undefined : 2} mb={4}>
            {job.description}
          </Text>
          {job.description.length > 140 && (
            <Anchor
              component="button"
              type="button"
              size="xs"
              onClick={() => setExpanded((v) => !v)}
              mb="sm"
            >
              <Group gap={4}>
                {expanded ? <CaretUp size={12} /> : <CaretDown size={12} />}
                {expanded ? "Show less" : "Show more"}
              </Group>
            </Anchor>
          )}
        </>
      )}

      {!eligible && disabledReason && (
        <Paper
          withBorder
          radius="sm"
          p="xs"
          mb="sm"
          style={{ borderColor: "var(--mantine-color-red-3)" }}
        >
          <Group gap={6} align="flex-start" wrap="nowrap">
            <Info size={16} color="var(--mantine-color-red-6)" />
            <Text size="xs" c="red">
              {disabledReason}
            </Text>
          </Group>
        </Paper>
      )}

      <Group justify="flex-end">
        <Tooltip
          label={disabledReason ?? ""}
          withArrow
          disabled={canApply}
          multiline
          w={280}
        >
          <Button
            size="sm"
            leftSection={<PaperPlaneTilt size={16} />}
            disabled={!canApply}
            loading={applyingId === job.id}
            onClick={() => onApply(job.id)}
          >
            {alreadyApplied
              ? "Applied"
              : expired
                ? "Closed"
                : !eligible
                  ? "Not Eligible"
                  : "Apply"}
          </Button>
        </Tooltip>
      </Group>
    </Card>
  );
}

JobCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    company_name: PropTypes.string,
    role_offered: PropTypes.string,
    location: PropTypes.string,
    description: PropTypes.string,
    package_ctc: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    eligibility_cgpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    eligible_branches: PropTypes.arrayOf(PropTypes.string),
    eligible_programmes: PropTypes.arrayOf(PropTypes.string),
    positions_available: PropTypes.number,
    application_deadline: PropTypes.string,
    is_eligible: PropTypes.bool,
    has_applied: PropTypes.bool,
    eligibility_reason: PropTypes.string,
  }).isRequired,
  applyingId: PropTypes.number,
  onApply: PropTypes.func.isRequired,
};

JobCard.defaultProps = {
  applyingId: null,
};

export default function JobPostings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [packageRange, setPackageRange] = useState([0, 100]);
  const [page, setPage] = useState(1);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (company) params.company = company;
      if (location) params.location = location;
      if (packageRange[0] > 0) params.min_package = packageRange[0];
      if (packageRange[1] < 100) params.max_package = packageRange[1];

      const { data } = await api.get(jobsRoute, { params });
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setJobs(list);
    } catch (err) {
      showNotification({
        title: "Error",
        message:
          err.response?.data?.detail ??
          err.response?.data?.message ??
          "Failed to load job postings",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [search, company, location, packageRange]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    setPage(1);
  }, [search, company, location, packageRange]);

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    try {
      await api.post(applicationsRoute, { job: jobId });
      showNotification({
        title: "Applied",
        message: "Your application has been submitted",
        color: "green",
      });
      fetchJobs();
    } catch (err) {
      showNotification({
        title: "Application Failed",
        message:
          err.response?.data?.detail ??
          err.response?.data?.message ??
          "Could not apply to this job",
        color: "red",
      });
    } finally {
      setApplyingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageJobs = jobs.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <Container size="xl" py="md">
      <Title order={3} mb="md">
        Job Postings
      </Title>

      <Paper withBorder radius="md" p="md" mb="md">
        <Stack gap="sm">
          <TextInput
            placeholder="Search jobs…"
            leftSection={<MagnifyingGlass size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <Group grow>
            <TextInput
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.currentTarget.value)}
            />
            <TextInput
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.currentTarget.value)}
            />
          </Group>
          <div>
            <Text size="sm" fw={500} mb={4}>
              Package Range (LPA): {packageRange[0]} – {packageRange[1]}
            </Text>
            <RangeSlider
              min={0}
              max={100}
              step={1}
              value={packageRange}
              onChange={setPackageRange}
              marks={[
                { value: 0, label: "0" },
                { value: 25, label: "25" },
                { value: 50, label: "50" },
                { value: 75, label: "75" },
                { value: 100, label: "100" },
              ]}
              mb="sm"
            />
          </div>
        </Stack>
      </Paper>

      {loading ? (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      ) : jobs.length === 0 ? (
        <Paper p="xl" radius="md" withBorder>
          <Center>
            <Stack align="center" gap="xs">
              <ThemeIcon size={48} variant="light" color="gray" radius="xl">
                <Briefcase size={28} />
              </ThemeIcon>
              <Text c="dimmed" size="lg">
                No jobs match your filters.
              </Text>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <>
          <Stack gap="md">
            {pageJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                applyingId={applyingId}
                onApply={handleApply}
              />
            ))}
          </Stack>

          {totalPages > 1 && (
            <Center mt="lg">
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
              />
            </Center>
          )}
        </>
      )}
    </Container>
  );
}

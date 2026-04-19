import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  SimpleGrid,
  Card,
  Text,
  Group,
  Button,
  Loader,
  Center,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Users,
  CheckCircle,
  ClipboardText,
} from "@phosphor-icons/react";
import api from "../api";
import { myJobsRoute } from "../../../routes/placementCellRoutes";

function CompanyDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    registrationStatus: "PENDING",
    activeJobs: 0,
    totalApplications: 0,
    offersMade: 0,
  });
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const response = await api.get(myJobsRoute);
      const jobList = response.data.results || response.data || [];
      setJobs(jobList);

      const activeJobs = jobList.filter(
        (j) => j.status === "ACTIVE" || j.status === "OPEN",
      ).length;
      const totalApplications = jobList.reduce(
        (sum, j) => sum + (j.application_count || 0),
        0,
      );
      const offersMade = jobList.reduce(
        (sum, j) => sum + (j.offers_count || 0),
        0,
      );

      setMetrics({
        registrationStatus: response.data.registration_status || "APPROVED",
        activeJobs,
        totalApplications,
        offersMade,
      });
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to load dashboard data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  const cards = [
    {
      label: "Registration Status",
      value: metrics.registrationStatus,
      icon: ClipboardText,
      color: metrics.registrationStatus === "APPROVED" ? "green" : "yellow",
    },
    {
      label: "Active Job Postings",
      value: metrics.activeJobs,
      icon: Briefcase,
      color: "blue",
    },
    {
      label: "Total Applications",
      value: metrics.totalApplications,
      icon: Users,
      color: "violet",
    },
    {
      label: "Offers Made",
      value: metrics.offersMade,
      icon: CheckCircle,
      color: "teal",
    },
  ];

  return (
    <Container fluid>
      <Title order={2} mb="lg">
        Company Dashboard
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        {cards.map((card) => (
          <Card key={card.label} shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>
                {card.label}
              </Text>
              <ThemeIcon variant="light" color={card.color} size="lg" radius="md">
                <card.icon size={20} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">
              {card.value}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Group mb="xl">
        <Button
          leftSection={<Briefcase size={16} />}
          onClick={() => navigate("/placement-cell/post-job")}
        >
          Create Job Posting
        </Button>
        <Button
          variant="outline"
          leftSection={<Users size={16} />}
          onClick={() => navigate("/placement-cell/applications")}
        >
          View Applications
        </Button>
      </Group>

      {jobs.length > 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">
            Recent Job Postings
          </Title>
          <Stack gap="sm">
            {jobs.slice(0, 5).map((job) => (
              <Group key={job.id} justify="space-between" p="sm" style={{ borderBottom: "1px solid #eee" }}>
                <div>
                  <Text fw={500}>{job.title}</Text>
                  <Text size="sm" c="dimmed">
                    {job.role} &middot; {job.location}
                  </Text>
                </div>
                <Group gap="xs">
                  <Text size="sm" c="dimmed">
                    {job.application_count || 0} applications
                  </Text>
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() => navigate("/placement-cell/applications")}
                  >
                    Review
                  </Button>
                </Group>
              </Group>
            ))}
          </Stack>
        </Card>
      )}
    </Container>
  );
}

export default CompanyDashboard;

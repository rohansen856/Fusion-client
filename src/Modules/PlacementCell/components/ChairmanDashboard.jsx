import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  SimpleGrid,
  Card,
  Text,
  Group,
  Loader,
  Center,
  ThemeIcon,
  Table,
  Badge,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  ChartBar,
  CurrencyDollar,
  Buildings,
  TrendUp,
} from "@phosphor-icons/react";
import api from "../api";
import { chairmanDashboardRoute } from "../../../routes/placementCellRoutes";

function ChairmanDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      const response = await api.get(chairmanDashboardRoute);
      setDashboard(response.data);
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

  if (!dashboard) {
    return (
      <Container fluid>
        <Text c="dimmed" ta="center" py="xl">
          No dashboard data available.
        </Text>
      </Container>
    );
  }

  const kpis = [
    {
      label: "Total Placed",
      value: dashboard.total_placed ?? 0,
      icon: ChartBar,
      color: "green",
    },
    {
      label: "Avg Package (LPA)",
      value: dashboard.avg_package
        ? `${Number(dashboard.avg_package).toFixed(2)}`
        : "—",
      icon: CurrencyDollar,
      color: "blue",
    },
    {
      label: "Offer Rate",
      value: dashboard.offer_rate
        ? `${(dashboard.offer_rate * 100).toFixed(1)}%`
        : "—",
      icon: TrendUp,
      color: "violet",
    },
    {
      label: "Companies Visited",
      value: dashboard.companies_visited ?? 0,
      icon: Buildings,
      color: "orange",
    },
  ];

  const departments = dashboard.department_breakdown || [];
  const yearTrends = dashboard.year_over_year || [];

  return (
    <Container fluid>
      <Title order={2} mb="lg">
        Placement Chairman Dashboard
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        {kpis.map((kpi) => (
          <Card key={kpi.label} shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>
                {kpi.label}
              </Text>
              <ThemeIcon variant="light" color={kpi.color} size="lg" radius="md">
                <kpi.icon size={20} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">
              {kpi.value}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      {departments.length > 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
          <Title order={4} mb="md">
            Department-wise Breakdown
          </Title>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Department</Table.Th>
                <Table.Th>Eligible</Table.Th>
                <Table.Th>Placed</Table.Th>
                <Table.Th>Placement %</Table.Th>
                <Table.Th>Avg Package</Table.Th>
                <Table.Th>Highest Package</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {departments.map((dept) => {
                const pct =
                  dept.eligible > 0
                    ? ((dept.placed / dept.eligible) * 100).toFixed(1)
                    : "0.0";
                return (
                  <Table.Tr key={dept.department}>
                    <Table.Td fw={500}>{dept.department}</Table.Td>
                    <Table.Td>{dept.eligible}</Table.Td>
                    <Table.Td>{dept.placed}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={parseFloat(pct) >= 80 ? "green" : parseFloat(pct) >= 50 ? "yellow" : "red"}
                        variant="light"
                      >
                        {pct}%
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {dept.avg_package
                        ? `${Number(dept.avg_package).toFixed(2)} LPA`
                        : "—"}
                    </Table.Td>
                    <Table.Td>
                      {dept.highest_package
                        ? `${Number(dept.highest_package).toFixed(2)} LPA`
                        : "—"}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {yearTrends.length > 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">
            Year-over-Year Trends
          </Title>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Year</Table.Th>
                <Table.Th>Total Placed</Table.Th>
                <Table.Th>Companies</Table.Th>
                <Table.Th>Avg Package</Table.Th>
                <Table.Th>Highest Package</Table.Th>
                <Table.Th>Change</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {yearTrends.map((yr, idx) => {
                const prev = idx < yearTrends.length - 1 ? yearTrends[idx + 1] : null;
                const change =
                  prev && prev.total_placed > 0
                    ? (
                        ((yr.total_placed - prev.total_placed) /
                          prev.total_placed) *
                        100
                      ).toFixed(1)
                    : null;
                return (
                  <Table.Tr key={yr.year}>
                    <Table.Td fw={500}>{yr.year}</Table.Td>
                    <Table.Td>{yr.total_placed}</Table.Td>
                    <Table.Td>{yr.companies}</Table.Td>
                    <Table.Td>
                      {yr.avg_package
                        ? `${Number(yr.avg_package).toFixed(2)} LPA`
                        : "—"}
                    </Table.Td>
                    <Table.Td>
                      {yr.highest_package
                        ? `${Number(yr.highest_package).toFixed(2)} LPA`
                        : "—"}
                    </Table.Td>
                    <Table.Td>
                      {change !== null ? (
                        <Text
                          size="sm"
                          c={parseFloat(change) >= 0 ? "green" : "red"}
                          fw={500}
                        >
                          {parseFloat(change) >= 0 ? "+" : ""}
                          {change}%
                        </Text>
                      ) : (
                        "—"
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </Container>
  );
}

export default ChairmanDashboard;

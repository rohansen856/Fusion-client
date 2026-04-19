import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Badge,
  Loader,
  Center,
  Stack,
  Grid,
  Progress,
  Divider,
  Timeline,
  ThemeIcon,
  SimpleGrid,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  Trophy,
  Star,
  MapPin,
  Envelope,
  Hash,
  CalendarBlank,
} from "@phosphor-icons/react";
import api from "../api";
import { studentProfileRoute } from "../../../routes/placementCellRoutes";

function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const response = await api.get(studentProfileRoute);
      setProfile(response.data);
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to load profile",
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

  if (!profile) {
    return (
      <Container fluid>
        <Text c="dimmed" ta="center" py="xl">
          Could not load profile data.
        </Text>
      </Container>
    );
  }

  const { student, skills, education, experience, projects, achievements, placement_info } = profile;

  return (
    <Container fluid>
      <Title order={2} mb="lg">My Placement Profile</Title>

      {/* Basic Info */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
        <Group justify="space-between" mb="md">
          <Group gap="md">
            <ThemeIcon variant="light" color="blue" size={48} radius="xl">
              <User size={24} />
            </ThemeIcon>
            <div>
              <Title order={3}>{student?.name || "Student"}</Title>
              <Text size="sm" c="dimmed">{student?.id}</Text>
            </div>
          </Group>
          <Group gap="xs">
            <Badge color={placement_info?.debar === "NOT DEBAR" ? "green" : "red"} size="lg" variant="light">
              {placement_info?.debar === "NOT DEBAR" ? "Active" : "Debarred"}
            </Badge>
            <Badge color="blue" size="lg" variant="light">
              {placement_info?.placed_type || "NOT PLACED"}
            </Badge>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
          <div>
            <Text size="xs" c="dimmed">Programme</Text>
            <Text fw={500}>{student?.programme || "—"}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">Batch</Text>
            <Text fw={500}>{student?.batch || "—"}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">Department</Text>
            <Text fw={500}>{student?.department?.replace("department: ", "") || "—"}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">CPI</Text>
            <Text fw={700} c="blue">{student?.cpi || "—"}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">Category</Text>
            <Text fw={500}>{student?.category || "—"}</Text>
          </div>
        </SimpleGrid>

        <Divider my="sm" />

        <Group gap="lg">
          <Group gap={4}>
            <Envelope size={14} />
            <Text size="sm">{student?.email || "—"}</Text>
          </Group>
          <Group gap={4}>
            <Star size={14} />
            <Text size="sm">Future: {placement_info?.future_aspect || "—"}</Text>
          </Group>
          {placement_info?.package && (
            <Group gap={4}>
              <Text size="sm" fw={500}>Package: {placement_info.package} LPA</Text>
            </Group>
          )}
        </Group>
      </Card>

      <Grid gutter="md">
        {/* Skills */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group gap="xs" mb="md">
              <Code size={18} />
              <Title order={4}>Skills</Title>
            </Group>
            {skills && skills.length > 0 ? (
              <Stack gap="sm">
                {skills.map((s, i) => (
                  <div key={i}>
                    <Group justify="space-between" mb={4}>
                      <Text size="sm" fw={500}>{s.skill_id__skill || s.skill}</Text>
                      <Text size="xs" c="dimmed">{s.skill_rating}%</Text>
                    </Group>
                    <Progress value={s.skill_rating} size="sm" radius="xl" />
                  </div>
                ))}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">No skills added yet.</Text>
            )}
          </Card>
        </Grid.Col>

        {/* Education */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group gap="xs" mb="md">
              <GraduationCap size={18} />
              <Title order={4}>Education</Title>
            </Group>
            {education && education.length > 0 ? (
              <Stack gap="sm">
                {education.map((e, i) => (
                  <Card key={i} padding="sm" radius="sm" withBorder>
                    <Text fw={500}>{e.degree}</Text>
                    <Text size="sm" c="dimmed">{e.institute} — {e.stream?.replace("department: ", "")}</Text>
                    <Group gap="xs" mt={4}>
                      <Badge size="sm" variant="light">Grade: {e.grade}</Badge>
                      {e.sdate && (
                        <Text size="xs" c="dimmed">
                          {new Date(e.sdate).getFullYear()}{e.edate ? ` — ${new Date(e.edate).getFullYear()}` : " — Present"}
                        </Text>
                      )}
                    </Group>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">No education records.</Text>
            )}
          </Card>
        </Grid.Col>

        {/* Experience */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group gap="xs" mb="md">
              <Briefcase size={18} />
              <Title order={4}>Experience</Title>
            </Group>
            {experience && experience.length > 0 ? (
              <Timeline active={experience.length - 1} bulletSize={24} lineWidth={2}>
                {experience.map((exp, i) => (
                  <Timeline.Item
                    key={i}
                    bullet={<Briefcase size={12} />}
                    title={exp.title || exp.company || "Experience"}
                  >
                    {exp.company && <Text size="sm" fw={500}>{exp.company}</Text>}
                    {exp.location && (
                      <Group gap={4}>
                        <MapPin size={12} />
                        <Text size="xs" c="dimmed">{exp.location}</Text>
                      </Group>
                    )}
                    <Text size="sm" mt={4}>{exp.description}</Text>
                    <Badge size="xs" variant="light" color={exp.status === "ONGOING" ? "blue" : "green"} mt={4}>
                      {exp.status}
                    </Badge>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Text size="sm" c="dimmed">No experience added yet.</Text>
            )}
          </Card>
        </Grid.Col>

        {/* Projects */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group gap="xs" mb="md">
              <Hash size={18} />
              <Title order={4}>Projects</Title>
            </Group>
            {projects && projects.length > 0 ? (
              <Stack gap="sm">
                {projects.map((p, i) => (
                  <Card key={i} padding="sm" radius="sm" withBorder>
                    <Group justify="space-between">
                      <Text fw={500}>{p.project_name}</Text>
                      <Badge size="sm" variant="light" color={p.project_status === "COMPLETED" ? "green" : "blue"}>
                        {p.project_status}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed" mt={4}>{p.summary}</Text>
                    {p.project_link && (
                      <Text size="xs" c="blue" component="a" href={p.project_link} target="_blank" mt={4}>
                        View Project
                      </Text>
                    )}
                  </Card>
                ))}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">No projects added yet.</Text>
            )}
          </Card>
        </Grid.Col>

        {/* Achievements */}
        <Grid.Col span={12}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group gap="xs" mb="md">
              <Trophy size={18} />
              <Title order={4}>Achievements</Title>
            </Group>
            {achievements && achievements.length > 0 ? (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                {achievements.map((a, i) => (
                  <Card key={i} padding="sm" radius="sm" withBorder>
                    <Group justify="space-between">
                      <Text fw={500}>{a.achievement || a.description || "Achievement"}</Text>
                      <Badge size="sm" variant="light">{a.achievement_type}</Badge>
                    </Group>
                    {a.description && a.achievement && (
                      <Text size="sm" c="dimmed" mt={4}>{a.description}</Text>
                    )}
                    <Group gap="xs" mt={4}>
                      {a.issuer && <Text size="xs" c="dimmed">By: {a.issuer}</Text>}
                      {a.date_earned && (
                        <Group gap={4}>
                          <CalendarBlank size={12} />
                          <Text size="xs" c="dimmed">{new Date(a.date_earned).toLocaleDateString()}</Text>
                        </Group>
                      )}
                    </Group>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Text size="sm" c="dimmed">No achievements added yet.</Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default StudentProfile;

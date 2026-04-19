import React, { useState } from "react";
import {
  Container,
  Title,
  Paper,
  Card,
  Text,
  Group,
  Stack,
  Button,
  Badge,
  Center,
  Loader,
  ThemeIcon,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { FileText, DownloadSimple, Check } from "@phosphor-icons/react";
import api from "../api";
import { generateCvRoute } from "../../../routes/placementCellRoutes";

const TEMPLATES = [
  {
    key: "professional",
    label: "Professional",
    color: "blue",
    description:
      "Clean corporate layout ideal for industry roles. Emphasises work experience, technical skills, and achievements in a traditional two-column format.",
  },
  {
    key: "academic",
    label: "Academic",
    color: "violet",
    description:
      "Tailored for research and academic positions. Highlights publications, projects, coursework, and academic achievements with a structured layout.",
  },
  {
    key: "minimal",
    label: "Minimal",
    color: "teal",
    description:
      "A streamlined single-column design that focuses on key information. Perfect for internships or when a concise resume is required.",
  },
];

export default function DownloadCV() {
  const [selected, setSelected] = useState("professional");
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.get(generateCvRoute, {
        params: { template: selected },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `cv_${selected}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showNotification({
        title: "Success",
        message: "CV downloaded successfully",
        color: "green",
      });
    } catch (err) {
      showNotification({
        title: "Download Failed",
        message: err.response?.data?.message ?? "Could not generate CV",
        color: "red",
      });
    } finally {
      setDownloading(false);
    }
  };

  const active = TEMPLATES.find((t) => t.key === selected);

  return (
    <Container size="lg" py="md">
      <Title order={3} mb="md">
        Download CV
      </Title>

      <Group align="flex-start" gap="lg" wrap="wrap">
        <Stack gap="sm" style={{ flex: "1 1 360px" }}>
          <Text fw={500} mb={4}>
            Choose a template
          </Text>

          {TEMPLATES.map((tpl) => {
            const isActive = selected === tpl.key;
            return (
              <Card
                key={tpl.key}
                withBorder
                radius="md"
                padding="md"
                style={{
                  cursor: "pointer",
                  borderColor: isActive
                    ? `var(--mantine-color-${tpl.color}-5)`
                    : undefined,
                  borderWidth: isActive ? 2 : 1,
                }}
                onClick={() => setSelected(tpl.key)}
              >
                <Group justify="space-between">
                  <Group gap="sm">
                    <ThemeIcon
                      variant={isActive ? "filled" : "light"}
                      color={tpl.color}
                      size="lg"
                      radius="md"
                    >
                      <FileText size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600} size="sm">
                        {tpl.label}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {tpl.description}
                      </Text>
                    </div>
                  </Group>
                  {isActive && <Check size={20} weight="bold" color="green" />}
                </Group>
              </Card>
            );
          })}
        </Stack>

        <Paper
          withBorder
          radius="md"
          p="xl"
          style={{ flex: "1 1 320px", minHeight: 260 }}
        >
          <Stack align="center" gap="md">
            <ThemeIcon
              variant="light"
              color={active.color}
              size={64}
              radius="xl"
            >
              <FileText size={36} />
            </ThemeIcon>

            <Badge color={active.color} size="lg" variant="light">
              {active.label}
            </Badge>

            <Text ta="center" size="sm" c="dimmed" maw={300}>
              {active.description}
            </Text>

            <Button
              size="md"
              color={active.color}
              leftSection={
                downloading ? (
                  <Loader size={16} color="white" />
                ) : (
                  <DownloadSimple size={18} weight="bold" />
                )
              }
              onClick={handleDownload}
              disabled={downloading}
              mt="sm"
            >
              {downloading ? "Generating…" : "Download PDF"}
            </Button>
          </Stack>
        </Paper>
      </Group>
    </Container>
  );
}

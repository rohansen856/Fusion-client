import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Button,
  TextInput,
  Textarea,
  Badge,
  Loader,
  Center,
  Stack,
  SimpleGrid,
  Anchor,
  Modal,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  Plus,
  Buildings,
  Briefcase,
  ArrowSquareOut,
  UserCircle,
} from "@phosphor-icons/react";
import api from "../api";
import { referralsRoute } from "../../../routes/placementCellRoutes";

function ReferralBoard() {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    company: "",
    role: "",
    description: "",
    application_link: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchReferrals();
  }, []);

  async function fetchReferrals() {
    try {
      setLoading(true);
      const response = await api.get(referralsRoute);
      setReferrals(response.data.results || response.data || []);
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to load referrals",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const newErrors = {};
    if (!form.company.trim()) newErrors.company = "Company is required";
    if (!form.role.trim()) newErrors.role = "Role is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (form.application_link && !isValidUrl(form.application_link)) {
      newErrors.application_link = "Enter a valid URL";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function isValidUrl(str) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await api.post(referralsRoute, {
        company: form.company,
        role: form.role,
        description: form.description,
        application_link: form.application_link || null,
      });
      showNotification({
        title: "Success",
        message: "Referral posted successfully",
        color: "green",
      });
      setShowForm(false);
      setForm({ company: "", role: "", description: "", application_link: "" });
      setErrors({});
      fetchReferrals();
    } catch (error) {
      showNotification({
        title: "Error",
        message: error.response?.data?.detail || "Failed to post referral",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
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
        <Title order={2}>Referral Board</Title>
        <Button
          leftSection={<Plus size={16} />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Post Referral"}
        </Button>
      </Group>

      {showForm && (
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="lg">
          <Title order={4} mb="md">
            Post a New Referral
          </Title>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <Group grow>
                <TextInput
                  label="Company"
                  placeholder="e.g. Google"
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  error={errors.company}
                  required
                />
                <TextInput
                  label="Role"
                  placeholder="e.g. Software Engineer"
                  value={form.role}
                  onChange={(e) => updateField("role", e.target.value)}
                  error={errors.role}
                  required
                />
              </Group>
              <Textarea
                label="Description"
                placeholder="Job details, requirements, and any referral notes..."
                minRows={4}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                error={errors.description}
                required
              />
              <TextInput
                label="Application Link"
                placeholder="https://careers.example.com/apply"
                value={form.application_link}
                onChange={(e) =>
                  updateField("application_link", e.target.value)
                }
                error={errors.application_link}
              />
              <Group justify="flex-end">
                <Button type="submit" loading={submitting}>
                  Post Referral
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      )}

      {referrals.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No referrals posted yet.
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {referrals.map((referral) => (
            <Card
              key={referral.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <Group justify="space-between" mb="sm">
                <Group gap="sm">
                  <Buildings size={20} weight="duotone" />
                  <Text fw={600} size="lg">
                    {referral.company}
                  </Text>
                </Group>
              </Group>

              <Group gap="xs" mb="sm">
                <Briefcase size={16} />
                <Text size="sm" fw={500}>
                  {referral.role}
                </Text>
              </Group>

              <Text size="sm" c="dimmed" lineClamp={4} mb="md">
                {referral.description}
              </Text>

              <Divider mb="sm" />

              <Group justify="space-between">
                <Group gap="xs">
                  <UserCircle size={14} />
                  <Text size="xs" c="dimmed">
                    {referral.posted_by ||
                      referral.alumni_name ||
                      "Alumni"}
                  </Text>
                  {referral.created_at && (
                    <Text size="xs" c="dimmed">
                      &middot;{" "}
                      {new Date(referral.created_at).toLocaleDateString()}
                    </Text>
                  )}
                </Group>
                {referral.application_link && (
                  <Anchor
                    href={referral.application_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                  >
                    <Group gap={4}>
                      Apply <ArrowSquareOut size={14} />
                    </Group>
                  </Anchor>
                )}
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}

export default ReferralBoard;

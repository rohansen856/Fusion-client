import React, { useState } from "react";
import {
  Container,
  Title,
  Card,
  TextInput,
  Select,
  FileInput,
  Button,
  Group,
  Text,
  Badge,
  Alert,
  Loader,
  Grid,
  Stack,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  GraduationCap,
  CheckCircle,
  Upload,
  LinkedinLogo,
} from "@phosphor-icons/react";
import api from "../api";
import { alumniRegisterRoute } from "../../../routes/placementCellRoutes";

const PROGRAMME_OPTIONS = [
  { value: "B.Tech", label: "B.Tech" },
  { value: "M.Tech", label: "M.Tech" },
  { value: "PhD", label: "PhD" },
  { value: "B.Des", label: "B.Des" },
  { value: "M.Des", label: "M.Des" },
];

const BRANCH_OPTIONS = [
  "CSE",
  "ECE",
  "EE",
  "ME",
  "CE",
  "Design",
  "Mathematics",
  "Physics",
  "NS",
].map((b) => ({ value: b, label: b }));

function AlumniRegistration() {
  const [submitting, setSubmitting] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [form, setForm] = useState({
    graduation_year: "",
    programme: "",
    branch: "",
    current_company: "",
    current_role: "",
    linkedin_url: "",
    document: null,
  });
  const [errors, setErrors] = useState({});

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => {
    const y = String(currentYear - i);
    return { value: y, label: y };
  });

  const MAX_DOC_MB = 5;
  const ALLOWED_EXTS = [".pdf", ".jpg", ".jpeg", ".png"];

  function validate() {
    const newErrors = {};
    const year = parseInt(form.graduation_year, 10);
    if (!form.graduation_year)
      newErrors.graduation_year = "Graduation year is required";
    else if (year < 1990 || year > currentYear)
      newErrors.graduation_year = `Must be between 1990 and ${currentYear}`;
    if (!form.programme) newErrors.programme = "Programme is required";
    if (!form.branch) newErrors.branch = "Branch is required";
    if (!form.current_company.trim())
      newErrors.current_company = "Current company is required";
    if (!form.current_role.trim())
      newErrors.current_role = "Current role is required";
    if (
      form.linkedin_url &&
      !form.linkedin_url.match(
        /^https?:\/\/(www\.)?linkedin\.com\/(in|pub|company)\/[A-Za-z0-9_\-./]+\/?$/i,
      )
    ) {
      newErrors.linkedin_url =
        "Enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/you/)";
    }
    if (form.document) {
      const name = form.document.name || "";
      const ext = name.substring(name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) {
        newErrors.document = `Only ${ALLOWED_EXTS.join(", ")} files allowed.`;
      } else if (form.document.size > MAX_DOC_MB * 1024 * 1024) {
        newErrors.document = `File must be ≤ ${MAX_DOC_MB} MB.`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const formData = new FormData();
      formData.append("graduation_year", form.graduation_year);
      formData.append("programme", form.programme);
      formData.append("branch", form.branch);
      formData.append("current_company", form.current_company);
      formData.append("current_role", form.current_role);
      if (form.linkedin_url) {
        formData.append("linkedin_url", form.linkedin_url);
      }
      if (form.document) {
        formData.append("verification_document", form.document);
      }

      const response = await api.post(alumniRegisterRoute, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const status =
        response.data.verification_status || response.data.status || "PENDING";
      setRegistrationStatus(status);

      showNotification({
        title: "Success",
        message: "Registration submitted successfully",
        color: "green",
      });
    } catch (error) {
      const data = error.response?.data || {};
      const firstField = Object.entries(data).find(
        ([, v]) => Array.isArray(v) && v.length > 0,
      );
      const firstFieldMsg = firstField ? `${firstField[0]}: ${firstField[1][0]}` : null;
      showNotification({
        title: "Error",
        message:
          data.detail || firstFieldMsg || "Registration failed",
        color: "red",
      });
      // Map backend errors back into form errors.
      const fieldErrors = {};
      Object.entries(data).forEach(([k, v]) => {
        if (Array.isArray(v)) fieldErrors[k === "verification_document" ? "document" : k] = v[0];
      });
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
    } finally {
      setSubmitting(false);
    }
  }

  if (registrationStatus) {
    const statusConfig = {
      PENDING: {
        color: "yellow",
        title: "Verification Pending",
        description:
          "Your registration has been submitted. It will be reviewed by the placement cell.",
      },
      VERIFIED: {
        color: "green",
        title: "Verified",
        description:
          "Your alumni registration has been verified. You can now access alumni features.",
      },
      REJECTED: {
        color: "red",
        title: "Verification Failed",
        description:
          "Your registration was not approved. Please contact the placement cell for details.",
      },
    };

    const config = statusConfig[registrationStatus] || statusConfig.PENDING;

    return (
      <Container fluid>
        <Title order={2} mb="lg">
          Alumni Registration
        </Title>
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack align="center" gap="md" py="xl">
            <CheckCircle size={48} color={config.color === "green" ? "#40c057" : "#fab005"} />
            <Badge color={config.color} size="xl" variant="light">
              {config.title}
            </Badge>
            <Text ta="center" maw={500}>
              {config.description}
            </Text>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Title order={2} mb="lg">
        Alumni Registration
      </Title>

      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <form onSubmit={handleSubmit}>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Graduation Year"
                placeholder="Select year"
                data={yearOptions}
                value={form.graduation_year}
                onChange={(val) => updateField("graduation_year", val)}
                error={errors.graduation_year}
                searchable
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Programme"
                placeholder="Select programme"
                data={PROGRAMME_OPTIONS}
                value={form.programme}
                onChange={(val) => updateField("programme", val)}
                error={errors.programme}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Select
                label="Branch"
                placeholder="Select branch"
                data={BRANCH_OPTIONS}
                value={form.branch}
                onChange={(val) => updateField("branch", val)}
                error={errors.branch}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Current Company"
                placeholder="e.g. Google"
                value={form.current_company}
                onChange={(e) =>
                  updateField("current_company", e.target.value)
                }
                error={errors.current_company}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Current Role"
                placeholder="e.g. Senior Software Engineer"
                value={form.current_role}
                onChange={(e) =>
                  updateField("current_role", e.target.value)
                }
                error={errors.current_role}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="LinkedIn Profile URL"
                placeholder="https://linkedin.com/in/yourprofile"
                leftSection={<LinkedinLogo size={16} />}
                value={form.linkedin_url}
                onChange={(e) =>
                  updateField("linkedin_url", e.target.value)
                }
                error={errors.linkedin_url}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <FileInput
                label="Verification Document (PDF/JPG/PNG, ≤ 5 MB)"
                placeholder="Upload degree certificate or ID"
                leftSection={<Upload size={16} />}
                value={form.document}
                onChange={(file) => updateField("document", file)}
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                error={errors.document}
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="xl">
            <Button
              type="submit"
              loading={submitting}
              leftSection={<GraduationCap size={16} />}
              size="md"
            >
              Register as Alumni
            </Button>
          </Group>
        </form>
      </Card>
    </Container>
  );
}

export default AlumniRegistration;

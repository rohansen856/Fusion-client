import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  TextInput,
  Textarea,
  NumberInput,
  MultiSelect,
  Button,
  Group,
  Card,
  Loader,
  Center,
  Grid,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import { FloppyDisk, ArrowLeft } from "@phosphor-icons/react";
import api from "../api";
import {
  myJobsRoute,
  myJobDetailRoute,
} from "../../../routes/placementCellRoutes";

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

const PROGRAMME_OPTIONS = ["B.Tech", "M.Tech", "PhD", "B.Des", "M.Des"].map(
  (p) => ({ value: p, label: p }),
);

function JobPostingForm({ editJobId, onBack }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    role: "",
    location: "",
    package_ctc: "",
    eligibility_cgpa: "",
    branches: [],
    programmes: [],
    deadline: null,
    positions: 1,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editJobId) {
      fetchJobDetails();
    }
  }, [editJobId]);

  async function fetchJobDetails() {
    try {
      setLoading(true);
      const response = await api.get(myJobDetailRoute(editJobId));
      const job = response.data;
      setForm({
        title: job.title || "",
        description: job.description || "",
        role: job.role || "",
        location: job.location || "",
        package_ctc: job.package_ctc || "",
        eligibility_cgpa: job.eligibility_cgpa || "",
        branches: job.branches || [],
        programmes: job.programmes || [],
        deadline: job.deadline ? new Date(job.deadline) : null,
        positions: job.positions || 1,
      });
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to load job details",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const newErrors = {};
    if (!form.title.trim() || form.title.trim().length < 3)
      newErrors.title = "Title must be at least 3 characters";
    if (!form.description.trim() || form.description.trim().length < 20)
      newErrors.description = "Description must be at least 20 characters";
    if (!form.role.trim()) newErrors.role = "Role is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.package_ctc || Number(form.package_ctc) <= 0)
      newErrors.package_ctc = "Package CTC must be positive";
    else if (Number(form.package_ctc) > 100000000)
      newErrors.package_ctc = "Package CTC is unrealistically large";
    if (form.eligibility_cgpa !== "" && form.eligibility_cgpa !== null) {
      const c = Number(form.eligibility_cgpa);
      if (Number.isNaN(c) || c < 0 || c > 10)
        newErrors.eligibility_cgpa = "CGPA must be between 0 and 10";
    }
    if (!form.deadline) newErrors.deadline = "Deadline is required";
    else if (new Date(form.deadline) <= new Date())
      newErrors.deadline = "Deadline must be in the future";
    else {
      const twoYears = new Date();
      twoYears.setFullYear(twoYears.getFullYear() + 2);
      if (new Date(form.deadline) > twoYears)
        newErrors.deadline = "Deadline cannot be more than 2 years ahead";
    }
    if (!form.positions || Number(form.positions) < 1)
      newErrors.positions = "At least one position is required";
    if (form.branches.length === 0)
      newErrors.branches = "Select at least one branch";
    if (form.programmes.length === 0)
      newErrors.programmes = "Select at least one programme";
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
      const payload = {
        title: form.title,
        description: form.description,
        role_offered: form.role,
        location: form.location,
        package_ctc: form.package_ctc,
        eligibility_cgpa: form.eligibility_cgpa || 0,
        eligible_branches: form.branches,
        eligible_programmes: form.programmes,
        application_deadline: form.deadline?.toISOString(),
        positions_available: form.positions,
      };

      if (editJobId) {
        await api.put(myJobDetailRoute(editJobId), payload);
        showNotification({
          title: "Success",
          message: "Job posting updated successfully",
          color: "green",
        });
      } else {
        await api.post(myJobsRoute, payload);
        showNotification({
          title: "Success",
          message: "Job posting created successfully",
          color: "green",
        });
      }
      onBack?.();
    } catch (error) {
      const data = error.response?.data || {};
      const firstField = Object.entries(data).find(
        ([, v]) => Array.isArray(v) && v.length > 0,
      );
      const firstFieldMsg = firstField ? `${firstField[0]}: ${firstField[1][0]}` : null;
      showNotification({
        title: "Error",
        message:
          data.detail || firstFieldMsg || "Failed to save job posting",
        color: "red",
      });
      const fieldErrors = {};
      Object.entries(data).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          const clientKey = {
            eligible_branches: "branches",
            eligible_programmes: "programmes",
            application_deadline: "deadline",
            role_offered: "role",
            positions_available: "positions",
          }[k] || k;
          fieldErrors[clientKey] = v[0];
        }
      });
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
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
      <Group mb="lg">
        {onBack && (
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            onClick={onBack}
          >
            Back
          </Button>
        )}
        <Title order={2}>
          {editJobId ? "Edit Job Posting" : "Create Job Posting"}
        </Title>
      </Group>

      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <form onSubmit={handleSubmit}>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Job Title"
                placeholder="e.g. Software Engineer"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                error={errors.title}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Role"
                placeholder="e.g. Full-Time / Intern"
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
                error={errors.role}
                required
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Description"
                placeholder="Job description and responsibilities"
                minRows={4}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                error={errors.description}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Location"
                placeholder="e.g. Bangalore, India"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                error={errors.location}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <NumberInput
                label="Package CTC (LPA)"
                placeholder="e.g. 12"
                value={form.package_ctc}
                onChange={(val) => updateField("package_ctc", val)}
                error={errors.package_ctc}
                min={0}
                decimalScale={2}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <NumberInput
                label="Eligibility CGPA"
                placeholder="e.g. 7.0"
                value={form.eligibility_cgpa}
                onChange={(val) => updateField("eligibility_cgpa", val)}
                error={errors.eligibility_cgpa}
                min={0}
                max={10}
                decimalScale={2}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <MultiSelect
                label="Eligible Branches"
                placeholder="Select branches"
                data={BRANCH_OPTIONS}
                value={form.branches}
                onChange={(val) => updateField("branches", val)}
                error={errors.branches}
                searchable
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <MultiSelect
                label="Eligible Programmes"
                placeholder="Select programmes"
                data={PROGRAMME_OPTIONS}
                value={form.programmes}
                onChange={(val) => updateField("programmes", val)}
                error={errors.programmes}
                searchable
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DatePickerInput
                label="Application Deadline"
                placeholder="Select deadline"
                value={form.deadline}
                onChange={(val) => updateField("deadline", val)}
                error={errors.deadline}
                minDate={new Date()}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Number of Positions"
                placeholder="e.g. 5"
                value={form.positions}
                onChange={(val) => updateField("positions", val)}
                error={errors.positions}
                min={1}
                max={10000}
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="xl">
            {onBack && (
              <Button variant="default" onClick={onBack}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              loading={submitting}
              leftSection={<FloppyDisk size={16} />}
            >
              {editJobId ? "Update Job" : "Create Job"}
            </Button>
          </Group>
        </form>
      </Card>
    </Container>
  );
}

export default JobPostingForm;

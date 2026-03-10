/* eslint-disable no-restricted-globals */
/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import {
  Button,
  TextInput,
  Grid,
  Textarea,
  FileButton,
  Group,
  Container,
  Paper,
  Title,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { submitPdmRoute } from "../../../routes/SPACSRoutes";

export default function DMProficiencyForm() {
  const form = useForm({
    initialValues: {
      award_type: "DMProficiencyform",
      justification: "",
      correspondence_address: "",
      nearest_policestation: "",
      nearest_railwaystation: "",
      financial_assistance: "",
      grand_total: "",
      title_name: "",
      no_of_students: "",
      roll_no1: "",
      roll_no2: "",
      roll_no3: "",
      roll_no4: "",
      roll_no5: "",
      brief_description: "",
      cse_topic: "",
      ece_topic: "",
      mech_topic: "",
      design_topic: "",
      cse_percentage: "",
      ece_percentage: "",
      mech_percentage: "",
      design_percentage: "",
      Marksheet: null,
    },

    validate: {
      grand_total: (value) =>
        !value || isNaN(value) || Number(value) < 0
          ? "Grand total must be a valid non-negative number"
          : null,
      no_of_students: (value) =>
        !value || isNaN(value) || Number(value) <= 0
          ? "Number of students must be greater than 0"
          : null,
      cse_percentage: (value) =>
        !value || isNaN(value) || value < 0 || value > 100
          ? "CSE % must be between 0 and 100"
          : null,
      ece_percentage: (value) =>
        !value || isNaN(value) || value < 0 || value > 100
          ? "ECE % must be between 0 and 100"
          : null,
      mech_percentage: (value) =>
        !value || isNaN(value) || value < 0 || value > 100
          ? "Mech % must be between 0 and 100"
          : null,
      design_percentage: (value) =>
        !value || isNaN(value) || value < 0 || value > 100
          ? "Design % must be between 0 and 100"
          : null,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm(
      "Are you sure you want to submit the form?",
    );
    if (!confirmed) {
      return; // User cancelled
    }
    // Validate Marksheet field
    if (!form.Marksheet) {
      alert("Marksheet is required. Please upload a file.");
      return;
    }
    if (!form.validate().hasErrors) {
      const formDataToSend = new FormData();
      Object.entries(form.values).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value);
        }
      });

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          alert("User is not authenticated. Please log in.");
          return;
        }

        const response = await fetch(submitPdmRoute, {
          method: "POST",
          body: formDataToSend,
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          console.log("Form submitted successfully:", data);
          alert("Form submitted successfully!");
        } else {
          console.error("Submission failed:", data);
          alert(`Failed: ${data.detail || response.statusText}`);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("An error occurred while submitting the form.");
      }
    }
  };

  return (
    <Container size="lg">
      <Paper radius="md" padding="sm">
        <Title order={2} mb="lg">
          DM Proficiency Form
        </Title>

        <form onSubmit={handleSubmit}>
          <Grid gutter="lg">
            <Grid.Col span={12}>
              <Textarea
                label="Justification"
                placeholder="Enter Justification"
                minRows={3}
                {...form.getInputProps("justification")}
                required
                maxLength={500}
                description="Maximum 500 characters"
                descriptionProps={{ color: "dimmed" }}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Correspondence Address"
                placeholder="Enter Correspondence Address"
                minRows={3}
                {...form.getInputProps("correspondence_address")}
                required
                maxLength={500}
                description="Maximum 500 characters"
                descriptionProps={{ color: "dimmed" }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Nearest Police Station"
                placeholder="Enter Nearest Police Station"
                {...form.getInputProps("nearest_policestation")}
                required
                maxLength={500}
                description="Maximum 500 characters"
                descriptionProps={{ color: "dimmed" }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Nearest Railway Station"
                placeholder="Enter Nearest Railway Station"
                {...form.getInputProps("nearest_railwaystation")}
                required
                maxLength={500}
                description="Maximum 500 characters"
                descriptionProps={{ color: "dimmed" }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Financial Assistance"
                placeholder="Enter Financial Assistance"
                {...form.getInputProps("financial_assistance")}
                required
                maxLength={500}
                description="Maximum 500 characters"
                descriptionProps={{ color: "dimmed" }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Grand Total"
                placeholder="Enter Grand Total"
                value={form.values.grand_total}
                onChange={(value) => {
                  form.setFieldValue("grand_total", value);
                  form.validateField("grand_total");
                }}
                error={form.errors.grand_total}
                required
                maxLength={500}
                description="Maximum 500 characters"
                descriptionProps={{ color: "dimmed" }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Title Name"
                placeholder="Enter Title Name"
                {...form.getInputProps("title_name")}
                required
                maxLength={500}
                description="Maximum 500 characters"
                descriptionProps={{ color: "dimmed" }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Number of Students"
                placeholder="Enter Number of Students"
                value={form.values.no_of_students}
                onChange={(value) => {
                  form.setFieldValue("no_of_students", value);
                  form.validateField("no_of_students");
                }}
                error={form.errors.no_of_students}
                required
              />
            </Grid.Col>

            {[1, 2, 3, 4, 5].map((num) => (
              <Grid.Col span={{ base: 12, sm: 6 }} key={`roll_no${num}`}>
                <TextInput
                  label={`Roll No ${num}`}
                  placeholder={`Enter Roll No ${num}`}
                  {...form.getInputProps(`roll_no${num}`)}
                  required
                  maxLength={10}
                />
              </Grid.Col>
            ))}

            <Grid.Col span={12}>
              <Textarea
                label="Brief Description"
                placeholder="Enter a brief description"
                minRows={4}
                {...form.getInputProps("brief_description")}
                required
                maxLength={500}
                description="Maximum 500 characters"
                descriptionProps={{ color: "dimmed" }}
              />
            </Grid.Col>

            {["cse", "ece", "mech", "design"].map((field) => (
              <React.Fragment key={field}>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={`${field.toUpperCase()} Topic`}
                    placeholder={`Enter ${field.toUpperCase()} Topic`}
                    {...form.getInputProps(`${field}_topic`)}
                    required
                    maxLength={500}
                    description="Maximum 500 characters"
                    descriptionProps={{ color: "dimmed" }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label={`${field.toUpperCase()} Percentage`}
                    placeholder={`Enter ${field.toUpperCase()} Percentage`}
                    value={form.values[`${field}_percentage`]}
                    onChange={(value) => {
                      form.setFieldValue(`${field}_percentage`, value);
                      form.validateField(`${field}_percentage`);
                    }}
                    error={form.errors[`${field}_percentage`]}
                    required
                  />
                </Grid.Col>
              </React.Fragment>
            ))}

            {/* File Upload */}
            <Grid.Col span={12}>
              <FileButton
                onChange={(file) => form.setFieldValue("Marksheet", file)}
                accept="application/pdf"
              >
                {(props) => (
                  <Button {...props} fullWidth>
                    Upload Marksheet (PDF)
                  </Button>
                )}
              </FileButton>
              {form.values.Marksheet?.name && (
                <TextInput
                  value={form.values.Marksheet.name}
                  readOnly
                  mt="sm"
                  label="Uploaded File"
                />
              )}
            </Grid.Col>
          </Grid>

          <Group position="right" mt="xl">
            <Button type="submit" color="blue">
              Submit
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

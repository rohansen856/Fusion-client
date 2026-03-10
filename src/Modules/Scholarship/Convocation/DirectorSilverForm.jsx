import React, { useState } from "react";
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
import { submitSilverRoute } from "../../../routes/SPACSRoutes";

export default function DirectorSilverForm() {
  const [formData, setFormData] = useState({
    award_type: "Director's Silver Medal",
    Marksheet: null,
    justification: "",
    correspondence_address: "",
    nearest_policestation: "",
    nearest_railwaystation: "",
    financial_assistance: "",
    grand_total: "",
    inside_achievements: "",
    outside_achievements: "",
  });

  const [grandTotalError, setGrandTotalError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate grand_total when it changes
    if (name === "grand_total") {
      if (value === "") {
        setGrandTotalError("Grand Total is required");
        // eslint-disable-next-line no-restricted-globals
      } else if (isNaN(value)) {
        setGrandTotalError("Must be a valid number");
      } else if (parseFloat(value) <= 0) {
        setGrandTotalError("Must be a positive number");
      } else {
        setGrandTotalError("");
      }
    }
  };

  const handleFileChange = (file) => {
    setFormData((prev) => ({ ...prev, Marksheet: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm(
      "Are you sure you want to submit the form?",
    );
    if (!confirmed) {
      return; // User cancelled
    }

    // Validate grand_total before submission
    if (formData.grand_total === "") {
      setGrandTotalError("Grand Total is required");
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(formData.grand_total)) {
      setGrandTotalError("Must be a valid number");
      return;
    }
    if (parseFloat(formData.grand_total) <= 0) {
      setGrandTotalError("Must be a positive number");
      return;
    }

    // Validate Marksheet field
    if (!formData.Marksheet) {
      alert("Marksheet is required. Please upload a file.");
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
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

      const response = await fetch(submitSilverRoute, {
        method: "POST",
        body: formDataToSend,
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Form submitted successfully:", result);
        alert("Form submitted successfully!");
      } else {
        const errorData = await response.json();
        console.error("Submission failed:", errorData);
        alert(
          `Failed to submit the form: ${errorData.detail || response.statusText}`,
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  return (
    <Container size="lg">
      <Paper radius="md" p="sm">
        <Title order={2} mb="lg">
          Director's Silver Medal Application Form
        </Title>
        <form onSubmit={handleSubmit}>
          <Grid gutter="lg">
            {/* Basic Information */}

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Nearest Police Station"
                name="nearest_policestation"
                value={formData.nearest_policestation}
                onChange={handleChange}
                placeholder="Enter Nearest Police Station"
                required
                maxLength={500}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Nearest Railway Station"
                name="nearest_railwaystation"
                value={formData.nearest_railwaystation}
                onChange={handleChange}
                placeholder="Enter Nearest Railway Station"
                required
                maxLength={500}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Grand Total Amount"
                name="grand_total"
                value={formData.grand_total}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, grand_total: value }));
                  if (value === "") {
                    setGrandTotalError("Grand Total is required");
                    // eslint-disable-next-line no-restricted-globals
                  } else if (isNaN(value)) {
                    setGrandTotalError("Must be a valid number");
                  } else if (parseFloat(value) <= 0) {
                    setGrandTotalError("Must be a positive number");
                  } else {
                    setGrandTotalError("");
                  }
                }}
                placeholder="Enter Grand Total Amount"
                min={0}
                step={0.01}
                error={grandTotalError}
                required
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Justification"
                name="justification"
                value={formData.justification}
                onChange={handleChange}
                placeholder="Enter Justification"
                minRows={3}
                required
                maxLength={500}
                description="Maximum 500 characters"
                descriptionProps={{ color: "dimmed" }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Correspondence Address"
                name="correspondence_address"
                value={formData.correspondence_address}
                onChange={handleChange}
                placeholder="Enter Correspondence Address"
                minRows={3}
                required
                maxLength={500}
                description="Maximum 500 characters"
                descriptionProps={{ color: "dimmed" }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Financial Assistance"
                name="financial_assistance"
                value={formData.financial_assistance}
                onChange={handleChange}
                placeholder="Describe Financial Assistance"
                minRows={3}
                required
                maxLength={500}
                description="Maximum 500 characters"
                descriptionProps={{ color: "dimmed" }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Inside Achievements"
                name="inside_achievements"
                value={formData.inside_achievements}
                onChange={handleChange}
                placeholder="Enter Inside Achievements"
                minRows={3}
                required
                maxLength={500}
                description="Maximum 500 characters"
                descriptionProps={{ color: "dimmed" }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Outside Achievements"
                name="outside_achievements"
                value={formData.outside_achievements}
                onChange={handleChange}
                placeholder="Enter Outside Achievements"
                minRows={3}
                required
                maxLength={500}
                description="Maximum 500 characters"
                descriptionProps={{ color: "dimmed" }}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <FileButton onChange={handleFileChange} accept="application/pdf">
                {(props) => (
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  <Button {...props} fullWidth>
                    Upload Marksheet (PDF)
                  </Button>
                )}
              </FileButton>
              {formData.Marksheet && (
                <TextInput
                  value={formData.Marksheet.name}
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

import React, { useEffect, useState } from "react";
import {
  Button,
  TextInput,
  Grid,
  Container,
  Paper,
  Title,
  Alert,
  FileButton,
  Text,
  Group,
  Select,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  submitMCMApplicationsRoute,
  checkApplicationWindow,
} from "../../../routes/SPACSRoutes";

/* eslint-disable react/jsx-props-no-spreading */

function ScholarshipForm() {
  const [step, setStep] = useState(1); // Step control for form sections
  const [uploadStatus, setUploadStatus] = useState({});
  const [documents, setDocuments] = useState({});
  const [showForm, setShowForm] = useState({});

  const form = useForm({
    mode: "uncontrolled",
    validateInputOnBlur: true,
    initialValues: {
      brother_name: "",
      brother_occupation: "",
      sister_name: "",
      sister_occupation: "",
      income_father: "",
      income_mother: "",
      income_other: "",
      father_occ: "",
      mother_occ: "",
      father_occ_desc: "",
      mother_occ_desc: "",
      four_wheeler: "",
      four_wheeler_desc: "",
      two_wheeler: "",
      two_wheeler_desc: "",
      house: "",
      plot_area: "",
      constructed_area: "",
      school_fee: "",
      school_name: "",
      bank_name: "",
      loan_amount: "",
      college_fee: "",
      college_name: "",
      annual_income: "",
    },
    validate: {
      income_mother: (value) => (value < 0 ? "Income must be positive" : null),
      income_father: (value) => (value < 0 ? "Income must be positive" : null),
      income_other: (value) => (value < 0 ? "Income must be positive" : null),
      school_fee: (value) => (value < 0 ? "Fee must be positive" : null),
      plot_area: (value) => (value < 0 ? "Area must be positive" : null),
      constructed_area: (value) => (value < 0 ? "Area must be positive" : null),
      loan_amount: (value) => (value < 0 ? "Amount must be positive" : null),
      annual_income: (value) => (value < 0 ? "Income must be positive" : null),
      college_fee: (value) => (value < 0 ? "Fee must be positive" : null),
      two_wheeler: (value) =>
        value < 0 || value > 100 ? "Must be between 0 and 100" : null,
      four_wheeler: (value) =>
        value < 0 || value > 100 ? "Must be between 0 and 100" : null,
    },
  });

  const handleNext = (e) => {
    e.preventDefault();
    const confirmed = window.confirm(
      "Are you sure you want to proceed to next step?",
    );
    if (!confirmed) {
      return; // User cancelled
    }
    form.validate();
    if (Object.keys(form.errors).length === 0) {
      setStep(2);
    }
  };

  const documentFields = [
    {
      id: "income_certificate",
      name: "income_certificate",
      type: ".pdf,.doc,.docx",
    },
    { id: "Marksheet", name: "Marksheet", type: ".pdf,.doc,.docx" },
    { id: "Fee_Receipt", name: "Fee_Receipt", type: ".pdf,.jpg,.jpeg,.png" },
    { id: "Bank_details", name: "Bank_details", type: ".pdf,.doc,.docx" },
    { id: "Affidavit", name: "Affidavit", type: ".pdf,.doc,.docx" },
    { id: "Aadhar_card", name: "Aadhar_card", type: ".pdf,.jpg,.jpeg,.png" },
  ];

  const handleFileChange = (docId, file) => {
    if (file) {
      setUploadStatus((prev) => ({ ...prev, [docId]: "uploading" }));
      setDocuments((prev) => ({ ...prev, [docId]: file }));
      setTimeout(() => {
        setUploadStatus((prev) => ({ ...prev, [docId]: "success" }));
      }, 1500);
    }
  };

  const handleSubmit = async () => {
    // Check if all required documents are uploaded
    const allDocumentsUploaded = documentFields.every(
      (doc) => documents[doc.id] !== undefined,
    );
    if (!allDocumentsUploaded) {
      alert("Please upload all required documents.");
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to submit the form?",
    );
    if (!confirmed) {
      return; // User cancelled
    }
    const submissionData = new FormData();
    Object.keys(form.values).forEach((key) => {
      submissionData.append(key, form.values[key]);
    });
    Object.keys(documents).forEach((key) => {
      if (!documents[key]) {
        alert(`${key} is required`);
        return;
      }
      submissionData.append(key, documents[key]);
    });

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(submitMCMApplicationsRoute, {
        method: "POST",
        body: submissionData,
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        alert("Form data and documents submitted successfully.");
      } else {
        console.error(
          "Failed to submit form data and documents:",
          response.statusText,
        );
        alert("failed to submit data");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("failed to submit data");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(checkApplicationWindow, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ award: "MCM Scholarship" }),
        });

        const data = await response.json();
        setShowForm(data);
        if (response.ok) {
          console.log("from window check result", data.result);
        } else {
          console.error("Failed to get form data", data.message);
          alert("failed to get form data");
        }
      } catch (error) {
        console.error("An error occurred:", error);
        alert("failed to get form data");
      }
    };

    fetchData();
  }, []);

  return (
    <Container size="lg">
      {showForm.result === "Success" ? (
        <Paper radius="md" p="sm">
          <Title order={2} mb="lg">
            {step === 1
              ? "Application Form for Merit Cum Means (MCM) Scholarship:"
              : "Document Upload"}
          </Title>
          {step === 1 && (
            <form onSubmit={handleNext}>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Father's Occupation"
                    placeholder="Select father's occupation"
                    data={[
                      { value: "government", label: "Government" },
                      { value: "private", label: "Private" },
                      { value: "public", label: "Public" },
                      { value: "business", label: "Business" },
                      { value: "medical", label: "Medical" },
                      { value: "consultant", label: "Consultant" },
                      { value: "pensioners", label: "Pensioners" },
                    ]}
                    mt="md"
                    {...form.getInputProps("father_occ")}
                    required
                  />
                  <Select
                    label="Mother's Occupation"
                    placeholder="Select mother's occupation"
                    data={[
                      { value: "EMPLOYED", label: "Employed" },
                      { value: "HOUSE_WIFE", label: "House Wife" },
                    ]}
                    mt="md"
                    {...form.getInputProps("mother_occ")}
                    required
                  />

                  <TextInput
                    label="Brother's Name"
                    placeholder="Enter brother's name"
                    {...form.getInputProps("brother_name")}
                    mt="md"
                    maxLength={200}
                  />

                  <TextInput
                    label="Sister's Occupation"
                    placeholder="Enter sister's occupation"
                    mt="md"
                    {...form.getInputProps("sister_occupation")}
                    maxLength={200}
                  />
                  <NumberInput
                    label="Mother's Annual Income"
                    placeholder="Enter mother's income"
                    mt="md"
                    min={0}
                    error={form.errors.income_mother}
                    {...form.getInputProps("income_mother")}
                    required
                  />
                  <NumberInput
                    label="No of Four Wheeler"
                    placeholder="Enter number of 4-wheeler vehicles"
                    mt="md"
                    min={0}
                    max={100}
                    error={form.errors.four_wheeler}
                    {...form.getInputProps("four_wheeler")}
                    required
                  />
                  <NumberInput
                    label="No of Two Wheeler"
                    placeholder="Enter number of 2-wheeler vehicles"
                    mt="md"
                    min={0}
                    max={100}
                    error={form.errors.two_wheeler}
                    {...form.getInputProps("two_wheeler")}
                    required
                  />
                  <TextInput
                    label="Two Wheeler Description"
                    placeholder="Enter 2-wheeler description"
                    mt="md"
                    {...form.getInputProps("two_wheeler_desc")}
                    maxLength={200}
                  />
                  <TextInput
                    label="House"
                    placeholder="Enter house description"
                    mt="md"
                    {...form.getInputProps("house")}
                    required
                    maxLength={200}
                  />
                  <NumberInput
                    label="Plot Area"
                    placeholder="Enter plot area in square feet"
                    mt="md"
                    min={0}
                    error={form.errors.plot_area}
                    {...form.getInputProps("plot_area")}
                    required
                  />
                  <NumberInput
                    label="Constructed Area"
                    placeholder="Enter constructed area in square feet"
                    mt="md"
                    min={0}
                    error={form.errors.constructed_area}
                    {...form.getInputProps("constructed_area")}
                    required
                  />
                  <NumberInput
                    label="Annual Income"
                    placeholder="Enter annual income"
                    mt="md"
                    min={0}
                    error={form.errors.annual_income}
                    {...form.getInputProps("annual_income")}
                    required
                  />
                  <TextInput
                    label="College Name"
                    placeholder="Enter College Name"
                    mt="md"
                    {...form.getInputProps("college_name")}
                    required
                    maxLength={200}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Father's Occupation Description"
                    placeholder="Describe father's occupation"
                    mt="md"
                    {...form.getInputProps("father_occ_desc")}
                    required
                    maxLength={200}
                  />

                  <TextInput
                    label="Mother's Occupation Description"
                    placeholder="Describe mother's occupation"
                    mt="md"
                    {...form.getInputProps("mother_occ_desc")}
                    required
                    maxLength={200}
                  />

                  <TextInput
                    label="Brother's Occupation"
                    placeholder="Enter brother's occupation"
                    mt="md"
                    {...form.getInputProps("brother_occupation")}
                    maxLength={200}
                  />

                  <TextInput
                    label="Sister's Name"
                    placeholder="Enter sister's name"
                    mt="md"
                    {...form.getInputProps("sister_name")}
                    maxLength={200}
                  />

                  <NumberInput
                    label="Father's Annual Income"
                    placeholder="Enter father's income"
                    mt="md"
                    min={0}
                    error={form.errors.income_father}
                    {...form.getInputProps("income_father")}
                    required
                  />

                  <NumberInput
                    label="Other Sources Annual Income"
                    placeholder="Enter other sources' income"
                    mt="md"
                    min={0}
                    error={form.errors.income_other}
                    {...form.getInputProps("income_other")}
                    required
                  />

                  <TextInput
                    label="Four Wheeler Description"
                    placeholder="Enter vehicle description"
                    mt="md"
                    {...form.getInputProps("four_wheeler_desc")}
                    maxLength={200}
                  />

                  <NumberInput
                    label="School Fee"
                    placeholder="Enter School Fee"
                    mt="md"
                    min={0}
                    error={form.errors.school_fee}
                    {...form.getInputProps("school_fee")}
                    required
                  />

                  <TextInput
                    label="School Name"
                    placeholder="Enter School Name"
                    mt="md"
                    {...form.getInputProps("school_name")}
                    required
                    maxLength={200}
                  />

                  <TextInput
                    label="Bank Name"
                    placeholder="Enter Bank Name"
                    mt="md"
                    {...form.getInputProps("bank_name")}
                    required
                    maxLength={200}
                  />

                  <NumberInput
                    label="Loan Amount"
                    placeholder="Enter Loan Amount"
                    mt="md"
                    min={0}
                    error={form.errors.loan_amount}
                    {...form.getInputProps("loan_amount")}
                    required
                  />

                  <NumberInput
                    label="College Fee"
                    placeholder="Enter College Fee"
                    mt="md"
                    min={0}
                    error={form.errors.college_fee}
                    {...form.getInputProps("college_fee")}
                    required
                  />
                </Grid.Col>
              </Grid>
              <Group position="right" mt="xl">
                <Button type="submit" color="blue">
                  Next
                </Button>
              </Group>
            </form>
          )}

          {step === 2 && (
            <>
              <Alert title="Important" color="blue" mb="lg">
                Please upload all required documents.
              </Alert>
              <Grid>
                {documentFields.map((doc) => (
                  <Grid.Col key={doc.id} xs={12} md={6}>
                    <Text size="sm" weight={500} mb="xs">
                      {doc.name}
                    </Text>
                    <FileButton
                      onChange={(file) => handleFileChange(doc.id, file)}
                      accept={doc.type}
                    >
                      {(fileButtonProps) => (
                        <Button
                          onClick={fileButtonProps.onClick}
                          fullWidth
                          color={
                            uploadStatus[doc.id] === "success"
                              ? "green"
                              : "gray"
                          }
                        >
                          {uploadStatus[doc.id] === "success"
                            ? "Uploaded"
                            : `Choose ${doc.name}`}
                        </Button>
                      )}
                    </FileButton>
                  </Grid.Col>
                ))}
              </Grid>
              <Group position="right" mt="xl">
                <Button variant="default" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button color="blue" onClick={handleSubmit}>
                  Submit All Documents
                </Button>
              </Group>
            </>
          )}
        </Paper>
      ) : (
        <h1>{showForm.message}</h1>
      )}
    </Container>
  );
}

export default ScholarshipForm;

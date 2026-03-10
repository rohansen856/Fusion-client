import React, { useState } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  Container,
  Alert,
  Modal,
  FileInput,
  Text,
} from "@mantine/core";
import PropTypes from "prop-types";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "./GymkhanaForms.css";
import { notifications } from "@mantine/notifications";
import { host } from "../../routes/globalRoutes/index.jsx";
import { useGetClubPositionData } from "./BackendLogic/ApiRoutes.js";

function BudgetApprovalForm({
  clubName,
  initialValues,
  onSubmit,
  editMode = false,
  disabledFields = [],
}) {
  const token = localStorage.getItem("authToken");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formPreviewData, setFormPreviewData] = useState(null);
  const { data: CurrentLogginedRelatedClub = [] } =
    useGetClubPositionData(token);
  // Set up the form with initial values and validation
  const form = useForm({
    initialValues: initialValues || {
      budget_for: "",
      description: "",
      budget_file: null, // For the file upload
      budget_requested: "",
      budget_allocated: "",
      budget_comment: "",
      status: "",
      remarks: "",
      club: clubName,
    },
    validate: {
      budget_for: (value) =>
        value.length === 0 ? "Budget for cannot be empty" : null,
      description: (value) =>
        value.length === 0 ? "Description cannot be empty" : null,
      budget_requested: (value) =>
        typeof value !== "number" || Number.isNaN(value) || value <= 0
          ? "Budget amount must be a positive number"
          : null,
      remarks: (value) =>
        value.length === 0 ? "Remarks cannot be empty" : null,
      budget_file: (value) => (!value ? "You must attach a PDF" : null), // File validation
    },
  });
  const FICName =
    CurrentLogginedRelatedClub.find(
      (c) => c.club === clubName && c.position === "FIC",
    )?.name || null;
  // Mutation setup for submitting the form data via API
  const mutation = useMutation({
    mutationFn: (newBudgetData) => {
      // Create a FormData object for file upload
      const formData = new FormData();
      formData.append("budget_for", newBudgetData.budget_for);
      formData.append("description", newBudgetData.description);
      formData.append("budget_requested", newBudgetData.budget_requested);
      formData.append("status", newBudgetData.status);
      // formData.append("remarks", newBudgetData.remarks);
      formData.append("club", newBudgetData.club);
      formData.append("budget_file", newBudgetData.budget_file);
      formData.append("file_id", newBudgetData.file_id);
      console.log(formData);
      return axios.put(`${host}/gymkhana/api/new_budget/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // For file uploads
          Authorization: `Token ${token}`,
        },
      });
    },
    onSuccess: async (response) => {
      console.log("Successfully submitted budget:", response.data);
      setSuccessMessage("Budget submission successful!");
      // Assume response.data.file_id is returned from the budget API
      const fileId = response.data.file_id;

      // Prepare forwarding FormData (similar to event form)
      const forwardFormData = new FormData();
      forwardFormData.append("receiver", FICName);
      forwardFormData.append("receiver_designation", "FIC");
      forwardFormData.append("remarks", "Approved by Co-ordinator");
      forwardFormData.append(
        "file_extra_JSON",
        JSON.stringify({
          approved_by: "FIC",
          approved_on: new Date().toISOString(),
        }),
      );
      console.log(forwardFormData);
      try {
        await axios.post(
          `${host}/filetracking/api/forwardfile/${fileId}/`,
          forwardFormData,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
      } catch (forwardErr) {
        console.error("File forwarding failed", forwardErr);
        notifications.show({
          title: "Forwarding Failed",
          message: <Text fz="sm">Could not forward file</Text>,
          color: "red",
        });
      }
      form.reset();
    },
    onError: (error) => {
      console.error("Error during budget submission:", error);
      setErrorMessage("Budget submission failed. Please try again.");
    },
  });

  // Budget handleSubmit function with filetracking file creation
  const handleSubmit = async (values) => {
    if (editMode && onSubmit) {
      onSubmit(values);
      return;
    }
    try {
      const fileFormData = new FormData();
      fileFormData.append("designation", "co-ordinator");
      fileFormData.append("receiver_username", FICName);
      fileFormData.append("receiver_designation", "FIC");
      fileFormData.append("subject", values.budget_for || "budget_for");
      fileFormData.append("description", values.description || "description");
      fileFormData.append("src_module", "Gymkhana");
      // fileFormData.append("remarks", "Created file by Coordinator");

      // Use budget_file instead of event_poster
      if (values.budget_file) {
        fileFormData.append("files", values.budget_file);
      }

      const fileRes = await axios.post(
        `${host}/filetracking/api/file/`,
        fileFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${token}`,
          },
        },
      );

      const { file_id } = fileRes.data;
      const formattedValues = {
        ...values,
        file_id,
        budget_allocated: values.budget_allocated
          ? Number(values.budget_allocated)
          : null,
        status: values.status || "COORDINATOR",
        budget_comment: values.budget_comment || null,
      };
      console.log(formattedValues);

      mutation.mutate(formattedValues);
    } catch (err) {
      console.error("Error in file creation or form submit:", err);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const confirmSubmission = () => {
    setShowConfirmModal(false);
    handleSubmit(formPreviewData);
  };

  return (
    <Container>
      <form
        onSubmit={form.onSubmit((values) => {
          setFormPreviewData(values);
          setShowConfirmModal(true);
        })}
        className="club-form"
      >
        <h2 className="club-header"> {clubName}'s Budget Proposal</h2>
        {/* Success Message */}
        {successMessage && (
          <Alert title="Success" color="green" mt="md" className="club-message">
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert title="Error" color="red" mt="md" className="club-message">
            {errorMessage}
          </Alert>
        )}

        {/* Budget For */}
        <TextInput
          label="Budget For"
          placeholder="What is this budget for?"
          value={form.values.budget_for}
          onChange={(event) =>
            form.setFieldValue("budget_for", event.currentTarget.value)
          }
          error={form.errors.budget_for}
          disabled={editMode && disabledFields.includes("budget_for")}
          withAsterisk
        />

        {/* Description */}
        <TextInput
          label="Description"
          placeholder="Enter the budget description"
          value={form.values.description}
          onChange={(event) =>
            form.setFieldValue("description", event.currentTarget.value)
          }
          error={form.errors.description}
          disabled={editMode && disabledFields.includes("description")}
          withAsterisk
        />

        {/* Budget Amount */}
        <TextInput
          label="Budget Amount"
          placeholder="Enter budget amount"
          type="number" // Specify the input type as number
          value={form.values.budget_requested}
          onChange={(event) => {
            const value = parseFloat(event.currentTarget.value); // Convert input to a number
            form.setFieldValue(
              "budget_requested",
              Number.isNaN(value) ? 0 : value,
            ); // Handle NaN
          }}
          error={form.errors.budget_requested}
          withAsterisk
        />

        {/* PDF Upload */}
        <FileInput
          label="Attach PDF"
          placeholder="Upload your budget PDF"
          onChange={(file) => form.setFieldValue("budget_file", file)}
          error={form.errors.budget_file}
          disabled={editMode && disabledFields.includes("budget_file")}
          accept=".pdf"
          withAsterisk
        />

        {/* Remarks */}
        <TextInput
          label="Remarks"
          placeholder="Enter remarks"
          value={form.values.remarks}
          onChange={(event) =>
            form.setFieldValue("remarks", event.currentTarget.value)
          }
          error={form.errors.remarks}
          disabled={editMode && disabledFields.includes("remarks")}
          withAsterisk
        />

        {/* Submit Button */}

        <Group position="center" mt="md" className="submit-container">
          <Button type="submit" className="submit-btn">
            {editMode ? "Update" : "Submit"}
          </Button>
        </Group>
      </form>

      <Modal
        opened={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Budget Submission"
      >
        <Text>
          <strong>Budget For:</strong> {formPreviewData?.budget_for}
        </Text>
        <Text>
          <strong>Description:</strong> {formPreviewData?.description}
        </Text>
        <Text>
          <strong>Requested Amount:</strong> ₹
          {formPreviewData?.budget_requested}
        </Text>
        <Text>
          <strong>Attached File:</strong>{" "}
          {formPreviewData?.budget_file?.name || "No file"}
        </Text>
        <Text>
          <strong>Remarks:</strong> {formPreviewData?.remarks}
        </Text>

        <Group position="apart" mt="md">
          <Button color="green" onClick={confirmSubmission}>
            Confirm
          </Button>
          <Button
            color="red"
            variant="outline"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Success!"
      >
        <p>
          Your budget has been successfully {editMode ? "updated" : "submitted"}
          !
        </p>
        <Button onClick={() => setIsModalOpen(false)}>Close</Button>
      </Modal>
    </Container>
  );
}

BudgetApprovalForm.propTypes = {
  clubName: PropTypes.string.isRequired,
  initialValues: PropTypes,
  onSubmit: PropTypes.func,
  editMode: PropTypes.bool,
  disabledFields: PropTypes.arrayOf(PropTypes.string),
};

function BudgetForm({ clubName }) {
  return (
    <Container>
      <BudgetApprovalForm clubName={clubName} />
    </Container>
  );
}

BudgetForm.propTypes = {
  clubName: PropTypes.string.isRequired,
};

export { BudgetApprovalForm };
export default BudgetForm;

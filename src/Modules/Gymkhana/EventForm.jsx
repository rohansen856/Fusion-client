import React, { useState } from "react";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";
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
import { DateInput, TimeInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { host } from "../../routes/globalRoutes/index.jsx";
import { useGetClubPositionData } from "./BackendLogic/ApiRoutes.js";

function EventsApprovalForm({
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
  const form = useForm({
    initialValues: initialValues || {
      event_name: "",
      venue: "",
      incharge: "",
      end_date: null,
      start_time: "",
      end_time: "",
      event_poster: "",
      details: "",
      club: clubName,
      start_date: null,
      status: "",
    },
    validate: {
      event_name: (value) =>
        value.length < 2 ? "Title must have at least 2 letters" : null,
      venue: (value) => (value.length === 0 ? "Venue cannot be empty" : null),
      incharge: (value) =>
        value.length === 0 ? "Incharge cannot be empty" : null,
      end_date: (value) => (!value ? "End date cannot be empty" : null),
      start_time: (value) =>
        value.length === 0 ? "Start time cannot be empty" : null,
      end_time: (value) =>
        value.length === 0 ? "End time cannot be empty" : null,
      event_poster: (value) =>
        value.length === 0 ? "Event poster cannot be empty" : null,
      details: (value) =>
        value.length === 0 ? "Details cannot be empty" : null,
      start_date: (value) => (!value ? "Start date cannot be empty" : null),
    },
  });
  const FICName =
    CurrentLogginedRelatedClub.find(
      (c) => c.club === clubName && c.position === "FIC",
    )?.name || null;
  const mutation = useMutation({
    mutationFn: (newEventData) => {
      return axios.put(`${host}/gymkhana/api/new_event/`, newEventData, {
        headers: {
          "Content-Type": "multipart/form-data", // For file uploads
          Authorization: `Token ${token}`,
        },
      });
    },
    onSuccess: async (response) => {
      console.log("Successfully requested:", response.data);
      setSuccessMessage("Event request forwarded successfully!");
      setIsModalOpen(true);

      // Assume that response.data.file_id is the file ID generated earlier
      const fileId = response.data.file_id;

      // Prepare FormData for file forwarding
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
      // If you have any files to forward, add them here:
      // forwardFormData.append("files", someFileObject);

      // Call file forwarding API using the file ID from the event response
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
        // Optionally show a notification if forwarding fails
        notifications.show({
          title: "Forwarding Failed",
          message: <Text fz="sm">Could not forward file</Text>,
          color: "red",
        });
      }
      form.reset();
    },
    onError: (error) => {
      console.error("Error during forwarding request:", error);
      setErrorMessage("Request failed. Please try again.");
    },
  });

  // Your handleSubmit function that creates file tracking file and then event
  const handleSubmit = async (values) => {
    if (editMode && onSubmit) {
      onSubmit(values);
      return;
    }
    try {
      // First, create the file by hitting the filetracking API:
      const fileFormData = new FormData();
      fileFormData.append("designation", "co-ordinator");
      fileFormData.append("receiver_username", FICName);
      fileFormData.append("receiver_designation", "FIC");
      fileFormData.append("subject", values.event_name || "event_name");
      fileFormData.append("description", values.details || "details");
      fileFormData.append("src_module", "Gymkhana");
      // fileFormData.append("remarks", "Created file by Coordinator"); // Optional

      if (values.event_poster) {
        fileFormData.append("files", values.event_poster);
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

      // Get the file_id from the file creation response
      const { file_id } = fileRes.data;

      // Prepare your event data by embedding the file_id along with other fields
      const formattedValues = {
        ...values,
        file_id, // Add file tracking ID from file API
        start_date: values.start_date
          ? dayjs(values.start_date).format("YYYY-MM-DD")
          : null,
        end_date: values.end_date
          ? dayjs(values.end_date).format("YYYY-MM-DD")
          : null,
      };
      console.log(formattedValues);

      // Call your event update API
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
        <h2 className="club-header">Apply for {clubName}'s Event !!!</h2>
        {successMessage && (
          <Alert title="Success" color="green" mt="md" className="club-message">
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert title="Error" color="red" mt="md" className="club-message">
            {errorMessage}
          </Alert>
        )}

        <TextInput
          label="Event Name"
          placeholder="Enter event name"
          value={form.values.event_name}
          onChange={(event) =>
            form.setFieldValue("event_name", event.currentTarget.value)
          }
          error={form.errors.event_name}
          disabled={editMode && disabledFields.includes("event_name")}
          withAsterisk
        />
        <TextInput
          label="Details"
          placeholder="Enter the event details"
          value={form.values.details}
          onChange={(event) =>
            form.setFieldValue("details", event.currentTarget.value)
          }
          error={form.errors.details}
          disabled={editMode && disabledFields.includes("details")}
          withAsterisk
        />
        <TextInput
          label="Venue"
          placeholder="Enter the venue"
          value={form.values.venue}
          onChange={(event) =>
            form.setFieldValue("venue", event.currentTarget.value)
          }
          error={form.errors.venue}
          disabled={editMode && disabledFields.includes("venue")}
          withAsterisk
        />
        <TextInput
          label="Incharge"
          placeholder="Incharge"
          value={form.values.incharge}
          onChange={(event) =>
            form.setFieldValue("incharge", event.currentTarget.value)
          }
          error={form.errors.incharge}
          disabled={editMode && disabledFields.includes("incharge")}
          withAsterisk
        />

        <DateInput
          label="Start Date"
          valueFormat="YYYY-MM-DD"
          placeholder="Enter the start date (e.g., YYYY-MM-DD)"
          value={form.values.start_date}
          onChange={(event) => form.setFieldValue("start_date", event)}
          error={form.errors.start_date}
          disabled={editMode && disabledFields.includes("start_date")}
          withAsterisk
        />

        <DateInput
          label="End Date"
          valueFormat="YYYY-MM-DD"
          placeholder="Enter the end date (e.g., YYYY-MM-DD)"
          value={form.values.end_date}
          onChange={(event) => form.setFieldValue("end_date", event)}
          error={form.errors.end_date}
          disabled={editMode && disabledFields.includes("end_date")}
          withAsterisk
        />

        <TimeInput
          label="Start Time"
          placeholder="Enter start time of the event"
          value={form.values.start_time}
          onChange={(event) =>
            form.setFieldValue("start_time", event.currentTarget.value)
          }
          error={form.errors.start_time}
          disabled={editMode && disabledFields.includes("start_time")}
          withAsterisk
        />

        <TimeInput
          label="End Time"
          placeholder="Enter end time of the event"
          value={form.values.end_time}
          onChange={(event) =>
            form.setFieldValue("end_time", event.currentTarget.value)
          }
          error={form.errors.end_time}
          disabled={editMode && disabledFields.includes("end_time")}
          withAsterisk
        />
        <FileInput
          label="Event Poster"
          placeholder="Upload Event Poster"
          value={form.values.event_poster}
          onChange={(file) => form.setFieldValue("event_poster", file)}
          error={form.errors.event_poster}
          // disabled={editMode && disabledFields.includes("event_poster")}
          withAsterisk
          accept=".pdf"
        />

        <Group position="center" mt="md" className="submit-container">
          <Button type="submit" className="submit-btn">
            {editMode ? "Update" : "Submit"}
          </Button>
        </Group>
      </form>

      <Modal
        opened={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Event Submission"
      >
        <Text>
          <strong>Event Name:</strong> {formPreviewData?.event_name}
        </Text>
        <Text>
          <strong>Details:</strong> {formPreviewData?.details}
        </Text>
        <Text>
          <strong>Venue:</strong> {formPreviewData?.venue}
        </Text>
        <Text>
          <strong>Incharge:</strong> {formPreviewData?.incharge}
        </Text>
        <Text>
          <strong>Start Date:</strong>{" "}
          {dayjs(formPreviewData?.start_date).format("YYYY-MM-DD")}
        </Text>
        <Text>
          <strong>End Date:</strong>{" "}
          {dayjs(formPreviewData?.end_date).format("YYYY-MM-DD")}
        </Text>
        <Text>
          <strong>Start Time:</strong> {formPreviewData?.start_time}
        </Text>
        <Text>
          <strong>End Time:</strong> {formPreviewData?.end_time}
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
          Your event has been successfully {editMode ? "updated" : "submitted"}!
        </p>
        <Button onClick={() => setIsModalOpen(false)}>Close</Button>
      </Modal>
    </Container>
  );
}

EventsApprovalForm.propTypes = {
  clubName: PropTypes.string.isRequired,
  initialValues: PropTypes,
  onSubmit: PropTypes.func,
  editMode: PropTypes.bool,
  disabledFields: PropTypes.arrayOf(PropTypes.string),
};

function EventForm({ clubName }) {
  return (
    <Container>
      <EventsApprovalForm clubName={clubName} />
    </Container>
  );
}

EventForm.propTypes = {
  clubName: PropTypes.string.isRequired,
};

export { EventsApprovalForm };
export default EventForm;

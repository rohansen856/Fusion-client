import { useState } from "react";
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  Alert,
} from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import axios from "axios";
import { requestLeave } from "../../../../routes/hostelManagementRoutes";

export default function LeaveForm() {
  const [formData, setFormData] = useState({
    studentName: "",
    rollNumber: "",
    phoneNumber: "",
    reason: "",
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear errors when user starts typing again
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");

    const token = localStorage.getItem("authToken");
    if (!token) {
      setErrors({
        general: "Authentication token not found. Please log in again.",
      });
      setIsSubmitting(false);
      return;
    }

    const data = {
      student_name: formData.studentName,
      roll_num: formData.rollNumber,
      phone_number: formData.phoneNumber,
      reason: formData.reason,
      start_date: formData.startDate,
      end_date: formData.endDate,
    };

    try {
      const response = await axios.post(requestLeave, data, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.message) {
        setSuccessMessage(response.data.message);
        setErrors({}); // Reset errors
        setFormData({
          studentName: "",
          rollNumber: "",
          phoneNumber: "",
          reason: "",
          startDate: "",
          endDate: "",
        });
      } else {
        setErrors({ general: "Unexpected server response." });
      }
    } catch (error) {
      if (error.response) {
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else if (error.response.data.error) {
          setErrors({ general: error.response.data.error });
        } else {
          setErrors({ general: "Unexpected server error occurred." });
        }
      } else {
        setErrors({ general: "Network error. Please check your connection." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName) => {
    const mappings = {
      studentName: "student_name",
      rollNumber: "roll_num",
      phoneNumber: "phone_number",
      startDate: "start_date",
      endDate: "end_date",
      reason: "reason",
    };

    return errors[mappings[fieldName]];
  };

  return (
    <Paper
      shadow="xs"
      p={30}
      radius="md"
      withBorder
      sx={{ maxWidth: 800, margin: "0 auto" }}
    >
      <Stack spacing="xl">
        {successMessage && (
          <Alert
            icon={<IconCheck size={16} />}
            color="teal"
            title="Success"
            variant="light"
          >
            {successMessage}
          </Alert>
        )}

        {errors.general && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            title="Error"
            variant="light"
          >
            {errors.general}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={20}>
            {/* Row 1: Student Name and Roll Number */}
            <Group grow spacing={20} align="flex-start">
              <Box>
                <Text fw={500} mb={8}>
                  Student Name
                </Text>
                <TextInput
                  placeholder="Enter your full name"
                  value={formData.studentName}
                  onChange={(event) =>
                    handleChange("studentName", event.currentTarget.value)
                  }
                  error={getFieldError("studentName")}
                  required
                  size="md"
                />
              </Box>

              <Box>
                <Text fw={500} mb={8}>
                  Roll Number
                </Text>
                <TextInput
                  placeholder="Enter your roll number"
                  value={formData.rollNumber}
                  onChange={(event) =>
                    handleChange("rollNumber", event.currentTarget.value)
                  }
                  error={getFieldError("rollNumber")}
                  required
                  size="md"
                />
              </Box>
            </Group>

            {/* Row 2: Phone, Start Date, End Date */}
            <Group grow spacing={20} align="flex-start">
              <Box>
                <Text fw={500} mb={8}>
                  Phone Number
                </Text>
                <TextInput
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={(event) =>
                    handleChange("phoneNumber", event.currentTarget.value)
                  }
                  error={getFieldError("phoneNumber")}
                  required
                  size="md"
                />
              </Box>

              <Box>
                <Text fw={500} mb={8}>
                  Start Date
                </Text>
                <TextInput
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleChange("startDate", e.currentTarget.value)
                  }
                  error={getFieldError("startDate")}
                  required
                  size="md"
                  rightSection={<Box sx={{ width: 20 }} />}
                />
              </Box>

              <Box>
                <Text fw={500} mb={8}>
                  End Date
                </Text>
                <TextInput
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    handleChange("endDate", e.currentTarget.value)
                  }
                  error={getFieldError("endDate")}
                  required
                  size="md"
                  rightSection={<Box sx={{ width: 20 }} />}
                />
              </Box>
            </Group>

            {/* Row 3: Reason for Leave */}
            <Box>
              <Text fw={500} mb={8}>
                Reason for Leave
              </Text>
              <Textarea
                placeholder="Please provide a detailed reason for your leave"
                value={formData.reason}
                onChange={(event) =>
                  handleChange("reason", event.currentTarget.value)
                }
                error={getFieldError("reason")}
                minRows={4}
                required
                size="md"
              />
            </Box>

            {/* Submit Button */}
            <Box mt={10}>
              <Button
                type="submit"
                loading={isSubmitting}
                size="md"
                fullWidth
                bg="blue"
                sx={{
                  marginTop: 10,
                  height: 45,
                }}
              >
                Submit Request
              </Button>
            </Box>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}

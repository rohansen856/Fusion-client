/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from "prop-types";
import React, { useState } from "react";
import {
  Modal,
  Button,
  Text,
  Divider,
  Grid,
  TextInput,
  Title,
  NumberInput,
  Anchor,
  Alert,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import { FileText, ThumbsUp, ThumbsDown } from "@phosphor-icons/react";
import classes from "../../styles/formStyle.module.css";
import { staffDocumentUploadRoute } from "../../../../routes/RSPCRoutes";
import { host } from "../../../../routes/globalRoutes";

function JoiningReportAndIDCardFormModal({ opened, onClose, staffData }) {
  const [report, setReport] = useState(null);
  const [ID, setID] = useState(null);
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);
  const [failureAlertVisible, setFailureAlertVisible] = useState(false);

  const form = useForm({
    initialValues: {
      salary_per_month: staffData?.salary_per_month,
      start_date: staffData?.start_date
        ? new Date(staffData.start_date).toISOString().split("T")[0]
        : "",
    },
    validate: {
      salary_per_month: (value) =>
        value > 0 ? null : "Salary must be greater than 0",
    },
  });

  const handleSubmit = async (values) => {
    if (!ID && !report) {
      console.error(
        "At least one file (Joining Report or ID Card) is required.",
      );
      setFailureAlertVisible(true);
      setTimeout(() => {
        setFailureAlertVisible(false);
      }, 2500);
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) return console.error("No authentication token found!");

    try {
      const formData = new FormData();
      formData.append("sid", staffData.sid);
      formData.append("start_date", values.start_date);
      formData.append("salary_per_month", values.salary_per_month);
      if (report) {
        formData.append("joining_report", report);
      }
      if (ID) {
        formData.append("id_card", ID);
      }
      formData.forEach((value, key) => {
        console.log(key, value);
      });
      const response = await axios.post(staffDocumentUploadRoute, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      console.log(response.data);
      onClose();
      setSuccessAlertVisible(true);
      setTimeout(() => {
        setSuccessAlertVisible(false);
        window.location.reload();
      }, 2500);
    } catch (error) {
      console.error("Error during Axios POST:", error);
      setFailureAlertVisible(true);
      setTimeout(() => {
        setFailureAlertVisible(false);
      }, 2500);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      styles={{
        content: {
          borderLeft: "0.7rem solid #15ABFF",
        },
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {staffData &&
        Object.keys(staffData).length > 0 &&
        "sid" in staffData ? (
          <>
            <Title order={2} className={classes.formTitle}>
              Upload Joining Report And ID Card
            </Title>
            {staffData.approval === "Approved" ? (
              <>
                <Grid gutter="xl">
                  <Grid.Col span={6}>
                    <Text className={classes.fieldLabel}>Project Title</Text>
                    <TextInput
                      value={staffData.project_title}
                      readOnly
                      styles={{
                        input: {
                          backgroundColor: "#f0f0f0",
                          cursor: "not-allowed", // Show forbidden cursor
                        },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text className={classes.fieldLabel}>Project ID</Text>
                    <TextInput
                      value={staffData.pid}
                      readOnly
                      styles={{
                        input: {
                          backgroundColor: "#f0f0f0",
                          cursor: "not-allowed", // Show forbidden cursor
                        },
                      }}
                    />
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <Text className={classes.fieldLabel}>Personnel Name</Text>
                    <TextInput
                      value={staffData.person}
                      readOnly
                      styles={{
                        input: {
                          backgroundColor: "#f0f0f0",
                          cursor: "not-allowed", // Show forbidden cursor
                        },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text className={classes.fieldLabel}>Staff ID</Text>
                    <TextInput
                      value={staffData.sid}
                      readOnly
                      styles={{
                        input: {
                          backgroundColor: "#f0f0f0",
                          cursor: "not-allowed", // Show forbidden cursor
                        },
                      }}
                    />
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <Text className={classes.fieldLabel}>Designation</Text>
                    <TextInput
                      value={staffData.type}
                      readOnly
                      styles={{
                        input: {
                          backgroundColor: "#f0f0f0",
                          cursor: "not-allowed", // Show forbidden cursor
                        },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text className={classes.fieldLabel}>
                      Consolidated Salary
                    </Text>
                    <TextInput
                      value={`₹${staffData.salary}`}
                      readOnly
                      styles={{
                        input: {
                          backgroundColor: "#f0f0f0",
                          cursor: "not-allowed", // Show forbidden cursor
                        },
                      }}
                    />
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <Text className={classes.fieldLabel}>
                      Appointment Duration
                    </Text>
                    <TextInput
                      value={`${staffData.duration} months`}
                      readOnly
                      styles={{
                        input: {
                          backgroundColor: "#f0f0f0",
                          cursor: "not-allowed", // Show forbidden cursor
                        },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text className={classes.fieldLabel}>Joining Date</Text>
                    <TextInput
                      value={new Date(
                        staffData.start_date,
                      ).toLocaleDateString()}
                      readOnly
                      styles={{
                        input: {
                          backgroundColor: "#f0f0f0",
                          cursor: "not-allowed", // Show forbidden cursor
                        },
                      }}
                    />
                  </Grid.Col>

                  <Grid.Col span={12}>
                    <Divider
                      my="sm"
                      label=""
                      labelPosition="center"
                      size="sm"
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text className={classes.fieldLabel}>
                      Salary Per Month (as mentioned in Joining Report)
                    </Text>
                    <NumberInput
                      placeholder="Salary per month for personnel (in ₹)"
                      min={0}
                      {...form.getInputProps("salary_per_month")}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text className={classes.fieldLabel}>
                      Joining Date (as mentioned in Joining Report)
                    </Text>
                    <input
                      type="date"
                      required
                      {...form.getInputProps("start_date")}
                      className={classes.dateInput}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Group position="apart" align="center">
                      <Text className={classes.fieldLabel}>
                        Joining Report{" "}
                        <Anchor
                          href="https://www.iiitdmj.ac.in/rspc.iiitdmj.ac.in/DRSPC/PEM/PEM06%20Joining%20Report.docx"
                          style={{ fontSize: "0.85em" }}
                        >
                          (Download format here)
                        </Anchor>
                      </Text>
                      <div className={classes.fileInputContainer}>
                        <Button
                          variant="outline"
                          color="#15ABFF"
                          size="xs"
                          component="label"
                          className={classes.fileInputButton}
                          style={{ borderRadius: "8px" }}
                        >
                          <FileText size={26} style={{ marginRight: "3px" }} />
                          Choose File
                          <input
                            type="file"
                            hidden
                            onChange={(event) =>
                              setReport(event.currentTarget.files[0])
                            }
                          />
                        </Button>
                        {report && (
                          <span className={classes.fileName}>
                            {report.name}
                          </span>
                        )}
                      </div>
                    </Group>
                    {staffData.joining_report && (
                      <Button
                        variant="outline"
                        color="#15ABFF"
                        size="xs"
                        className={classes.fileInputButton}
                        style={{ borderRadius: "8px" }}
                        component="a"
                        href={`${host}/${staffData.joining_report}`} // Directly access the file URL
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText size={26} style={{ marginRight: "3px" }} />
                        Uploaded Joining Report
                      </Button>
                    )}
                  </Grid.Col>

                  <Grid.Col span={12}>
                    <Divider
                      my="sm"
                      label=""
                      labelPosition="center"
                      size="sm"
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Group position="apart" align="center">
                      <Text className={classes.fieldLabel}>
                        ID Card{" "}
                        <Anchor
                          href="https://www.iiitdmj.ac.in/rspc.iiitdmj.ac.in/DRSPC/PEM/PEM07%20ID%20Card.doc"
                          style={{ fontSize: "0.85em" }}
                        >
                          (Download format here)
                        </Anchor>
                      </Text>
                      <div className={classes.fileInputContainer}>
                        <Button
                          variant="outline"
                          color="#15ABFF"
                          size="xs"
                          component="label"
                          className={classes.fileInputButton}
                          style={{ borderRadius: "8px" }}
                        >
                          <FileText size={26} style={{ marginRight: "3px" }} />
                          Choose File
                          <input
                            type="file"
                            hidden
                            onChange={(event) =>
                              setID(event.currentTarget.files[0])
                            }
                          />
                        </Button>
                        {ID && (
                          <span className={classes.fileName}>{ID.name}</span>
                        )}
                      </div>
                    </Group>
                    {staffData.id_card && (
                      <Button
                        variant="outline"
                        color="#15ABFF"
                        size="xs"
                        className={classes.fileInputButton}
                        style={{ borderRadius: "8px" }}
                        component="a"
                        href={`${host}/${staffData.id_card}`} // Directly access the file URL
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText size={26} style={{ marginRight: "3px" }} />
                        Uploaded ID Card
                      </Button>
                    )}
                  </Grid.Col>
                </Grid>

                <div className={classes.submitButtonContainer}>
                  <Button
                    size="lg"
                    type="submit"
                    color="cyan"
                    style={{ borderRadius: "8px" }}
                  >
                    Submit
                  </Button>
                </div>
              </>
            ) : (
              <Text color="red" align="center">
                Staff position not yet filled!
              </Text>
            )}
          </>
        ) : (
          <Text color="red" align="center">
            Failed to load staff details
          </Text>
        )}
      </form>
      {(successAlertVisible || failureAlertVisible) && (
        <div className={classes.overlay}>
          <Alert
            variant="filled"
            color={successAlertVisible ? "#85B5D9" : "red"}
            title={
              successAlertVisible
                ? "Document Upload Successful"
                : "Document Upload Failed"
            }
            icon={
              successAlertVisible ? (
                <ThumbsUp size={96} />
              ) : (
                <ThumbsDown size={96} />
              )
            }
            className={classes.alertBox}
          >
            {successAlertVisible
              ? "The staff document has been successfully uploaded! The staff details have been successfully updated!"
              : "The staff document could not be uploaded! At least one file (Joining Report or ID Card) is required. Please verify the filled details and submit the form again."}
          </Alert>
        </div>
      )}
    </Modal>
  );
}

JoiningReportAndIDCardFormModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  staffData: PropTypes.shape({
    sid: PropTypes.number,
    pid: PropTypes.number,
    project_title: PropTypes.string,
    eligibility: PropTypes.string,
    sponsor_agency: PropTypes.string,
    duration_project: PropTypes.number,
    ad_file: PropTypes.string,
    comparative_file: PropTypes.string,
    selection_committee: PropTypes.arrayOf(PropTypes.string),
    test_date: PropTypes.string,
    test_mode: PropTypes.string,
    submission_date: PropTypes.string,
    id_card: PropTypes.string,
    duration: PropTypes.number,
    candidates_applied: PropTypes.number,
    candidates_called: PropTypes.number,
    candidates_interviewed: PropTypes.number,
    approval: PropTypes.string,
    joining_report: PropTypes.string,
    type: PropTypes.string,
    sanction_date: PropTypes.string,
    start_date: PropTypes.string,
    interview_date: PropTypes.string,
    interview_place: PropTypes.string,
    salary: PropTypes.number,
    salary_per_month: PropTypes.number,
    person: PropTypes.string,
    biodata_final: PropTypes.arrayOf(PropTypes.string),
    biodata_number: PropTypes.number,
    final_selection: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
      }),
    ),
    waiting_list: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
      }),
    ),
  }).isRequired,
};

export default JoiningReportAndIDCardFormModal;

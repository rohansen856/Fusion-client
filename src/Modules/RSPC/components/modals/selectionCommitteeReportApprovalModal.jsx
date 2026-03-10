/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from "prop-types";
import React, { useState } from "react";
import {
  Modal,
  Button,
  Text,
  Divider,
  Grid,
  Group,
  GridCol,
  Alert,
  Title,
} from "@mantine/core";
import axios from "axios";
import { FileText, ThumbsUp, ThumbsDown } from "@phosphor-icons/react";
import { host } from "../../../../routes/globalRoutes";
import classes from "../../styles/formStyle.module.css";
import {
  committeeActionRoute,
  staffDecisionRoute,
} from "../../../../routes/RSPCRoutes";

function SelectionCommitteeReportApprovalModal({
  opened,
  onClose,
  staffData,
  setActiveTab,
}) {
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);
  const [failureAlertVisible, setFailureAlertVisible] = useState(false);
  const [alertHeader, setAlertHeader] = useState(
    "Selection Committee Report Failed",
  );
  const [alertBody, setAlertBody] = useState(
    "Your action on selection committee's report could not be successfully registered! Please verify the filled details and try again.",
  );

  const handleCommitteeAction = async (action) => {
    const token = localStorage.getItem("authToken");
    if (!token) return console.error("No authentication token found!");

    try {
      const formData = new FormData();
      formData.append("sid", staffData.sid);
      formData.append("action", action);
      formData.forEach((value, key) => {
        console.log(key, value);
      });
      const response = await axios.post(committeeActionRoute, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      onClose();
      setAlertHeader("Selection Committee Action Successful");
      setAlertBody(
        "Your action on selection committee's report is successfully registered! The report needs to be checked by other members of the selection committee.",
      );
      console.log(response.data);
      setSuccessAlertVisible(true);
      setTimeout(() => {
        setSuccessAlertVisible(false);
        setActiveTab("0");
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

  const handleStaffDecision = async (action) => {
    const token = localStorage.getItem("authToken");
    if (!token) return console.error("No authentication token found!");
    if (action === "approve" && staffData.approval === "HoD Forward") {
      action = "forward";
    }

    try {
      const formData = new FormData();
      formData.append("sid", staffData.sid);
      formData.append("action", action);
      formData.append("form", "report");
      formData.forEach((value, key) => {
        console.log(key, value);
      });
      const response = await axios.post(staffDecisionRoute, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      onClose();
      setAlertHeader("Selection Committee Report Decision Successful");
      setAlertBody(
        "Your decision on selection committee's report is successfully registered!",
      );
      console.log(response.data);
      setSuccessAlertVisible(true);
      setTimeout(() => {
        setSuccessAlertVisible(false);
        setActiveTab("0");
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
    <>
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
        {staffData && Object.keys(staffData).length > 0 ? (
          <>
            <Group position="apart" style={{ marginBottom: 10 }}>
              <Title order={2}>Report Of Selection Committee</Title>
              <Group position="left" style={{ marginTop: "20px" }}>
                <Button
                  color="green"
                  style={{ borderRadius: "8px" }}
                  size="xs"
                  onClick={() =>
                    staffData.approval === "Committee Approval"
                      ? handleCommitteeAction("approve")
                      : handleStaffDecision("approve")
                  }
                >
                  <ThumbsUp size={26} style={{ marginRight: "3px" }} />
                  {staffData.approval === "HoD Forward" ? "Forward" : "Approve"}
                </Button>
                <Button
                  color="red"
                  style={{ borderRadius: "8px" }}
                  size="xs"
                  onClick={() =>
                    staffData.approval === "Committee Approval"
                      ? handleCommitteeAction("reject")
                      : handleStaffDecision("reject")
                  }
                  variant="outline"
                >
                  <ThumbsDown size={26} style={{ marginRight: "3px" }} />
                  Reject
                </Button>
              </Group>
            </Group>

            <Grid gutter="xs" style={{ marginBottom: 20 }}>
              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>Project Title:</span>{" "}
                  {staffData.project_title}
                </Text>
              </GridCol>
              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>Project ID:</span>{" "}
                  {staffData.pid}
                </Text>
              </GridCol>

              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>Designation:</span>{" "}
                  {staffData.type}
                </Text>
              </GridCol>
              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>Sponsor Agency:</span>{" "}
                  {staffData.sponsor_agency}
                </Text>
              </GridCol>
              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>Project duration:</span>{" "}
                  {staffData.duration_project} months
                </Text>
              </GridCol>

              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>Test Date:</span>{" "}
                  {new Date(staffData.test_date).toLocaleDateString()}
                </Text>
              </GridCol>
              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>Interview Date:</span>{" "}
                  {new Date(staffData.interview_date).toLocaleDateString()}
                </Text>
              </GridCol>

              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>Interview Venue:</span>{" "}
                  {staffData.interview_place}
                </Text>
              </GridCol>

              <Grid.Col span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>
                    Number Of Candidates Applied:
                  </span>{" "}
                  {staffData.candidates_applied}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>
                    Number Of Candidates Called For Test:
                  </span>{" "}
                  {staffData.candidates_called}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>
                    Number Of Candidates Interviewed:
                  </span>{" "}
                  {staffData.candidates_interviewed}
                </Text>
              </Grid.Col>

              <Grid.Col span={12}>
                <Divider my="sm" label="" labelPosition="center" size="sm" />
              </Grid.Col>

              <Grid.Col span={12}>
                <Title
                  order={4}
                  style={{ textAlign: "center", color: "#A0A0A0" }}
                >
                  Final Selection(s) For {staffData.type}
                </Title>

                {staffData.final_selection.map((candidate, index) => (
                  <Grid key={index} gutter="sm" align="center">
                    <Grid.Col span={12}>
                      <Text className={classes.fieldLabel}>
                        Selection {index + 1}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text>
                        <span style={{ color: "#A0A0A0" }}>
                          Candidate Name:
                        </span>{" "}
                        {candidate.name}
                      </Text>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Text>
                        <span style={{ color: "#A0A0A0" }}>Date Of Birth:</span>{" "}
                        {new Date(candidate.dob).toLocaleDateString()}
                      </Text>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Text>
                        <span style={{ color: "#A0A0A0" }}>Category:</span>{" "}
                        {candidate.category}
                      </Text>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Text>
                        <span style={{ color: "#A0A0A0" }}>
                          Consolidated Salary:
                        </span>{" "}
                        ₹{candidate.salary}
                      </Text>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Text>
                        <span style={{ color: "#A0A0A0" }}>Term Duration:</span>{" "}
                        {candidate.duration} months
                      </Text>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Text>
                        <span style={{ color: "#A0A0A0" }}>
                          Start Date Of Term:
                        </span>{" "}
                        {new Date(candidate.begin).toLocaleDateString()}
                      </Text>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Text>
                        <span style={{ color: "#A0A0A0" }}>
                          End Date Of Term:
                        </span>{" "}
                        {new Date(candidate.end).toLocaleDateString()}
                      </Text>
                    </Grid.Col>

                    <Grid.Col span={6}>
                      <Group position="apart" align="center">
                        <Text style={{ color: "#A0A0A0" }}>Resume:</Text>
                        {staffData.biodata_final[index] ? (
                          <Button
                            variant="outline"
                            color="#15ABFF"
                            size="xs"
                            className={classes.fileInputButton}
                            style={{ borderRadius: "8px" }}
                            component="a"
                            href={`${host}/${staffData.biodata_final[index]}`} // Directly access the file URL
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText
                              size={26}
                              style={{ marginRight: "3px" }}
                            />
                            Open Resume
                          </Button>
                        ) : (
                          <span>No resume uploaded</span>
                        )}
                      </Group>
                    </Grid.Col>

                    <Grid.Col span={12}>
                      <Divider
                        my="sm"
                        label=""
                        labelPosition="center"
                        size="sm"
                      />
                    </Grid.Col>
                  </Grid>
                ))}
              </Grid.Col>

              {staffData.waiting_list.length > 0 && (
                <Grid.Col span={12}>
                  <Title
                    order={4}
                    style={{ textAlign: "center", color: "#A0A0A0" }}
                  >
                    Waiting List For {staffData.type}
                  </Title>

                  {staffData.waiting_list.map((candidate, index) => (
                    <Grid key={index} gutter="sm" align="center">
                      <Grid.Col span={12}>
                        <Text className={classes.fieldLabel}>
                          Selection {index + 1}
                        </Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text>
                          <span style={{ color: "#A0A0A0" }}>
                            Candidate Name:
                          </span>{" "}
                          {candidate.name}
                        </Text>
                      </Grid.Col>

                      <Grid.Col span={6}>
                        <Text>
                          <span style={{ color: "#A0A0A0" }}>
                            Date Of Birth:
                          </span>{" "}
                          {new Date(candidate.dob).toLocaleDateString()}
                        </Text>
                      </Grid.Col>

                      <Grid.Col span={6}>
                        <Text>
                          <span style={{ color: "#A0A0A0" }}>Category:</span>{" "}
                          {candidate.category}
                        </Text>
                      </Grid.Col>

                      <Grid.Col span={6}>
                        <Text>
                          <span style={{ color: "#A0A0A0" }}>
                            Consolidated Salary:
                          </span>{" "}
                          ₹{candidate.salary}
                        </Text>
                      </Grid.Col>

                      <Grid.Col span={6}>
                        <Text>
                          <span style={{ color: "#A0A0A0" }}>
                            Term Duration:
                          </span>{" "}
                          {candidate.duration} months
                        </Text>
                      </Grid.Col>

                      <Grid.Col span={6}>
                        <Text>
                          <span style={{ color: "#A0A0A0" }}>
                            Start Date Of Term:
                          </span>{" "}
                          {new Date(candidate.begin).toLocaleDateString()}
                        </Text>
                      </Grid.Col>

                      <Grid.Col span={6}>
                        <Text>
                          <span style={{ color: "#A0A0A0" }}>
                            End Date Of Term:
                          </span>{" "}
                          {new Date(candidate.end).toLocaleDateString()}
                        </Text>
                      </Grid.Col>

                      <Grid.Col span={6}>
                        <Group position="apart" align="center">
                          <Text style={{ color: "#A0A0A0" }}>Resume:</Text>
                          {staffData.biodata_waiting[index] ? (
                            <Button
                              variant="outline"
                              color="#15ABFF"
                              size="xs"
                              className={classes.fileInputButton}
                              style={{ borderRadius: "8px" }}
                              component="a"
                              href={`${host}/${staffData.biodata_waiting[index]}`} // Directly access the file URL
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText
                                size={26}
                                style={{ marginRight: "3px" }}
                              />
                              Open Resume
                            </Button>
                          ) : (
                            <span>No resume uploaded</span>
                          )}
                        </Group>
                      </Grid.Col>

                      <Grid.Col span={12}>
                        <Divider
                          my="sm"
                          label=""
                          labelPosition="center"
                          size="sm"
                        />
                      </Grid.Col>
                    </Grid>
                  ))}
                </Grid.Col>
              )}

              <Grid.Col span={12}>
                <Group position="apart" align="center">
                  <Text style={{ color: "#A0A0A0" }}>
                    Copy Of Advertisement Uploaded On Institute Website:
                  </Text>
                  {staffData.ad_file ? (
                    <Button
                      variant="outline"
                      color="#15ABFF"
                      size="xs"
                      className={classes.fileInputButton}
                      style={{ borderRadius: "8px" }}
                      component="a"
                      href={`${host}/${staffData.ad_file}`} // Directly access the file URL
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText size={26} style={{ marginRight: "3px" }} />
                      Open Copy
                    </Button>
                  ) : (
                    <span>No file uploaded</span>
                  )}
                </Group>
              </Grid.Col>

              <Grid.Col span={12}>
                <Group position="apart" align="center">
                  <Text style={{ color: "#A0A0A0" }}>
                    Comparative Statements Of Candidates:
                  </Text>
                  {staffData.comparative_file ? (
                    <Button
                      variant="outline"
                      color="#15ABFF"
                      size="xs"
                      className={classes.fileInputButton}
                      style={{ borderRadius: "8px" }}
                      component="a"
                      href={`${host}/${staffData.comparative_file}`} // Directly access the file URL
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText size={26} style={{ marginRight: "3px" }} />
                      Open Statement
                    </Button>
                  ) : (
                    <span>No file uploaded</span>
                  )}
                </Group>
              </Grid.Col>
            </Grid>
          </>
        ) : (
          <Text color="red" align="center">
            Failed to load staff details
          </Text>
        )}
      </Modal>

      {(successAlertVisible || failureAlertVisible) && (
        <div className={classes.overlay}>
          <Alert
            variant="filled"
            color={successAlertVisible ? "#85B5D9" : "red"}
            title={alertHeader}
            icon={
              successAlertVisible ? (
                <ThumbsUp size={96} />
              ) : (
                <ThumbsDown size={96} />
              )
            }
            className={classes.alertBox}
          >
            {alertBody}
          </Alert>
        </div>
      )}
    </>
  );
}

SelectionCommitteeReportApprovalModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  staffData: PropTypes.shape({
    pid: PropTypes.string.isRequired,
    biodata_waiting: PropTypes.arrayOf(PropTypes.string),
    biodata_final: PropTypes.arrayOf(PropTypes.string),
    sponsor_agency: PropTypes.string,
    project_title: PropTypes.string,
    approval: PropTypes.string,
    type: PropTypes.string,
    duration_project: PropTypes.number,
    test_date: PropTypes.string,
    interview_date: PropTypes.string,
    interview_place: PropTypes.string,
    salary: PropTypes.number,
    sid: PropTypes.number,
    candidates_applied: PropTypes.number,
    candidates_called: PropTypes.number,
    candidates_interviewed: PropTypes.number,
    ad_file: PropTypes.string,
    comparative_file: PropTypes.string,
    final_selection: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        dob: PropTypes.string.isRequired,
        category: PropTypes.string,
        duration: PropTypes.number,
        salary: PropTypes.number,
        begin: PropTypes.string,
        end: PropTypes.string,
      }),
    ),
    waiting_list: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        dob: PropTypes.string.isRequired,
        category: PropTypes.string,
        duration: PropTypes.number,
        salary: PropTypes.number,
        begin: PropTypes.string,
        end: PropTypes.string,
      }),
    ),
  }).isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default SelectionCommitteeReportApprovalModal;

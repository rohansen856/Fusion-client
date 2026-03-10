import PropTypes from "prop-types";
import React, { useState } from "react";
import {
  Modal,
  Group,
  Button,
  Text,
  Grid,
  Divider,
  GridCol,
  Alert,
  Title,
} from "@mantine/core";
import axios from "axios";
import { ThumbsUp, ThumbsDown, FileText } from "@phosphor-icons/react";
import classes from "../../styles/formStyle.module.css";
import { staffDecisionRoute } from "../../../../routes/RSPCRoutes";
import { host } from "../../../../routes/globalRoutes";

function AdvertisementAndCommitteeApprovalModal({
  opened,
  onClose,
  staffData,
  setActiveTab,
}) {
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);
  const [failureAlertVisible, setFailureAlertVisible] = useState(false);
  const [alertHeader, setAlertHeader] = useState(
    "Advertisement And Committee Approval Failed",
  );
  const [alertBody, setAlertBody] = useState(
    "Your action on advertisement and committee request could not be successfully registered! Please verify the filled details and try again.",
  );

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
      formData.append("form", "ad");
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
      setAlertHeader("Advertisement And Committee Request Decision Successful");
      setAlertBody(
        "Your decision on advertisement and committee request is successfully registered!",
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
              <Title order={2}>
                Approval Of Advertisement And Selection Committee
              </Title>
              <Group position="left" style={{ marginTop: "20px" }}>
                <Button
                  color="green"
                  style={{ borderRadius: "8px" }}
                  size="xs"
                  onClick={() => handleStaffDecision("approve")}
                >
                  <ThumbsUp size={26} style={{ marginRight: "3px" }} />
                  {staffData.approval === "HoD Forward" ? "Forward" : "Approve"}
                </Button>
                <Button
                  color="red"
                  style={{ borderRadius: "8px" }}
                  onClick={() => handleStaffDecision("reject")}
                  size="xs"
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
                  <span style={{ color: "#A0A0A0" }}>Sponsor Agency:</span>{" "}
                  {staffData.sponsor_agency}
                </Text>
              </GridCol>

              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>
                    Project Sanction Date:
                  </span>{" "}
                  {new Date(staffData.sanction_date).toLocaleDateString()}
                </Text>
              </GridCol>
              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>Project Start Date:</span>{" "}
                  {new Date(staffData.project_start_date).toLocaleDateString()}
                </Text>
              </GridCol>
              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>Project duration:</span>{" "}
                  {staffData.duration_project} months
                </Text>
              </GridCol>

              {/* -------------- */}
              <Grid.Col span={12}>
                <Divider my="sm" label="" labelPosition="center" size="sm" />
              </Grid.Col>
              <GridCol span={12}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>
                    Availability Of Sufficient Funds To Accomodate The Required
                    Manpower:
                  </span>{" "}
                  {staffData.has_funds}
                </Text>
              </GridCol>

              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>
                    Rank Of Position Advertised:
                  </span>{" "}
                  {staffData.type}
                </Text>
              </GridCol>
              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>
                    Consolidated Salary + Housing Rent Allowance:
                  </span>{" "}
                  ₹{staffData.salary}
                </Text>
              </GridCol>
              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>
                    Appointment Duration:
                  </span>{" "}
                  {staffData.duration} months
                </Text>
              </GridCol>
              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>
                    Eligibility Criteria:
                  </span>{" "}
                  {staffData.eligibility}
                </Text>
              </GridCol>

              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>
                    Last Date Of Applying:
                  </span>{" "}
                  {new Date(staffData.submission_date).toLocaleDateString()}
                </Text>
              </GridCol>
              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>
                    Date Of Written Test:
                  </span>{" "}
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
                  <span style={{ color: "#A0A0A0" }}>
                    Mode Of Written Test:
                  </span>{" "}
                  {staffData.test_mode}
                </Text>
              </GridCol>
              <GridCol span={6}>
                <Text>
                  <span style={{ color: "#A0A0A0" }}>Interview Location:</span>{" "}
                  {staffData.interview_place}
                </Text>
              </GridCol>

              <GridCol span={12}>
                <Group position="apart" align="center">
                  <Text style={{ color: "#A0A0A0" }}>
                    Signed Advertisement To Be Uploaded On Institute Website:
                  </Text>
                  {staffData.post_on_website && (
                    <Button
                      variant="outline"
                      color="#15ABFF"
                      size="xs"
                      className={classes.fileInputButton}
                      style={{ borderRadius: "8px" }}
                      component="a"
                      href={`${host}/${staffData.post_on_website}`} // Directly access the file URL
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText size={26} style={{ marginRight: "3px" }} />
                      Open Advertisement
                    </Button>
                  )}
                </Group>
              </GridCol>

              {/* -------------- */}
              <Grid.Col span={12}>
                <Divider my="sm" label="" labelPosition="center" size="sm" />
              </Grid.Col>

              <Grid.Col span={12}>
                <Title
                  order={4}
                  style={{ textAlign: "center", color: "#A0A0A0" }}
                >
                  Selection Committee Members
                </Title>

                <Text>
                  <span style={{ color: "#A0A0A0" }}>
                    PI (Convener of the Committee):
                  </span>{" "}
                  {staffData.pi_name}
                </Text>
                {Object.entries(staffData.selection_committee).map(
                  ([role, name], index) => (
                    <Text key={index}>
                      <span style={{ color: "#A0A0A0" }}>{role}:</span>{" "}
                      {Array.isArray(name) ? name.join(", ") : name}
                    </Text>
                  ),
                )}
              </Grid.Col>
            </Grid>
          </>
        ) : (
          <Text color="red" align="center">
            Failed to load advertisement and committee details
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

AdvertisementAndCommitteeApprovalModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  staffData: PropTypes.shape({
    sid: PropTypes.number,
    pid: PropTypes.number,
    project_title: PropTypes.string,
    sponsor_agency: PropTypes.string,
    duration_project: PropTypes.number,
    selection_committee: PropTypes.arrayOf(PropTypes.string),
    test_date: PropTypes.string,
    submission_date: PropTypes.string,
    test_mode: PropTypes.string,
    duration: PropTypes.number,
    pi_name: PropTypes.string,
    approval: PropTypes.string,
    eligibility: PropTypes.string,
    type: PropTypes.string,
    sanction_date: PropTypes.string,
    start_date: PropTypes.string,
    project_start_date: PropTypes.string,
    interview_date: PropTypes.string,
    interview_place: PropTypes.string,
    salary: PropTypes.number,
    has_funds: PropTypes.string,
    post_on_website: PropTypes.string,
  }).isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default AdvertisementAndCommitteeApprovalModal;

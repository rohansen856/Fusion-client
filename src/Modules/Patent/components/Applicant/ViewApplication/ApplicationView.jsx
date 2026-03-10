import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Text,
  Box,
  Grid,
  Container,
  Stepper,
  Badge,
  Loader,
  Title,
  Divider,
} from "@mantine/core";
import {
  CalendarCheck,
  User,
  FileText,
  Hourglass,
  Key,
  ArrowLeft,
  DownloadSimple,
  CheckCircle,
  CircleNotch,
  ArrowRight,
} from "phosphor-react";
import PropTypes from "prop-types";
import axios from "axios";
import "../../../style/Applicant/ApplicationView.css";
import { host } from "../../../../../routes/globalRoutes/index.jsx";

// Define API_BASE_URL
const API_BASE_URL = `${host}/patentsystem`;

// Progress Bar Component
function PatentProgressBar({ currentStatus, isMobile }) {
  const allStatuses = [
    "Submitted",
    "Reviewed by PCC Admin",
    "Attorney Assigned",
    "Forwarded for Director's Review",
    "Director's Approval Received",
    "Patentability Check Started",
    "Patentability Check Completed",
    "Patentability Search Report Generated",
    "Patent Filed",
    "Patent Published",
    "Patent Granted",
    "Patent Refused",
  ];

  const getStepIndex = (status) => {
    if (status === "Rejected") return -1;
    return allStatuses.findIndex((s) => s === status);
  };

  const currentStep = getStepIndex(currentStatus);
  const isRejected = currentStatus === "Rejected";
  const isRefused = currentStatus === "Patent Refused";
  const isGranted = currentStatus === "Patent Granted";

  // Determine which statuses to display based on current status
  let displayStatuses;
  if (isRefused) {
    displayStatuses = ["Submitted", "Patent Refused"];
  } else if (isGranted) {
    // Show only the first 11 stages without "Patent Refused" for granted patents
    displayStatuses = allStatuses.slice(0, 11);
  } else {
    displayStatuses = allStatuses;
  }

  return (
    <div id={`pms-progress-container ${isRejected ? "rejected" : ""}`}>
      {isRejected && (
        <Text color="red" size="lg" weight={600} id="pms-rejection-label">
          Application Rejected
        </Text>
      )}

      {!isMobile ? (
        // Desktop view
        <div id="pms-desktop-stepper">
          {isRefused ? (
            // Simple two-step progress for refused patents
            <Stepper
              active={1}
              id="pms-workflow-stepper"
              size="md"
              color="red"
              orientation="horizontal"
              iconSize={24}
              breakpoint="sm"
            >
              <Stepper.Step
                key="Submitted"
                icon={<CheckCircle size={18} />}
                label="Stage 1"
                description="Submitted"
                id="pms-completed-step"
              />
              <Stepper.Step
                key="Patent Refused"
                icon={<CircleNotch size={18} />}
                label="Stage 2"
                description="Patent Refused"
                id="pms-completed-step"
              />
            </Stepper>
          ) : (
            // Regular view with two rows for normal flow
            <>
              <Stepper
                active={isGranted ? 4 : currentStep}
                id="pms-workflow-stepper"
                size="md"
                color={isRejected ? "red" : "blue"}
                orientation="horizontal"
                iconSize={24}
                breakpoint="sm"
              >
                {displayStatuses.slice(0, 4).map((status, index) => (
                  <Stepper.Step
                    key={status}
                    icon={
                      isGranted || index < currentStep ? (
                        <CheckCircle size={18} />
                      ) : index === currentStep ? (
                        <CircleNotch size={18} />
                      ) : (
                        <ArrowRight size={18} />
                      )
                    }
                    label={`Stage ${index + 1}`}
                    description={status}
                    id={
                      isGranted || index <= currentStep
                        ? "pms-completed-step"
                        : "pms-pending-step"
                    }
                  />
                ))}
              </Stepper>
              <Stepper
                active={isGranted ? 7 : Math.max(0, currentStep - 4)} // All steps active if granted
                id="pms-workflow-stepper second-row"
                size="md"
                color={isRejected ? "red" : "blue"}
                orientation="horizontal"
                iconSize={24}
                breakpoint="sm"
              >
                {displayStatuses.slice(4).map((status, index) => (
                  <Stepper.Step
                    key={status}
                    icon={
                      isGranted || index + 4 < currentStep ? (
                        <CheckCircle size={18} />
                      ) : index + 4 === currentStep ? (
                        <CircleNotch size={18} />
                      ) : (
                        <ArrowRight size={18} />
                      )
                    }
                    label={`Stage ${index + 5}`}
                    description={status}
                    id={
                      isGranted || index + 4 <= currentStep
                        ? "pms-completed-step"
                        : "pms-pending-step"
                    }
                  />
                ))}
              </Stepper>
            </>
          )}
        </div>
      ) : (
        // Mobile view - vertical stepper
        <Stepper
          active={
            isRefused ? 1 : isGranted ? displayStatuses.length - 1 : currentStep
          }
          id="pms-workflow-stepper mobile-view"
          size="sm"
          color={isRefused ? "red" : isRejected ? "red" : "blue"}
          orientation="vertical"
          iconSize={16}
        >
          {displayStatuses.map((status, index) => (
            <Stepper.Step
              key={status}
              icon={
                isGranted || index < (isRefused ? 1 : currentStep) ? (
                  <CheckCircle size={16} />
                ) : index === (isRefused ? 1 : currentStep) ? (
                  <CircleNotch size={16} />
                ) : (
                  <ArrowRight size={16} />
                )
              }
              label={`Stage ${index + 1}`}
              description={status}
              id={
                isGranted || index <= (isRefused ? 1 : currentStep)
                  ? "completed-step"
                  : "pending-step"
              }
            />
          ))}
        </Stepper>
      )}
    </div>
  );
}

PatentProgressBar.propTypes = {
  currentStatus: PropTypes.string.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

// Application Card Component
function ApplicationCard({
  title,
  date,
  tokenNumber,
  applicationNumber,
  attorney,
  status,
  onViewApplication,
}) {
  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case "Submitted":
        return "blue";
      case "Rejected":
        return "red";
      case "Director's Approval Received":
      case "Patent Filed":
        return "green";
      case "Attorney Assigned":
      case "Forwarded for Director's Review":
      case "Patentability Search Report Generated":
        return "orange";
      default: // Handles "Draft" and any unknown statuses
        return "gray";
    }
  };
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Not available";

  return (
    <Card id="pms-application-card" shadow="sm" p="lg" radius="md" withBorder>
      <Text id="pms-app-card-title" weight={700} size="lg" mb="md">
        {title}
      </Text>

      <div id="pms-app-card-info">
        <div id="pms-info-item">
          <CalendarCheck size={18} />
          <Text id="pms-info-text">{formattedDate}</Text>
        </div>

        <div id="pms-info-item">
          <FileText size={18} />
          <Text id="pms-info-text">Application #{applicationNumber}</Text>
        </div>

        {tokenNumber ? (
          <div id="pms-info-item">
            <Key size={18} />
            <Text id="pms-info-text">Tracking Token: {tokenNumber}</Text>
          </div>
        ) : (
          <div id="pms-info-item">
            <Hourglass size={18} />
            <Text id="pms-info-text">Token: Awaiting assignment</Text>
          </div>
        )}

        <div id="pms-info-item">
          <User size={18} />
          <Text id="pms-info-text">{attorney || "No Attorney Assigned"}</Text>
        </div>

        <div id="pms-card-badge-container">
          <Badge color={getStatusColor(status)} size="lg">
            {status}
          </Badge>
        </div>
      </div>

      <Button
        variant="filled"
        color="blue"
        fullWidth
        mt="md"
        onClick={() => onViewApplication(applicationNumber)}
        id="pms-view-application-button"
      >
        View Details
      </Button>
    </Card>
  );
}

ApplicationCard.propTypes = {
  title: PropTypes.string.isRequired,
  date: PropTypes.string,
  tokenNumber: PropTypes.string,
  applicationNumber: PropTypes.string.isRequired,
  attorney: PropTypes.string,
  status: PropTypes.string.isRequired,
  onViewApplication: PropTypes.func.isRequired,
};

function ConditionalFileDownload({ filePath, label, value }) {
  const encodedFilePath = filePath ? encodeURI(filePath) : null;
  const fileUrl = encodedFilePath ? `${API_BASE_URL}${encodedFilePath}` : null;

  return (
    <div id="pms-form-field-with-download">
      <div id="pms-field-label-container">
        <Text id="pms-field-label">{label}</Text>
        <Text id="pms-field-value">{value || "Not provided"}</Text>
      </div>
      {fileUrl ? (
        <div id="pms-download-button-wrapper">
          <Button
            component="a"
            href={fileUrl}
            download
            variant="outline"
            color="blue"
            leftIcon={<DownloadSimple size={18} />}
          >
            Download {label.replace(":", "")}
          </Button>
        </div>
      ) : (
        <Text color="red" size="sm">
          Not submitted
        </Text>
      )}
    </div>
  );
}

ConditionalFileDownload.propTypes = {
  filePath: PropTypes.string,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

// File Download Button Component
function FileDownloadButton({ fileUrl, label, disabled }) {
  if (!fileUrl || fileUrl === "null" || disabled) {
    return (
      <Button
        variant="outline"
        color="gray"
        leftIcon={<DownloadSimple size={18} />}
        disabled
      >
        No {label} Available
      </Button>
    );
  }

  return (
    <Button
      component="a"
      href={fileUrl}
      download
      variant="outline"
      color="blue"
      leftIcon={<DownloadSimple size={18} />}
    >
      Download {label}
    </Button>
  );
}

FileDownloadButton.propTypes = {
  fileUrl: PropTypes.string,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

function FormField({ label, value }) {
  const isMobile = window.innerWidth <= 768;

  return (
    <div
      className={`pms-form-field-label-and-value ${isMobile ? "pms-mobile-form-field" : ""}`}
      style={{ padding: "10px" }}
    >
      <Text
        className={`pms-form-field-label ${isMobile ? "pms-mobile-field-label" : ""}`}
      >
        {label}
      </Text>
      <Text
        className={`pms-form-field-value ${isMobile ? "pms-mobile-field-value" : ""}`}
      >
        {value?.trim() ? value : "Not provided"}
      </Text>
    </div>
  );
}

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// Field with download button - moved outside of the render function
function FormFieldWithDownload({ label, value, fileUrl, fileLabel }) {
  return (
    <div className="pms-form-field-with-download">
      <div className="pms-form-field-label-and-value">
        <Text className="pms-form-field-label">{label}</Text>
        <Text className="pms-form-field-value">{value || "Not provided"}</Text>
      </div>
      <div id="pms-download-button-wrapper">
        <FileDownloadButton
          fileUrl={fileUrl}
          label={fileLabel}
          disabled={!fileUrl || fileUrl === "null"}
        />
      </div>
    </div>
  );
}

FormFieldWithDownload.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fileUrl: PropTypes.string,
  fileLabel: PropTypes.string.isRequired,
};

// Section component for detail view - moved outside of the render function
function FormSection({ title, children }) {
  return (
    <Card
      id={`pms-detail-section ${
        window.innerWidth <= 768 ? "mobile-form-section" : ""
      }`}
      radius="md"
      withBorder
      mb="md"
      p={40}
      style={{
        borderRadius: "20px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Title className="pms-form-section-title" style={{ marginLeft: "-10px" }}>
        {title}
      </Title>
      {children}
    </Card>
  );
}

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// Main Application View Component
function ApplicationView({ setActiveTab }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [isMobile, setIsMobile] = useState(false);

  // Retrieve authToken from local storage
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!authToken) {
        setError("Authorization token is missing. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(
          `${API_BASE_URL}/applicant/applications/`,
          {
            headers: {
              Authorization: `Token ${authToken}`,
            },
          },
        );

        if (
          response.data &&
          response.data.applications &&
          Array.isArray(response.data.applications)
        ) {
          const formattedApplications = response.data.applications.map(
            (application) => ({
              title: application.title || "Untitled Application",
              date: application.submitted_date || "",
              tokenNumber: application.token_no || null,
              applicationNumber: application.application_id,
              attorney: application.attorney_name || null,
              status: application.status || "Pending",
            }),
          );

          setApplications(formattedApplications);
        } else {
          setError("No applications found or invalid response format");
        }
      } catch (err) {
        console.error("Error fetching application data:", err);
        setError("Failed to load application data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [authToken]);

  const handleViewApplication = async (applicationNumber) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/applicant/applications/details/${applicationNumber}`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );

      if (response.data) {
        setSelectedApplication(response.data);
        setViewMode("detail");
        localStorage.setItem("selectedApplicationId", applicationNumber);
      }
    } catch (err) {
      console.error("Error fetching application details:", err);
      setError("Failed to load application details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedApplication(null);
  };

  // Render application list view with improved loading and error states
  const renderApplicationList = () => (
    // Replace the Grid component with this structure:
    <Box id="pms-applications-container">
      <Text id="pms-view-app-page-title">Your Patent Applications</Text>

      {loading ? (
        <div id="pms-loader-container">
          <Loader size="lg" color="blue" />
          <Text mt="md">Loading your applications...</Text>
        </div>
      ) : error ? (
        <Card id="pms-empty-state-card" p="xl" radius="md" withBorder>
          <Text style={{ fontSize: "22px", fontWeight: 500 }}>
            Unable to Load Applications
          </Text>
          <Divider
            w="100%"
            style={{ margin: "0 0", border: "0.5px solid rgb(215, 215, 215)" }}
          />
          <Text size="sm" color="dimmed" mt="sm">
            We encountered an issue while loading your applications. Please try
            again.
          </Text>
          <Button
            mt="lg"
            color="blue"
            onClick={() => window.location.reload()}
            fullWidth
          >
            Try Again
          </Button>
        </Card>
      ) : applications.length === 0 ? (
        <Card id="pms-empty-state-card" p="xl" radius="md" withBorder>
          <Text size="lg" align="center" weight={500}>
            No Applications Found
          </Text>
          <Text size="sm" color="dimmed" align="center" mt="sm">
            You haven't submitted any patent applications yet.
          </Text>
          <Button
            mt="lg"
            color="blue"
            onClick={() => setActiveTab("newApplication")}
            fullWidth
          >
            Start New Application
          </Button>
        </Card>
      ) : (
        <div id="pms-view-applications-grid">
          {applications.map((app, index) => (
            <ApplicationCard
              key={index}
              title={app.title}
              date={app.date}
              tokenNumber={app.tokenNumber}
              applicationNumber={app.applicationNumber}
              attorney={app.attorney}
              status={app.status}
              onViewApplication={handleViewApplication}
            />
          ))}
        </div>
      )}
    </Box>
  );

  // Render application detail view with enhanced UI
  const renderApplicationDetail = () => {
    if (!selectedApplication) return null;

    const {
      application_id,
      title,
      token_no,
      attorney_name,
      status,
      decision_status,
      comments,
      applicants,
      section_I,
      section_II,
      section_III,
      dates,
    } = selectedApplication;

    const submittedDate = dates?.submitted_date
      ? new Date(dates.submitted_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not recorded";

    // Build file URLs
    const pocFileUrl = section_I?.poc_file
      ? `${API_BASE_URL}/download/file/${section_I.poc_file}/`
      : null;
    const sourceAgreementFileUrl = section_II?.source_agreement_file
      ? `${API_BASE_URL}/download/file/${section_II.source_agreement_file}/`
      : null;
    const mouFileUrl = section_II?.mou_file
      ? `${API_BASE_URL}/download/file/${section_II.mou_file}/`
      : null;
    const formIIIFileUrl = section_III?.form_iii
      ? `${API_BASE_URL}/download/file/${section_III.form_iii}/`
      : null;

    return (
      <Container
        id={`pms-detail-container ${
          isMobile ? "pms-mobile-form-container" : ""
        }`}
        size="100%"
        style={{ maxWidth: "100%", padding: "2rem" }}
      >
        <div id="pms-application-view-detail-header">
          <Button
            onClick={handleBackToList}
            leftIcon={<ArrowLeft size={18} />}
            id="pms-application-view-back-button"
          >
            Back
          </Button>
          <Text id="pms-application-view-page-title">
            Application ID : {application_id}
          </Text>
          <Button
            component="a"
            href={`${API_BASE_URL}/download/${application_id}/`}
            target="_blank"
            download={`Application-${application_id}.pdf`}
            id="pms-application-view-download-button"
            rightIcon={<DownloadSimple size={18} />}
          >
            Download
          </Button>
        </div>

        <div>
          <FormSection
            title="Application Overview"
            id="pms-application-view-form-section"
          >
            <Grid>
              <Grid.Col span={12} md={4} className="pms-form-field-container">
                <FormField label="Title of Application:" value={title} />
              </Grid.Col>

              <Grid.Col span={12} md={4} className="pms-form-field-container">
                <FormField label="Submission Date:" value={submittedDate} />
              </Grid.Col>
              <Grid.Col span={12} md={4} className="pms-form-field-container">
                <FormField label="Token Number:" value={token_no} />
              </Grid.Col>
              <Grid.Col span={12} md={4} className="pms-form-field-container">
                <FormField label="Attorney:" value={attorney_name} />
              </Grid.Col>
              <Grid.Col span={12} md={4} className="pms-form-field-container">
                <FormField label="Status:" value={status} />
              </Grid.Col>
              <Grid.Col span={12} md={4} className="pms-form-field-container">
                <FormField label="Decision Status:" value={decision_status} />
              </Grid.Col>
              <Grid.Col span={12} className="pms-form-field-container">
                <FormField label="Comments:" value={comments} />
              </Grid.Col>
            </Grid>
          </FormSection>

          <FormSection title="Key Dates">
            <div id="pms-key-dates-container">
              <div id="pms-key-dates-grid">
                {/* <div id="pms-key-date-card">
                <div id="pms-key-date-title">Reviewed by PCC</div>
                <div id="pms-key-date-value">
                  {dates?.reviewed_by_pcc_date
                    ? new Date(dates.reviewed_by_pcc_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "Not yet reviewed"}
                </div>
              </div> */}

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">Forwarded to Director</div>
                  <div id="pms-key-date-value">
                    {dates?.forwarded_to_director_date
                      ? new Date(
                          dates.forwarded_to_director_date,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not yet forwarded"}
                  </div>
                </div>

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">Director Approval</div>
                  <div id="pms-key-date-value">
                    {dates?.director_approval_date
                      ? new Date(
                          dates.director_approval_date,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not yet approved"}
                  </div>
                </div>

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">Patentability Check Start</div>
                  <div id="pms-key-date-value">
                    {dates?.patentability_check_start_date
                      ? new Date(
                          dates.patentability_check_start_date,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not started"}
                  </div>
                </div>

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">
                    Patentability Check Completed
                  </div>
                  <div id="pms-key-date-value">
                    {dates?.patentability_check_completed_date
                      ? new Date(
                          dates.patentability_check_completed_date,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not completed"}
                  </div>
                </div>

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">Search Report Generated</div>
                  <div id="pms-key-date-value">
                    {dates?.search_report_generated_date
                      ? new Date(
                          dates.search_report_generated_date,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not generated"}
                  </div>
                </div>

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">Date of Filing</div>
                  <div id="pms-key-date-value">
                    {dates?.patent_filed_date
                      ? new Date(dates.patent_filed_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )
                      : "Not recorded"}
                  </div>
                </div>

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title">Date of Publication</div>
                  <div id="pms-key-date-value">
                    {dates?.patent_published_date
                      ? new Date(
                          dates.patent_published_date,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not yet published"}
                  </div>
                </div>

                {/* <div id="pms-key-date-card">
                <div id="pms-key-date-title">Decision Date</div>
                <div id="pms-key-date-value">
                  {dates?.decision_date
                    ? new Date(dates.decision_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )
                    : "No decision yet"}
                  </div>
              </div> */}

                <div id="pms-key-date-card">
                  <div id="pms-key-date-title"> Date of Granting</div>
                  <div id="pms-key-date-value">
                    {dates?.final_decision_date
                      ? new Date(dates.final_decision_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )
                      : "No final decision yet"}
                  </div>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Section I: Administrative and Technical Details">
            <Grid>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Area of the invention:"
                  value={section_I?.area}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Problem in the area:"
                  value={section_I?.problem}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Objective of your invention:"
                  value={section_I?.objective}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField label="Novelty:" value={section_I?.novelty} />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField label="Advantages:" value={section_I?.advantages} />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Tested:"
                  value={
                    section_I?.is_tested === true
                      ? "Yes"
                      : section_I?.is_tested === false
                        ? "No"
                        : ""
                  }
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormFieldWithDownload
                  label="POC Details:"
                  value={section_I?.poc_details}
                  fileUrl={pocFileUrl}
                  fileLabel="POC File"
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Applications:"
                  value={section_I?.applications}
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          <FormSection title="Section II: IPR Ownership">
            <Grid>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Funding Details:"
                  value={section_II?.funding_details}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Funding Source:"
                  value={section_II?.funding_source}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormFieldWithDownload
                  label="Source Agreement:"
                  value={section_II?.source_agreement}
                  fileUrl={sourceAgreementFileUrl}
                  fileLabel="Source Agreement"
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Publication Details:"
                  value={section_II?.publication_details}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormFieldWithDownload
                  label="MOU Details:"
                  value={section_II?.mou_details}
                  fileUrl={mouFileUrl}
                  fileLabel="MOU File"
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Research Details:"
                  value={section_II?.research_details}
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          <FormSection title="Section III: Commercialization">
            <Grid>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Company Name:"
                  value={section_III?.company_name}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Contact Person:"
                  value={section_III?.contact_person}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormField
                  label="Contact Number:"
                  value={section_III?.contact_no}
                />
              </Grid.Col>
              <Grid.Col span={12} md={6} className="pms-form-field-container">
                <FormFieldWithDownload
                  label="Development Stage:"
                  value={section_III?.development_stage}
                  fileUrl={formIIIFileUrl}
                  fileLabel="Form III"
                />
              </Grid.Col>
            </Grid>
          </FormSection>

          <FormSection title="Inventor">
            {applicants && applicants.length > 0 ? (
              <div id="pms-inventors-container">
                {applicants.map((applicant, index) => (
                  <Card
                    key={index}
                    id="pms-inventor-card"
                    p="md"
                    radius="sm"
                    withBorder
                  >
                    <Text weight={600} size="lg" mb="xs" align="center">
                      Inventor {index + 1}
                    </Text>
                    <div id="pms-inventor-details">
                      <FormField
                        className="pms-form-field-container"
                        label="Name:"
                        value={applicant.name}
                      />
                      <FormField
                        className="pms-form-field-container"
                        label="Email:"
                        value={applicant.email}
                      />
                      <FormField
                        className="pms-form-field-container"
                        label="Mobile:"
                        value={applicant.mobile}
                      />
                      <FormField
                        className="pms-form-field-container"
                        label="Address:"
                        value={applicant.address}
                      />
                      <FormField
                        label="Share Percentage:"
                        value={
                          applicant.percentage_share
                            ? `${applicant.percentage_share}%`
                            : ""
                        }
                      />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Text color="dimmed">No inventor information available</Text>
            )}
          </FormSection>

          <FormSection title="Application Progress">
            <PatentProgressBar currentStatus={status} isMobile={isMobile} />
          </FormSection>
        </div>
      </Container>
    );
  };

  return (
    <Box id="pms-application-view-container">
      {viewMode === "list"
        ? renderApplicationList()
        : renderApplicationDetail()}
    </Box>
  );
}

ApplicationView.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
};

export default ApplicationView;

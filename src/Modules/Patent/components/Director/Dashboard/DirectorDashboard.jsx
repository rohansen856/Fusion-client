import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Grid, Box, Text, Divider, Button, Paper } from "@mantine/core";
import {
  ClipboardText,
  CheckCircle,
  Eye,
  Clock,
  ChartBar,
  Buildings,
  Bell,
} from "@phosphor-icons/react";
import DownloadsSection from "./DirectorDownloads";
import InsightsPage from "./DirectorInsights";
import "../../../style/Director/DirectorDashboard.css";

const TabKeys = {
  NEW_APPLICATIONS: "1",
  REVIEWED_APPLICATIONS: "2",
  NOTIFICATIONS: "3",
};

function DirectorDashboard({ setActiveTab }) {
  useEffect(() => {
    const handleResize = () => {
      // Window resize listener for future responsive features
    };

    handleResize(); // Check on initial render
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const featuresData = [
    {
      icon: <Eye size={28} id="pms-director-dashboard-feature-icon" />,
      title: "Application Management and Review",
      description:
        "Track and review patent applications, view submission details, and monitor status updates.",
    },
    {
      icon: <Clock size={28} id="pms-director-dashboard-feature-icon" />,
      title: "Transparent Record-Keeping and Status Visibility",
      description:
        "Real-time status updates, detailed history tracking, and archive functionality.",
    },
    {
      icon: <ChartBar size={28} id="pms-director-dashboard-feature-icon" />,
      title: "Dashboard Analytics and Insights",
      description:
        "Analyze application volume, performance metrics, and trends to support data-driven decisions.",
    },
  ];

  return (
    <div id="pms-director-dashboard-container">
      <Text id="pms-director-dashboard-title">
        Patent & Copyright Management Dashboard
      </Text>
      <Box align="center">
        <Paper
          shadow="md"
          radius="lg"
          id="pms-director-dashboard-combined-section"
          align="left"
        >
          <Text id="pms-director-dashboard-overview-title" ml={10}>
            Patent Management System (PMS)
            <Buildings size={24} id="pms-director-overview-icon" />
          </Text>
          <Text id="pms-director-dashboard-overview-text" m={10} mb={30}>
            The Patent Management System at IIITDM Jabalpur focuses on fostering
            research and development activities, particularly in IT-enabled
            design and manufacturing, as well as the design of IT systems.
          </Text>

          <Box id="pms-director-dashboard-feature-box-container">
            <Grid>
              {featuresData.map((feature, index) => (
                <Grid.Col span={12} key={index}>
                  <Box id="pms-director-dashboard-feature-box-with-hover">
                    <div id="pms-director-dashboard-feature-icon">
                      {feature.icon}
                    </div>
                    <Text>
                      <span id="pms-director-dashboard-feature-box-title">
                        <b>{feature.title}</b>:{" "}
                      </span>
                      {feature.description}
                    </Text>
                  </Box>
                </Grid.Col>
              ))}
            </Grid>
          </Box>

          <Divider my="xl" id="pms-dashboard-divider" />

          <DownloadsSection />

          <Divider my="xl" id="pms-dashboard-divider" />

          <div style={{ marginLeft: "12px", marginRight: "12px" }}>
            <InsightsPage />
          </div>
        </Paper>
        <Grid mt="xl" id="pms-director-dashboard-grid">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Box id="pms-director-dashboard-cards">
              <Text id="pms-director-dashboard-card-title">
                <ClipboardText size={20} id="pms-director-dashboard-icon" /> New
                Applications
              </Text>
              <Divider id="pms-director-dashboard-card-divider" />
              <Text size="sm" mt="sm">
                View all applications forwarded by PCC Admin for your review.
                okay
              </Text>
              <Button
                variant="outline"
                fullWidth
                mt="md"
                size="sm"
                onClick={() => setActiveTab(TabKeys.NEW_APPLICATIONS)}
                id="pms-director-dashboard-button"
              >
                View Submitted Applications
              </Button>
            </Box>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Box id="pms-director-dashboard-cards">
              <Text id="pms-director-dashboard-card-title">
                <CheckCircle size={20} id="pms-director-dashboard-icon" />{" "}
                Reviewed Applications
              </Text>
              <Divider id="pms-director-dashboard-card-divider" />
              <Text size="sm" mt="sm">
                Access applications that have been reviewed.
              </Text>
              <Button
                variant="outline"
                fullWidth
                mt="md"
                size="sm"
                onClick={() => setActiveTab(TabKeys.REVIEWED_APPLICATIONS)}
                id="pms-director-dashboard-button"
              >
                View Reviewed Applications
              </Button>
            </Box>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Box id="pms-director-dashboard-cards">
              <Text id="pms-director-dashboard-card-title">
                <Bell size={20} id="pms-director-dashboard-icon" />{" "}
                Notifications
              </Text>
              <Divider id="pms-director-dashboard-card-divider" />
              <Text size="sm" mt="sm">
                Stay updated with the latest notifications regarding your patent
                applications.
              </Text>
              <Button
                variant="outline"
                fullWidth
                mt="md"
                size="sm"
                onClick={() => setActiveTab(TabKeys.NOTIFICATIONS)}
                id="pms-director-dashboard-button"
              >
                View Notifications
              </Button>
            </Box>
          </Grid.Col>
        </Grid>
      </Box>
    </div>
  );
}

DirectorDashboard.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
};

export default DirectorDashboard;

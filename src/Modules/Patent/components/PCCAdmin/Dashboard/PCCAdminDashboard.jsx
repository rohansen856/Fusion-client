import React from "react";
import PropTypes from "prop-types";
import { Grid, Box, Text, Divider, Button, Paper } from "@mantine/core";
import {
  Eye,
  List,
  Briefcase,
  ArrowCircleDown,
  Buildings,
} from "@phosphor-icons/react";

import DownloadsPage from "./DownloadsPage";
import "../../../style/Pcc_Admin/PCCAdminDashboard.css";
import InsightsPage from "./InsightsPage";

function PCCAdminDashboard({ setActiveTab }) {
  const renderDashboardCard = (icon, title, description, tabId) => (
    <Box id="pms-pcc-dashboard-cards">
      <Text id="pms-dashboard-card-title">
        {icon} {title}
      </Text>
      <Divider id="pms-card-divider" />
      <Text size="sm" mt="sm">
        {description}
      </Text>
      <Button
        variant="outline"
        fullWidth
        mt="md"
        size="sm"
        onClick={() => setActiveTab(tabId)}
      >
        {title}
      </Button>
    </Box>
  );

  return (
    <Box>
      {/* Page Title */}
      <Text id="pms-pcc-dashboard-title">
        Patent & Copyright Cell Dashboard
      </Text>

      {/* Combined Overview and Insights Section */}
      <Paper
        id="pms-pcc-combined-section"
        style={{ marginLeft: "50px", marginRight: "50px" }}
      >
        {/* Overview Section */}
        <Box id="pms-pcc-overview-section">
          <Text id="pms-pcc-overview-title">
            Patent Management System (PMS)
            <Buildings size={24} id="pms-pcc-overview-icon" />
          </Text>
          <Text id="pms-pcc-overview-text">
            The Patent Management System at IIITDM Jabalpur focuses on fostering
            research and development activities, particularly in IT-enabled
            design and manufacturing, as well as the design of IT systems. Here,
            you can manage applications, track their status, access important
            resources and view insights.
          </Text>
        </Box>

        <Divider my="xl" id="pms-dashboard-card-divider" />

        {/* Insights Section */}
        <Box id="pms-pcc-insights-section">
          <InsightsPage />
        </Box>

        <Divider my="xl" id="pms-dashboard-card-divider" />

        {/* Downloads Section */}
        <DownloadsPage />
      </Paper>

      {/* Dashboard Cards Section */}
      <Grid mt="xl" id="pms-pcc-dashboard-grid">
        {/* New Applications Card */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          {renderDashboardCard(
            <Eye size={20} id="pms-pcc-icon" />,
            "New Applications",
            "Review and provide feedback on the latest applications.",
            "1",
          )}
        </Grid.Col>

        {/* Ongoing Applications Card */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          {renderDashboardCard(
            <List size={20} id="pms-pcc-icon" />,
            "Ongoing Applications",
            "Track the current status of all the ongoing applications.",
            "2",
          )}
        </Grid.Col>

        {/* Past Applications Card */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          {renderDashboardCard(
            <Briefcase size={20} id="pms-pcc-icon" />,
            "Past Applications",
            "Track record of all the filed and reeted applications.",
            "3",
          )}
        </Grid.Col>

        {/* Manage Attorney Details Card */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          {renderDashboardCard(
            <Briefcase size={20} id="pms-pcc-icon" />,
            "Manage Attorney Details",
            "Manage and update attorney information.",
            "4",
          )}
        </Grid.Col>

        {/* Notifications Card */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          {renderDashboardCard(
            <ArrowCircleDown size={20} id="pms-pcc-icon" />,
            "Notifications",
            "Get notifications regarding status updates and other important information.",
            "5",
          )}
        </Grid.Col>
      </Grid>
    </Box>
  );
}

PCCAdminDashboard.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
};

export default PCCAdminDashboard;

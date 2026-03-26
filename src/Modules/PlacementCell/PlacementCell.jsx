import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";

import React, { useState, useRef } from "react";
import { Tabs, Button, Container } from "@mantine/core";
import { useSelector } from "react-redux";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import PlacementRecordsTable from "./components/PlacementRecordsTable";
import PlacementCalendar from "./components/PlacementCalendar";
import PlacementSchedule from "./components/PlacementSchedule";
import SendNotificationForm from "./components/SendNotificationForm";
import DownloadCV from "./components/DownloadCV";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import CompanyRegistrationForm from "./components/CompanyRegistrationForm";
import FieldsForm from "./components/FieldsForm";
import DebarredStudents from "./components/DebarredStudents";
import RestrictionsTab from "./components/RestrictionsTab";

const studentTabs = [
  {
    value: "schedule",
    label: "Placement Schedule",
    component: <PlacementSchedule />,
  },
  {
    value: "stats",
    label: "Placement Stats",
    component: <PlacementRecordsTable />,
  },
  { value: "download-cv", label: "Download CV", component: <DownloadCV /> },
  {
    value: "placement-calendar",
    label: "Placement Calendar",
    component: <PlacementCalendar />,
  },
];

const defaultTabs = [
  {
    value: "schedule",
    label: "Placement Schedule",
    component: <PlacementSchedule />,
  },
  {
    value: "stats",
    label: "Placement Stats",
    component: <PlacementRecordsTable />,
  },
  {
    value: "placement-calendar",
    label: "Placement Calendar",
    component: <PlacementCalendar />,
  },
];

const chairmanTabs = [
  {
    value: "schedule",
    label: "Placement Schedule",
    component: <PlacementSchedule />,
  },
  {
    value: "stats",
    label: "Placement Stats",
    component: <PlacementRecordsTable />,
  },
  {
    value: "placement-calendar",
    label: "Placement Calendar",
    component: <PlacementCalendar />,
  },
  {
    value: "debarred-students",
    label: "Debarred Students",
    component: <DebarredStudents />,
  },
];

const tpoTabs = [
  {
    value: "schedule",
    label: "Placement Schedule",
    component: <PlacementSchedule />,
  },
  {
    value: "send-notifications",
    label: "Send Notifications",
    component: <SendNotificationForm />,
  },
  {
    value: "stats",
    label: "Placement Stats",
    component: <PlacementRecordsTable />,
  },
  {
    value: "placement-calendar",
    label: "Placement Calendar",
    component: <PlacementCalendar />,
  },
  {
    value: "company-registration",
    label: "Company Registration",
    component: <CompanyRegistrationForm />,
  },
  {
    value: "fields",
    label: "Fields",
    component: <FieldsForm />,
  },
  {
    value: "debarred-students",
    label: "Debarred Students",
    component: <DebarredStudents />,
  },
  {
    value: "restrictions",
    label: "Restrictions",
    component: <RestrictionsTab />,
  },
];

const styles = {
  container: {},
  navContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  tabsContainer: {
    display: "flex",
    flexWrap: "nowrap",
    overflowX: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    marginLeft: "10px",
  },
  tabsList: {
    display: "flex",
    gap: "0px",
  },
  navButton: {
    border: "none",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    fontSize: "1.75rem",
    padding: "8px",
    width: "50px",
    height: "50px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },

  fusionCaretCircleIcon: {
    fontSize: "2rem",
  },

  tab: {
    fontWeight: "normal",
    color: "#6c757d",
    padding: "10px 20px",
    cursor: "pointer", // Ensures tabs are clickable
  },
  activeTab: {
    backgroundColor: "#15abff10", // Light blue background for active tab
    color: "#15abff",
    // fontWeight: "bold",
    borderRadius: "4px",
  },
  tabContent: {
    marginTop: "20px",
  },
};

function PlacementCellPage() {
  const role = useSelector((state) => state.user.role);
  const [activeTab, setActiveTab] = useState("schedule");
  const tabsContainerRef = useRef(null);

  const tabs =
    role === "student"
      ? studentTabs
      : role === "placement chairman"
        ? chairmanTabs
        : role === "placement officer"
          ? tpoTabs
          : defaultTabs;

  const handleTabChange = () => {}; // This is temporarily empty to avoid eslint error, Module team needs to implement this!

  return (
    <div style={styles.container}>
      <CustomBreadcrumbs />
      <Container fluid mt={48}>
        <div style={styles.navContainer}>
          <Button
            onClick={() => handleTabChange("prev")}
            variant="default"
            p={0}
            style={{ border: "none" }}
          >
            <CaretCircleLeft
              style={styles.fusionCaretCircleIcon}
              weight="light"
            />
          </Button>

          <div
            className="fusionTabsContainer"
            style={styles.tabsContainer}
            ref={tabsContainerRef}
          >
            <Tabs value={activeTab} onTabChange={setActiveTab}>
              <Tabs.List style={styles.tabsList}>
                {tabs.map((tab) => (
                  <Tabs.Tab
                    key={tab.value}
                    value={tab.value}
                    style={{
                      ...styles.tab,
                      ...(activeTab === tab.value && styles.activeTab),
                    }}
                    onClick={() => setActiveTab(tab.value)}
                  >
                    {tab.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
          </div>

          <Button
            onClick={() => handleTabChange("next")}
            variant="default"
            p={0}
            style={{ border: "none" }}
          >
            <CaretCircleRight
              style={styles.fusionCaretCircleIcon}
              weight="light"
            />
          </Button>
        </div>

        <div style={styles.tabContent}>
          {tabs.map((tab) =>
            tab.value === activeTab ? (
              <div key={tab.value}>{tab.component}</div>
            ) : null,
          )}
        </div>
      </Container>
    </div>
  );
}

export default PlacementCellPage;

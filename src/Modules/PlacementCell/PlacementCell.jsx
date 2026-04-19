import "@mantine/notifications/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";

import React, { useRef } from "react";
import { Tabs, Button, Container } from "@mantine/core";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";

import CustomBreadcrumbs from "../../components/Breadcrumbs";

// Student components
import PlacementSchedule from "./components/PlacementSchedule";
import PlacementRecordsTable from "./components/PlacementRecordsTable";
import PlacementCalendar from "./components/PlacementCalendar";
import DownloadCV from "./components/DownloadCV";
import JobPostings from "./components/JobPostings";
import MyApplications from "./components/MyApplications";
import OfferManagement from "./components/OfferManagement";
import AppealForm from "./components/AppealForm";

// TPO components
import SendNotificationForm from "./components/SendNotificationForm";
import CompanyRegistrationForm from "./components/CompanyRegistrationForm";
import DebarredStudents from "./components/DebarredStudents";
import RestrictionsTab from "./components/RestrictionsTab";
import FieldsForm from "./components/FieldsForm";
import JobPostingReview from "./components/JobPostingReview";
import InterviewScheduler from "./components/InterviewScheduler";
import AllApplicationsView from "./components/AllApplicationsView";
import ReportGenerator from "./components/ReportGenerator";
import TpoAppealsManager from "./components/TpoAppealsManager";

// Chairman components
import ChairmanDashboard from "./components/ChairmanDashboard";
import PolicyManager from "./components/PolicyManager";
import AnnouncementPublisher from "./components/AnnouncementPublisher";

// Company/Recruiter components
import CompanyDashboard from "./components/CompanyDashboard";
import JobPostingForm from "./components/JobPostingForm";
import ApplicationReview from "./components/ApplicationReview";
import InterviewManager from "./components/InterviewManager";
import OfferExtension from "./components/OfferExtension";

// Alumni components
import AlumniRegistration from "./components/AlumniRegistration";
import MentorshipPanel from "./components/MentorshipPanel";
import ReferralBoard from "./components/ReferralBoard";

// Student profile
import StudentProfile from "./components/StudentProfile";

// Shared components
import NotificationPreferences from "./components/NotificationPreferences";
import AuditLogViewer from "./components/AuditLogViewer";

const studentTabs = [
  { value: "profile", label: "My Profile", component: <StudentProfile /> },
  { value: "schedule", label: "Placement Schedule", component: <PlacementSchedule /> },
  { value: "job-postings", label: "Job Postings", component: <JobPostings /> },
  { value: "my-applications", label: "My Applications", component: <MyApplications /> },
  { value: "offers", label: "Offers", component: <OfferManagement /> },
  { value: "download-cv", label: "Download CV", component: <DownloadCV /> },
  { value: "stats", label: "Placement Stats", component: <PlacementRecordsTable /> },
  { value: "placement-calendar", label: "Placement Calendar", component: <PlacementCalendar /> },
  { value: "appeals", label: "Appeals", component: <AppealForm /> },
  { value: "notif-prefs", label: "Notification Preferences", component: <NotificationPreferences /> },
];

const tpoTabs = [
  { value: "schedule", label: "Placement Schedule", component: <PlacementSchedule /> },
  { value: "job-review", label: "Job Posting Review", component: <JobPostingReview /> },
  { value: "company-registration", label: "Company Registration", component: <CompanyRegistrationForm /> },
  { value: "all-applications", label: "All Applications", component: <AllApplicationsView /> },
  { value: "interviews", label: "Interview Scheduler", component: <InterviewScheduler /> },
  { value: "appeals", label: "Appeals", component: <TpoAppealsManager /> },
  { value: "send-notifications", label: "Send Notifications", component: <SendNotificationForm /> },
  { value: "debarred-students", label: "Debarred Students", component: <DebarredStudents /> },
  { value: "restrictions", label: "Restrictions", component: <RestrictionsTab /> },
  { value: "reports", label: "Reports", component: <ReportGenerator /> },
  { value: "stats", label: "Placement Stats", component: <PlacementRecordsTable /> },
  { value: "audit-log", label: "Audit Log", component: <AuditLogViewer /> },
];

const chairmanTabs = [
  { value: "dashboard", label: "Dashboard", component: <ChairmanDashboard /> },
  { value: "policies", label: "Policy Manager", component: <PolicyManager /> },
  { value: "announcements", label: "Announcements", component: <AnnouncementPublisher /> },
  { value: "appeals", label: "Appeals", component: <TpoAppealsManager /> },
  { value: "stats", label: "Placement Stats", component: <PlacementRecordsTable /> },
  { value: "placement-calendar", label: "Placement Calendar", component: <PlacementCalendar /> },
  { value: "debarred-students", label: "Debarred Students", component: <DebarredStudents /> },
];

const recruiterTabs = [
  { value: "dashboard", label: "Dashboard", component: <CompanyDashboard /> },
  { value: "post-job", label: "Post Job", component: <JobPostingForm /> },
  { value: "applications", label: "Applications", component: <ApplicationReview /> },
  { value: "interviews", label: "Interviews", component: <InterviewManager /> },
  { value: "offers", label: "Offers", component: <OfferExtension /> },
];

const alumniTabs = [
  { value: "referrals", label: "Referral Board", component: <ReferralBoard /> },
  { value: "mentorship", label: "Mentorship Panel", component: <MentorshipPanel /> },
  { value: "registration", label: "Alumni Profile", component: <AlumniRegistration /> },
];

const defaultTabs = [
  { value: "schedule", label: "Placement Schedule", component: <PlacementSchedule /> },
  { value: "stats", label: "Placement Stats", component: <PlacementRecordsTable /> },
  { value: "placement-calendar", label: "Placement Calendar", component: <PlacementCalendar /> },
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
    cursor: "pointer",
  },
  activeTab: {
    backgroundColor: "#15abff10",
    color: "#15abff",
    borderRadius: "4px",
  },
  tabContent: {
    marginTop: "20px",
  },
};

function PlacementCellPage() {
  const role = useSelector((state) => state.user.role);
  const tabsContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const tabs =
    role === "student"
      ? studentTabs
      : role === "placement chairman"
        ? chairmanTabs
        : role === "placement officer"
          ? tpoTabs
          : role === "recruiter"
            ? recruiterTabs
            : role === "alumni"
              ? alumniTabs
              : defaultTabs;

  const subPath = location.pathname.replace(/^\/placement-cell\/?/, "").replace(/\/$/, "");
  const matchedTab = subPath && tabs.find((t) => t.value === subPath);
  const activeTab = matchedTab ? matchedTab.value : (tabs[0]?.value || "schedule");

  const setActiveTab = (value) => {
    navigate(`/placement-cell/${value}`);
  };

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      tabsContainerRef.current.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div style={styles.container}>
      <CustomBreadcrumbs />
      <Container fluid mt={48}>
        <div style={styles.navContainer}>
          <Button
            onClick={() => scrollTabs("prev")}
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
            <Tabs value={activeTab} onChange={setActiveTab}>
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
            onClick={() => scrollTabs("next")}
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

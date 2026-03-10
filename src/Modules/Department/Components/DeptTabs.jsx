import React, { useState, Suspense, lazy } from "react";
import { Button, Flex, Tabs, Text, Title, Box, Paper } from "@mantine/core";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

// Lazy load components
const AboutUs = lazy(() => import("./AboutUs"));
const Facilities = lazy(() => import("./Facilities"));
const Faculty = lazy(() => import("./Faculty"));
const Studentcat = lazy(() => import("./Studentcat"));
const Announcements = lazy(() => import("./Announcements"));
const Alumnicat = lazy(() => import("./Alumnicat"));
const ViewFeedback = lazy(() => import("./ViewFeedback"));

function DeptTabs({ branch }) {
  const [activeTab, setActiveTab] = useState("0");

  const role = useSelector((state) => state.user.role);

  const isFeedbackAvailable = [
    "HOD (CSE)",
    "deptadmin_cse",
    "HOD (SM)",
    "deptadmin_sm",
    "HOD (ECE)",
    "deptadmin_ece",
    "HOD (ME)",
    "deptadmin_me",
    "HOD (Design)",
    "deptadmin_design",
    "HOD (Liberal Arts)",
    "deptadmin_liberalarts",
    "HOD (NS)",
    "deptadmin_ns",
  ].includes(role);

  const tabItems = [
    { title: "About Us" },
    { title: "Faculties", id: "2" },
    { title: "Students", id: "3", department: branch },
    { title: "Announcements", id: "4", department: branch },
    { title: "Alumni" },
    { title: "Facilities" },
  ];

  if (isFeedbackAvailable) {
    tabItems.push({ title: "Feedback" });
  }

  const handleTabChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(+activeTab + 1, tabItems.length - 1)
        : Math.max(+activeTab - 1, 0);
    setActiveTab(String(newIndex));
  };

  const renderTabContent = () => {
    const components = {
      0: <AboutUs branch={branch} />,
      1: <Faculty branch={branch} />,
      2: <Studentcat branch={branch} />,
      3: <Announcements branch={branch} />,
      4: <Alumnicat />,
      5: <Facilities branch={branch} />,
      6: isFeedbackAvailable ? <ViewFeedback branch={branch} /> : null,
    };
    return components[activeTab] || null;
  };

  return (
    <Box px="md" py="xl">
      <Title order={2} mb="lg" fw={600} c="blue.7">
        Welcome to {branch} Department
      </Title>

      <Flex align="center" gap="xs" mb="md">
        <Button
          onClick={() => handleTabChange("prev")}
          variant="light"
          size="sm"
          color="blue"
        >
          <CaretLeft size={20} />
        </Button>

        <Box
          style={{
            display: "flex",
            flexWrap: "nowrap",
            overflow: "hidden", // Disable scroll and prevent overflow
          }}
        >
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            color="blue"
            variant="pills"
            radius="lg"
            keepMounted={false}
            style={{ whiteSpace: "nowrap" }}
          >
            <Tabs.List style={{ flexWrap: "nowrap" }}>
              {tabItems.map((item, index) => (
                <Tabs.Tab
                  value={String(index)}
                  key={index}
                  style={{ marginRight: 12, fontWeight: 600 }}
                >
                  {item.title}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        </Box>

        <Button
          onClick={() => handleTabChange("next")}
          variant="light"
          size="sm"
          color="blue"
        >
          <CaretRight size={20} />
        </Button>
      </Flex>

      <Paper withBorder shadow="sm" radius="md" p="md" w="100%">
        <Suspense fallback={<Text c="dimmed">Loading content...</Text>}>
          {renderTabContent()}
        </Suspense>
      </Paper>
    </Box>
  );
}

DeptTabs.propTypes = {
  branch: PropTypes.string.isRequired,
};

export default DeptTabs;

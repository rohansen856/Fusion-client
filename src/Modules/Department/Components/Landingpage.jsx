/* eslint-disable no-return-assign */
import React, { lazy, Suspense, useRef, useState, useEffect } from "react";
import {
  Container,
  Grid,
  Menu,
  Button,
  Group,
  Title,
  Box,
  Tabs,
  Loader,
  Text,
} from "@mantine/core";
import {
  CaretDown,
  CaretUp,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import axios from "axios";
import { host } from "../../../routes/globalRoutes";

// Lazy load components
const MakeAnnouncement = lazy(() => import("./MakeAnnouncement"));
const BrowseAnnouncements = lazy(() => import("./BrowseAnnouncements"));
const FeedbackForm = lazy(() => import("./FeedbackForm"));
const DeptTabs = lazy(() => import("./DeptTabs"));

const departments = [
  { title: "CSE Department", id: "3", code: "CSE" },
  { title: "ECE Department", id: "4", code: "ECE" },
  { title: "ME Department", id: "5", code: "ME" },
  { title: "SM Department", id: "6", code: "SM" },
  { title: "Design Department", id: "7", code: "DS" },
  { title: "Liberal Arts Department", id: "8", code: "LA" },
  { title: "NaturalScience", id: "9", code: "NS" },
];

export default function LandingPage() {
  const [role, setRole] = useState(null);
  const [branch, setBranch] = useState(null);
  const [activeTab, setActiveTab] = useState("1"); // Default active tab
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState(null);
  const tabsListRef = useRef(null);

  useEffect(() => {
    const fetchUserDepartment = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(`${host}/dep/api/dep-main/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        const { user_designation, department } = response.data;
        setLoading(false);
        setRole(user_designation);
        setBranch(department);
        const deptTab = departments.find((d) => d.code === department)?.id;
        setActiveTab(deptTab || "3");
      } catch (err) {
        console.error("Error fetching user department:", err);
        setLoading(false);
        setError("Failed to fetch department data");
      }
    };
    fetchUserDepartment();
  }, []);

  const handleTabChange = (direction) => {
    if (direction === "next") {
      // Only allow navigation in the three main tabs (Make, Browse, Feedback)
      const validTabs = ["0", "1", "2"];
      const nextTabIndex = validTabs.indexOf(activeTab) + 1;
      if (nextTabIndex < validTabs.length) {
        setActiveTab(validTabs[nextTabIndex]);
      }
    } else {
      const validTabs = ["0", "1", "2"];
      const prevTabIndex = validTabs.indexOf(activeTab) - 1;
      if (prevTabIndex >= 0) {
        setActiveTab(validTabs[prevTabIndex]);
      }
    }
  };

  const renderTabContent = () => (
    <Suspense fallback={<Loader />}>
      {activeTab === "0" && role && !role.toLowerCase().includes("student") && (
        <MakeAnnouncement />
      )}
      {activeTab === "1" && <BrowseAnnouncements />}
      {activeTab === "2" && <FeedbackForm branch={branch} />}
      {departments.map((dept) =>
        activeTab === dept.id ? (
          <DeptTabs key={dept.id} branch={dept.code} initialTab="about" />
        ) : null,
      )}
    </Suspense>
  );

  if (loading) return <Loader />;
  if (error) return <Text color="red">{error}</Text>;

  const currentDept = departments.find((d) => d.code === branch);

  return (
    <Container fluid>
      <Grid>
        <Grid.Col span={12}>
          <Group
            position="apart"
            align="center"
            mb="lg"
            style={{ flexWrap: "nowrap" }}
          >
            {/* Clickable Department Portal Title */}
            <Title
              order={2}
              style={{
                cursor: "pointer",
                color: "#1C6FB1", // Blue color for clickable text (blue.7)
                transition: "color 0.3s ease", // Smooth color transition on hover
              }}
              onClick={() => {
                // Set activeTab to the "About Us" section of the user's department
                const deptTab = departments.find((d) => d.code === branch)?.id;
                setActiveTab(deptTab || "3");
              }} // Only update activeTab, no page refresh
              onMouseEnter={(e) => (e.target.style.color = "#1C6FB1")} // Darker blue on hover
              onMouseLeave={(e) => (e.target.style.color = "black")} // Reset to original color on mouse leave
            >
              Department Portal
            </Title>

            <Group spacing="sm" style={{ marginLeft: "auto" }}>
              <Button
                onClick={() => handleTabChange("prev")}
                variant="subtle"
                p={0}
                mr="xs"
              >
                <CaretLeft size={24} />
              </Button>

              <Box
                style={{ maxWidth: "80%", overflowX: "auto" }}
                ref={tabsListRef}
              >
                <Tabs value={activeTab} onChange={setActiveTab}>
                  <Tabs.List>
                    {role && !role.toLowerCase().includes("student") && (
                      <Button
                        variant={activeTab === "0" ? "filled" : "light"}
                        onClick={() => setActiveTab("0")}
                      >
                        Make Announcement
                      </Button>
                    )}
                    <Button
                      variant={activeTab === "1" ? "filled" : "light"}
                      onClick={() => setActiveTab("1")}
                    >
                      Browse Announcements
                    </Button>
                    <Button
                      variant={activeTab === "2" ? "filled" : "light"}
                      onClick={() => setActiveTab("2")}
                    >
                      Provide Feedback
                    </Button>
                  </Tabs.List>
                </Tabs>
              </Box>

              <Button
                onClick={() => handleTabChange("next")}
                variant="subtle"
                p={0}
                ml="xs"
              >
                <CaretRight size={24} />
              </Button>

              <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                  <Button
                    variant="subtle"
                    style={{ marginRight: "50px", fontSize: "16px" }}
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                  >
                    {currentDept?.title || "Select Department"}
                    {isDropdownOpen ? (
                      <CaretUp size={20} style={{ marginLeft: "10px" }} />
                    ) : (
                      <CaretDown size={20} style={{ marginLeft: "10px" }} />
                    )}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {departments.map((dept) => (
                    <Menu.Item
                      key={dept.id}
                      onClick={() => {
                        setActiveTab(dept.id);
                        setIsDropdownOpen(false);
                      }}
                      fw={activeTab === dept.id ? 700 : 400}
                    >
                      {dept.title}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          {activeTab !== null ? (
            renderTabContent()
          ) : (
            <Text>Select a department or action to view content</Text>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}

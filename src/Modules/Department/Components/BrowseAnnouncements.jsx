import React, { useRef, useState, Suspense, lazy } from "react";
import {
  Container,
  Grid,
  Button,
  Group,
  Paper,
  Box,
  Loader,
} from "@mantine/core";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const Announcements = lazy(() => import("./Announcements"));

const tabItems = ["ALL", "CSE", "ECE", "ME", "SM"];

export default function BrowseAnnouncements() {
  const [activeTab, setActiveTab] = useState("0");
  const tabsListRef = useRef(null);

  const handleTabChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(+activeTab + 1, tabItems.length - 1)
        : Math.max(+activeTab - 1, 0);
    setActiveTab(String(newIndex));
  };

  const renderTabContent = () => (
    <Suspense fallback={<Loader />}>
      <Paper withBorder p="lg" radius="md" shadow="sm" mt="md">
        <Announcements branch={tabItems[+activeTab]} />
      </Paper>
    </Suspense>
  );

  return (
    <Container size="xl" py="lg">
      <Grid>
        <Grid.Col span={12}>
          <Group
            position="apart"
            align="center"
            mb="lg"
            style={{ flexWrap: "nowrap", width: "100%" }}
          >
            <Button
              onClick={() => handleTabChange("prev")}
              variant="subtle"
              p={0}
              mr="xs"
            >
              <CaretLeft size={24} />
            </Button>

            {/* Box that holds the tabs, filling the space */}
            <Box
              style={{
                whiteSpace: "nowrap",
                display: "inline-block",
                width: "100%", // Ensure it fills the available space
              }}
              ref={tabsListRef}
            >
              <Group spacing="sm">
                {tabItems.map((item, index) => (
                  <Button
                    key={index}
                    variant={activeTab === String(index) ? "filled" : "light"}
                    color="blue"
                    onClick={() => setActiveTab(String(index))}
                  >
                    {item}
                  </Button>
                ))}
              </Group>
            </Box>

            <Button
              onClick={() => handleTabChange("next")}
              variant="subtle"
              p={0}
              ml="xs"
            >
              <CaretRight size={24} />
            </Button>
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>{renderTabContent()}</Grid.Col>
      </Grid>
    </Container>
  );
}
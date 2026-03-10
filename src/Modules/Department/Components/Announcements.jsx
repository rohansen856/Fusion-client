import React, { useEffect, useState, Suspense } from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Paper,
  Flex,
  Text,
  Divider,
  Badge,
  Title,
  Box,
} from "@mantine/core";
import { host } from "../../../routes/globalRoutes";

// Format date
function formatDateWithPeriod(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const options = { year: "numeric", month: "short", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate.replace(/(\w+)\s/, "$1. ");
}

export default function Announcements({ branch }) {
  const [announcementsData, setAnnouncementsData] = useState([]);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    fetch(`${host}/dep/api/ann-data/${branch}/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const formattedData =
          data?.map((announcement) => ({
            ...announcement,
            ann_date: formatDateWithPeriod(announcement.ann_date),
          })) || [];
        setAnnouncementsData(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching announcements data:", error);
      });
  }, [authToken, branch]);

  return (
    <Suspense fallback={<Text>Loading announcements...</Text>}>
      <Grid gutter="lg">
        {" "}
        {/* Add gutter between grid items */}
        {announcementsData.length > 0 ? (
          announcementsData.map((announcement) => (
            <Grid.Col span={{ base: 12, md: 6 }} key={announcement.id}>
              <Box mb="md">
                {" "}
                {/* Add spacing between cards */}
                <Paper
                  shadow="sm"
                  radius="md"
                  withBorder
                  p="md"
                  style={{
                    borderLeft: "6px solid #228BE6",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Flex direction="column" gap="xs">
                    <Box>
                      <Title order={5} color="blue.7">
                        {`${branch} Announcement`}
                      </Title>
                      <Text size="xs" color="dimmed">
                        {announcement.ann_date}
                      </Text>
                    </Box>

                    <Divider mt="xs" mb="sm" />

                    <Text size="sm" mb="sm">
                      {announcement.message || "No details available."}
                    </Text>

                    <Flex justify="space-between" align="center">
                      <Badge color="blue" variant="light">
                        {announcement.maker_id || "Unknown"}
                      </Badge>
                    </Flex>
                  </Flex>
                </Paper>
              </Box>
            </Grid.Col>
          ))
        ) : (
          <Grid.Col span={12}>
            <Text color="dimmed">
              No announcements available for this branch.
            </Text>
          </Grid.Col>
        )}
      </Grid>
    </Suspense>
  );
}

Announcements.propTypes = {
  branch: PropTypes.string.isRequired,
};

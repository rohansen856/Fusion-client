import React, { useState, useEffect } from "react";
import {
  Timeline,
  Text,
  Title,
  Container,
  Group,
  ActionIcon,
} from "@mantine/core";
import { Check, X, Minus, ArrowLeft } from "@phosphor-icons/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { fetchTimeLineRoute } from "../../../routes/placementCellRoutes";

function ApplicationStatusTimeline() {
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/placement-cell");
  };

  useEffect(() => {
    async function fetchStatusData() {
      const token = localStorage.getItem("authToken");
      const jobId = new URLSearchParams(window.location.search).get("jobId");

      try {
        const response = await axios.get(`${fetchTimeLineRoute}${jobId}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        setStatusData(response.data.next_data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching application status data:", error);
        setLoading(false);
      }
    }

    fetchStatusData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Container
        fluid
        radius="md"
        withBorder
        style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
      >
        <Group position="left" mb="xl">
          <ActionIcon
            variant="outline"
            style={{ border: "none" }}
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
          </ActionIcon>
        </Group>

        <Title order={2}>Application Status</Title>

        <Timeline active={statusData.length - 1} bulletSize={24} lineWidth={2}>
          {statusData.map((item, index) => {
            const isRejected = item.round_no === -1;
            const IsUpdated = item.round_no === 0;
            const isLast = index === statusData.length - 1;

            const circleColor = isLast ? "gray" : isRejected ? "red" : "green";

            return (
              <Timeline.Item
                key={index}
                title={
                  isRejected
                    ? "Rejected"
                    : `${item.test_name} (Round ${item.round_no})`
                }
                bullet={
                  isLast ? (
                    <Minus size={12} />
                  ) : isRejected ? (
                    <X size={12} />
                  ) : (
                    <Check size={12} />
                  )
                }
                styles={{
                  bullet: {
                    backgroundColor: circleColor,
                    borderColor: circleColor,
                  },
                  title: {
                    color: isLast ? "gray" : isRejected ? "red" : "black",
                  },
                  body: {
                    color: isLast ? "gray" : isRejected ? "red" : "dimmed",
                  },
                }}
              >
                <Text size="md">
                  {isRejected
                    ? "Application rejected"
                    : item.test_date
                      ? `Scheduled on ${item.test_date}`
                      : IsUpdated
                        ? "To be updated"
                        : "Completed"}
                  {item.description && <div>{item.description}</div>}
                </Text>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </Container>
    </div>
  );
}

export default ApplicationStatusTimeline;

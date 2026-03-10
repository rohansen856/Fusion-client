import React from "react";
import { Card, Text, Title } from "@mantine/core";

function NextRoundInfo() {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ marginTop: "20px", width: "400px" }}
    >
      <Title order={4} style={{ marginBottom: "10px" }}>
        Next Round
      </Title>

      <Text weight={500} size="lg" style={{ marginBottom: "8px" }}>
        Coding Interview
      </Text>

      <Text color="dimmed" size="sm" style={{ marginBottom: "4px" }}>
        <b>Topics:</b> 2 DSA Questions, CS Fundamentals
      </Text>
      <Text color="dimmed" size="sm" style={{ marginBottom: "4px" }}>
        <b>Duration:</b> 45 mins
      </Text>
      <Text color="dimmed" size="sm" style={{ marginBottom: "4px" }}>
        <b>Date and Time:</b> Oct 6, 2024 17:00
      </Text>
    </Card>
  );
}

export default NextRoundInfo;

import React from "react";
import { Paper, Title, Text } from "@mantine/core";

export default function CreateNextRoundForm() {
  return (
    <Paper p="md" withBorder>
      <Title order={4}>Next Round Details</Title>
      <Text c="dimmed" size="sm" mt="xs">
        Use the Interview Scheduler tab to manage interview rounds.
      </Text>
    </Paper>
  );
}

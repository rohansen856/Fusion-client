import React from "react";
import { Paper, Title, Text } from "@mantine/core";

export default function AppliedStudentDetails() {
  return (
    <Paper p="md" withBorder>
      <Title order={4}>Applied Students</Title>
      <Text c="dimmed" size="sm" mt="xs">
        Use the All Applications tab to view applied students.
      </Text>
    </Paper>
  );
}

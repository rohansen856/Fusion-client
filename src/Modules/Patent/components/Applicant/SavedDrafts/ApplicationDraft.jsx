import React from "react";
import PropTypes from "prop-types";
import { Card, Button, Text, Box, Center, ThemeIcon } from "@mantine/core";
import { ArrowRight, FileText } from "phosphor-react";
import "../../../style/Applicant/ApplicationDraft.css";

// Empty state component
function EmptyDraftsState({ onStartNew }) {
  return (
    <Card id="patent-system-saved-draft-card">
      <Center style={{ flexDirection: "column", padding: "14px 12px" }}>
        <ThemeIcon
          size="lg"
          radius="xl"
          variant="light"
          color="blue"
          style={{ marginBottom: 10 }}
        >
          <FileText size={20} />
        </ThemeIcon>
        <Text size="lg" weight={600} align="center" style={{ marginBottom: 6 }}>
          No Drafts Available
        </Text>
        <Text size="xs" align="center" style={{ marginBottom: 6 }}>
          You haven't saved any patent application drafts yet.
        </Text>
        <Button
          variant="outline"
          leftIcon={<ArrowRight size={14} />}
          onClick={onStartNew}
          size="sm"
          style={{ width: "100%" }}
        >
          Start New Application
        </Button>
      </Center>
    </Card>
  );
}

EmptyDraftsState.propTypes = {
  onStartNew: PropTypes.func.isRequired,
};

// Main component
function SavedDraftsPage({ setActiveTab }) {
  return (
    <Box style={{ width: "100%" }}>
      <Text id="patent-system-draft-header-text" size="xl" weight={700}>
        Saved Drafts
      </Text>

      <Box id="patent-system-draft-app-container">
        <EmptyDraftsState onStartNew={() => setActiveTab("1.1")} />
      </Box>
    </Box>
  );
}

SavedDraftsPage.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
};

export default SavedDraftsPage;

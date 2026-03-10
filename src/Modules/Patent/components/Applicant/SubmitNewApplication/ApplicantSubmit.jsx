import React from "react";
import { Button, Card, Text, Box } from "@mantine/core";
import { ArrowRight } from "phosphor-react";
import "../../../style/Applicant/ApplicantSubmit.css";
import PropTypes from "prop-types";

function SubmitNewApplication({ setActiveTab }) {
  const handleSubmit = () => {
    setActiveTab("1.1");
  };

  return (
    <Box id="pms-submit-app-container">
      <Text id="pms-submit-header-text">Submit New Application</Text>

      <Box id="pms-submit-card-container" style={{ marginLeft: "50px" }}>
        <Card id="pms-submit-application-card">
          <Text id="pms-submit-card-title" weight={600} size="lg">
            Intellectual Property Filing Form
          </Text>
          <Text id="pms-submit-card-details" size="sm">
            Please use this form for all types of IP, including Patents,
            Copyright, Designs etc.
          </Text>
          <br />
          <Text id="pms-submit-card-description" size="sm">
            Complete this form to initiate a new patent filing. Please ensure
            all necessary details are accurate before submission. This form will
            help streamline your application process and ensure compliance with
            institutional guidelines.
          </Text>
          <Button
            variant="light"
            leftIcon={<ArrowRight size={16} />}
            id="pms-start-application-button"
            onClick={handleSubmit}
            fullWidth
            mt="sm"
          >
            Start Application
          </Button>
        </Card>
      </Box>
    </Box>
  );
}

SubmitNewApplication.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
};

export default SubmitNewApplication;

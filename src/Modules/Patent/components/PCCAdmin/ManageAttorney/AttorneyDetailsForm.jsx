import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Text,
  Box,
  Tooltip,
  Button,
  TextInput,
  LoadingOverlay,
} from "@mantine/core";
import {
  EnvelopeSimple,
  Phone,
  Briefcase,
  PencilSimple,
  Check,
  X,
  CaretLeft,
} from "phosphor-react";
import { attorneyService } from "../../../services/attorneyService";
import "../../../style/Pcc_Admin/AttorneyForm.css";

function AttorneyForm({ attorneyId, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attorney, setAttorney] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttorneyDetails = async () => {
      if (!attorneyId) {
        setError("No attorney selected");
        return;
      }

      try {
        setIsLoading(true);
        const data = await attorneyService.getAttorneyDetails(attorneyId);
        console.log("Received attorney data:", data);
        setAttorney(data);
        setUpdatedData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          firm_name: data.firm_name,
        });
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch attorney details");
        console.error("Error details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttorneyDetails();
  }, [attorneyId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData({ ...updatedData, [name]: value });
  };

  const handleEditSubmit = async () => {
    try {
      setIsLoading(true);
      await attorneyService.updateAttorney(attorneyId, updatedData);
      const updatedDetails =
        await attorneyService.getAttorneyDetails(attorneyId);
      setAttorney(updatedDetails);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update attorney details");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUpdatedData({
      name: attorney.name,
      email: attorney.email,
      phone: attorney.phone,
      firm_name: attorney.firm_name,
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (error) {
    return <Text color="red">{error}</Text>;
  }

  if (!attorney) {
    return <Text>Attorney not found</Text>;
  }

  return (
    <div id="pms-pcc-attorney-details-container">
      {/* Header with Back and Edit Buttons */}
      <div id="pms-pcc-top-nav-container">
        <Button
          variant="subtle"
          leftIcon={<CaretLeft size={20} weight="bold" />}
          onClick={onBack}
          id="pms-pcc-attorney-back-btn"
        >
          Back
        </Button>
        {isEditing ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              variant="outline"
              color="blue"
              leftIcon={<Check size={20} />}
              onClick={handleEditSubmit}
              id="pms-pcc-save-button"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              color="red"
              leftIcon={<X size={20} />}
              onClick={handleCancel}
              id="pms-pcc-cancel-button"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            color="blue"
            leftIcon={<PencilSimple size={20} />}
            onClick={() => setIsEditing(true)}
            id="pms-pcc-edit-details-button"
          >
            Edit Details
          </Button>
        )}
      </div>

      {/* Attorney Details Grid */}
      <Box id="pms-pcc-attorney-details-grid">
        <div className={`detail-item ${isEditing ? "editing" : ""}`}>
          <Tooltip label="Name of the Attorney" position="right">
            {isEditing ? (
              <TextInput
                label="Name"
                name="name"
                value={updatedData.name}
                onChange={handleInputChange}
                id="pms-pcc-edit-input"
                required
              />
            ) : (
              <Text id="pms-pcc-attorney-detail">
                <Briefcase size={20} id="pms-pcc-icon" />
                <strong>Name:</strong> {attorney.name}
              </Text>
            )}
          </Tooltip>
        </div>

        <div className={`detail-item ${isEditing ? "editing" : ""}`}>
          <Tooltip label="Email Address" position="right">
            {isEditing ? (
              <TextInput
                label="Email"
                name="email"
                value={updatedData.email}
                onChange={handleInputChange}
                id="pms-pcc-edit-input"
                required
              />
            ) : (
              <Text id="pms-pcc-attorney-detail">
                <EnvelopeSimple size={20} id="pms-pcc-icon" />
                <strong>Email:</strong> {attorney.email}
              </Text>
            )}
          </Tooltip>
        </div>

        <div className={`detail-item ${isEditing ? "editing" : ""}`}>
          <Tooltip label="Contact Number" position="right">
            {isEditing ? (
              <TextInput
                label="Phone"
                name="phone"
                value={updatedData.phone}
                onChange={handleInputChange}
                id="pms-pcc-edit-input"
              />
            ) : (
              <Text id="pms-pcc-attorney-detail">
                <Phone size={20} id="pms-pcc-icon" />
                <strong>Phone:</strong> {attorney.phone || "Not Available"}
              </Text>
            )}
          </Tooltip>
        </div>

        <div className={`detail-item ${isEditing ? "editing" : ""}`}>
          <Tooltip label="Law Firm" position="right">
            {isEditing ? (
              <TextInput
                label="Law Firm"
                name="firm_name"
                value={updatedData.firm_name}
                onChange={handleInputChange}
                id="pms-pcc-edit-input"
              />
            ) : (
              <Text id="pms-pcc-attorney-detail">
                <Briefcase size={20} id="pms-pcc-icon" />
                <strong>Law Firm:</strong>{" "}
                {attorney.firm_name || "Not Available"}
              </Text>
            )}
          </Tooltip>
        </div>

        {/* Assigned Cases Section - Full Width */}
        <div id="pms-pcc-detail-item-assigned-cases">
          <Text id="pms-pcc-attorney-detail">
            <Briefcase size={20} id="pms-pcc-icon" />
            <strong>Assigned Cases:</strong>{" "}
            {attorney.assigned_applications_count || 0}
          </Text>
          {attorney.applications && attorney.applications.length > 0 ? (
            <div id="pms-pcc-assigned-cases-list">
              {attorney.applications.map((app) => (
                <div key={app.id} id="pms-pcc-assigned-case-item">
                  <Text>
                    <strong>Application {app.id}:</strong> {app.title}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <Text id="pms-pcc-no-applications-text" color="dimmed" size="sm">
              No applications assigned
            </Text>
          )}
        </div>
      </Box>
    </div>
  );
}

AttorneyForm.propTypes = {
  attorneyId: PropTypes.number.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default AttorneyForm;

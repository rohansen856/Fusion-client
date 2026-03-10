import React, { useState } from "react";
import { TextInput, Button, Title } from "@mantine/core";
import {
  UserCircle,
  Briefcase,
  Envelope,
  Phone,
  ArrowLeft,
} from "phosphor-react";
import PropTypes from "prop-types";
import "../../../style/Pcc_Admin/NewAttorneyForm.css";

function NewAttorneyForm({ onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    firm_name: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div id="pcc-new-attorney-form-container">
      <div id="pcc-new-attorney-form-header">
        <Title order={2} id="pcc-new-attorney-form-title">
          Add New Attorney
        </Title>
        <Button
          variant="subtle"
          leftIcon={<ArrowLeft size={20} weight="bold" />}
          onClick={onBack}
          id="pcc-new-attorney-back-btn"
        >
          Close
        </Button>
      </div>

      <form onSubmit={handleSubmit} id="pcc-new-attorney-form-content">
        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <UserCircle size={20} id="pcc-new-attorney-form-icon" />
              <span>Attorney Name</span>
            </div>
            <TextInput
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              id="pcc-new-attorney-form-input"
            />
          </div>

          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Envelope size={20} id="pcc-new-attorney-form-icon" />
              <span>Email</span>
            </div>
            <TextInput
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-section">
          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Phone size={20} id="pcc-new-attorney-form-icon" />
              <span>Phone Number</span>
            </div>
            <TextInput
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              id="pcc-new-attorney-form-input"
            />
          </div>

          <div id="pcc-new-attorney-form-field">
            <div id="pcc-new-attorney-form-label">
              <Briefcase size={20} id="pcc-new-attorney-form-icon" />
              <span>Law Firm</span>
            </div>
            <TextInput
              name="firm_name"
              value={formData.firm_name}
              onChange={handleChange}
              id="pcc-new-attorney-form-input"
            />
          </div>
        </div>

        <div id="pcc-new-attorney-form-footer">
          <Button
            type="submit"
            variant="filled"
            color="blue"
            id="pcc-new-attorney-form-submit-btn"
          >
            Add Attorney
          </Button>
        </div>
      </form>
    </div>
  );
}

NewAttorneyForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default NewAttorneyForm;

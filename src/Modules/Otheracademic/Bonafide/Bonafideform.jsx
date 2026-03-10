import React, { useState } from "react";
import PropTypes from "prop-types";
import { TextInput, Button, Select, Grid, Title, Paper } from "@mantine/core";
import "./BonafideForm.css";
import axios from "axios";
import { Bonafide_Form_Submit } from "../../../routes/otheracademicRoutes";

function BonafideForm({ setTab }) {
  const roll = "";
  const name = "";
  const [formValues, setFormValues] = useState({
    student_name: name,
    roll_no: roll,
    purpose: "",
    branch: "",
    semester: "",
  });

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("No auth token found");
      return;
    }
    const formData = new FormData();
    formData.append("student_name", name);
    formData.append("roll_no", roll);
    formData.append("purpose", formValues.purpose);
    formData.append("branch", formValues.branch);
    formData.append("semester", formValues.semester);

    try {
      const response = await axios.post(Bonafide_Form_Submit, formData, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      console.log("Form submitted successfully:", response.data);

      // After successful form submission, change the tab to "Bonafide Form Status"
      setTab(1);
    } catch (error) {
      console.error(
        "Error submitting the form:",
        error.response?.data || error,
      );
    }
  };

  return (
    <Paper className="bonafide-paper">
      <Title order={2} align="center" className="form-title">
        Bonafide Certificate Request
      </Title>
      <form className="bonafide-form" onSubmit={handleSubmit}>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Roll No"
              placeholder="Enter your roll number"
              required
              className="form-input"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Branch"
              placeholder="Select your branch"
              data={[
                { value: "CSE", label: "Computer Science and Engineering" },
                {
                  value: "ECE",
                  label: "Electronics and Communication Engineering",
                },
                { value: "ME", label: "Mechanical Engineering" },
                { value: "SM", label: "Smart Manufacturing" },
                { value: "DS", label: "Design" },
              ]}
              required
              className="form-input"
              onChange={(value) => handleChange("branch", value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Semester"
              placeholder="Select your semester"
              data={[
                { value: "1", label: "Semester 1" },
                { value: "2", label: "Semester 2" },
                { value: "3", label: "Semester 3" },
                { value: "4", label: "Semester 4" },
                { value: "5", label: "Semester 5" },
                { value: "6", label: "Semester 6" },
                { value: "7", label: "Semester 7" },
                { value: "8", label: "Semester 8" },
              ]}
              required
              className="form-input"
              onChange={(value) => handleChange("semester", value)}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Purpose"
              placeholder="Enter the purpose of the bonafide certificate"
              required
              className="form-input"
              onChange={(e) => handleChange("purpose", e.target.value)}
            />
          </Grid.Col>
        </Grid>
        <Button type="submit" className="submit-btn">
          Submit
        </Button>
      </form>
    </Paper>
  );
}

BonafideForm.propTypes = {
  setTab: PropTypes.func.isRequired,
};

export default BonafideForm;

import React, { useState } from "react";
import axios from "axios";
import { Assistantship_Form_Submit } from "../../../../routes/otheracademicRoutes";

export default function AssistantshipForm() {
  const [formData, setFormData] = useState({
    student_name: "John Doe",
    roll_no: "1234567",
    discipline: "",
    date_from: "",
    date_to: "",
    bank_account_no: "",
    signature: null,
    applicability: "",
    ta_supervisor: "",
    thesis_supervisor: "",
    date_applied: new Date().toISOString().split("T")[0], // Default to today's date
    hod: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, signature: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form...");

    // Check for missing required fields
    const requiredFields = [
      "discipline",
      "date_from",
      "date_to",
      "bank_account_no",
      "signature",
      "applicability",
      "ta_supervisor",
      "thesis_supervisor",
      "hod",
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill out the "${field}" field.`);
        return;
      }
    }

    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("No auth token found");
      alert("Authentication failed. Please log in again.");
      return;
    }

    try {
      const response = await axios.post(Assistantship_Form_Submit, form, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });
      alert(response.data.message || "Form submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("Error submitting the form. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "800px",
        margin: "20px auto",
        padding: "20px",
        borderRadius: "10px",
        backgroundColor: "#F5F7F8",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h2 style={{ textAlign: "center", fontSize: "24px", color: "#212529" }}>
        Assistantship Form
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <input
          type="text"
          name="discipline"
          placeholder="Discipline"
          value={formData.discipline}
          onChange={handleChange}
          required
          style={{
            backgroundColor: "#eff3f4",
            border: "none",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            color: "#0f1010",
          }}
        />
        <input
          type="date"
          name="date_from"
          value={formData.date_from}
          onChange={handleChange}
          required
          style={{
            backgroundColor: "#eff3f4",
            border: "none",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            color: "#0f1010",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <input
          type="date"
          name="date_to"
          value={formData.date_to}
          onChange={handleChange}
          required
          style={{
            backgroundColor: "#eff3f4",
            border: "none",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            color: "#0f1010",
          }}
        />
        <input
          type="text"
          name="bank_account_no"
          placeholder="Bank Account Number"
          value={formData.bank_account_no}
          onChange={handleChange}
          required
          style={{
            backgroundColor: "#eff3f4",
            border: "none",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            color: "#0f1010",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <input
          type="file"
          name="signature"
          accept=".png,.jpg,.jpeg"
          onChange={handleFileChange}
          required
          style={{
            backgroundColor: "#eff3f4",
            border: "none",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            color: "#0f1010",
          }}
        />
        <input
          type="text"
          name="applicability"
          placeholder="Applicability"
          value={formData.applicability}
          onChange={handleChange}
          required
          style={{
            backgroundColor: "#eff3f4",
            border: "none",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            color: "#0f1010",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        <input
          type="text"
          name="ta_supervisor"
          placeholder="TA Supervisor"
          value={formData.ta_supervisor}
          onChange={handleChange}
          required
          style={{
            backgroundColor: "#eff3f4",
            border: "none",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            color: "#0f1010",
          }}
        />
        <input
          type="text"
          name="thesis_supervisor"
          placeholder="Thesis Supervisor"
          value={formData.thesis_supervisor}
          onChange={handleChange}
          required
          style={{
            backgroundColor: "#eff3f4",
            border: "none",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            color: "#0f1010",
          }}
        />
      </div>

      <input
        type="text"
        name="hod"
        placeholder="HOD"
        value={formData.hod}
        onChange={handleChange}
        required
        style={{
          backgroundColor: "#eff3f4",
          border: "none",
          padding: "10px",
          fontSize: "16px",
          borderRadius: "5px",
          color: "#0f1010",
          width: "50%",
        }}
      />

      <button
        type="submit"
        style={{
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          margin: "20px auto",
          padding: "10px 20px",
          cursor: "pointer",
          fontSize: "16px",
          borderRadius: "5px",
          display: "block",
          width: "fit-content",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#007BFF")}
      >
        Submit
      </button>
    </form>
  );
}

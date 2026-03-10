/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from "react";
import styles from "./inviteApplications.module.css";
import { inviteApplicationsRoute } from "../../../../routes/SPACSRoutes";

function InviteApplications() {
  const [formData, setFormData] = useState({
    award: "",
    programme: "",
    batch: "",
    startdate: "",
    enddate: "",
    remarks: "",
  });

  // Get today's date in YYYY-MM-DD format for the min attribute
  const today = new Date().toLocaleDateString("en-CA");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmed = window.confirm(
      "Are you sure you want to submit the form?",
    );
    if (!confirmed) {
      return; // User cancelled
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(inviteApplicationsRoute, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Form successfully submitted:", data);
        alert("Application submitted successfully!");
      } else {
        const errorData = await response.json();
        console.error("Error submitting form:", errorData);
        alert("Failed to submit the application. Please try again.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please check your connection.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>Invite Applications</div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Type *</label>
          <select
            className={styles.input}
            name="award"
            value={formData.award}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="MCM Scholarship">MCM Scholarship</option>
            <option value="Director's Silver Medal">
              Director's Silver Medal
            </option>
            <option value="Director's Gold Medal">Director's Gold Medal</option>
            <option value="D&M Proficiency Gold Medal">
              D&M Proficiency Gold Medal
            </option>
            <option value="Notional Prizes">Notional Prizes</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Programme *</label>
          <select
            className={styles.input}
            name="programme"
            value={formData.programme}
            onChange={handleChange}
            required
          >
            <option value="">Select Programme</option>
            <option value="BTech">BTech</option>
            <option value="MTech">MTech</option>
            <option value="MDes">MDes</option>
            <option value="PhD">PhD</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Batch *</label>
          <select
            className={styles.input}
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            required
          >
            <option value="">Select Batch</option>
            <option value="2018">2018</option>
            <option value="2019">2019</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>
        </div>

        <div className={styles.dateRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Start Date *</label>
            <input
              type="date"
              className={styles.input}
              name="startdate"
              value={formData.startdate}
              onChange={handleChange}
              min={today}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>End Date *</label>
            <input
              type="date"
              className={styles.input}
              name="enddate"
              value={formData.enddate}
              onChange={handleChange}
              min={formData.startdate || today}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Remarks *</label>
          <textarea
            className={styles.textarea}
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows="4"
            placeholder="Enter your remarks..."
            required
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default InviteApplications;

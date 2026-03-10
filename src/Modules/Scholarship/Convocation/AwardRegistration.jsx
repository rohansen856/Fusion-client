import React, { useState, useEffect } from "react";
import { Container, Select, Title } from "@mantine/core";
import DirectorSilverForm from "./DirectorSilverForm";
import DirectorGoldForm from "./DirectorGoldForm";
import DMProficiencyForm from "./DMProficiencyForm";
import { checkApplicationWindow } from "../../../routes/SPACSRoutes";

export default function AwardRegistration() {
  const [selectedAward, setSelectedAward] = useState("Director's Silver Medal");
  const [isEligible, setIsEligible] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = async (awardName) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(checkApplicationWindow, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ award: awardName }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsEligible(data.result === "Success");
        setMessage(data.message);
      } else {
        console.error("Failed to get form data", data.message);
        alert("Failed to get form data");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("Failed to get form data");
    }
  };

  useEffect(() => {
    fetchData(selectedAward);
  }, []);

  const handleAwardChange = (value) => {
    setSelectedAward(value);
    fetchData(value);
  };

  const renderForm = () => {
    if (!isEligible) return <h1>{message}</h1>;

    switch (selectedAward) {
      case "Director's Silver Medal":
        return <DirectorSilverForm />;
      case "Director's Gold Medal":
        return <DirectorGoldForm />;
      case "D&M Proficiency Gold Medal":
        return <DMProficiencyForm />;
      default:
        return null;
    }
  };

  return (
    <Container size="lg">
      <Title order={2} mb="md">
        Award Registration Form
      </Title>
      <Select
        label="Select Award"
        value={selectedAward}
        onChange={handleAwardChange}
        data={[
          {
            value: "Director's Silver Medal",
            label: "Director's Silver Medal",
          },
          { value: "Director's Gold Medal", label: "Director's Gold Medal" },
          {
            value: "D&M Proficiency Gold Medal",
            label: "D&M Proficiency Gold Medal",
          },
        ]}
      />
      {renderForm()}
    </Container>
  );
}

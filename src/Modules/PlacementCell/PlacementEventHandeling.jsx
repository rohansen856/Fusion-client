import React from "react";
import JobApplicationsTable from "./components/AppliedStudentDetails";
import CreateNextRoundForm from "./components/CreateNextRoundForm";

function PlacementEventHandeling() {
  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CreateNextRoundForm />
      <JobApplicationsTable />
    </div>
  );
}

export default PlacementEventHandeling;

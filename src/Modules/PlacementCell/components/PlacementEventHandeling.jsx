import React from "react";
import JobApplicationsTable from "./AppliedStudentDetails";
import CreateNextRoundForm from "./CreateNextRoundForm";

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

import React, { useEffect, useState } from "react";
import InboxTable from "../../components/tables/InboxTable";
import { useParams } from "react-router-dom";
import {
  get_appraisal_inbox,
  get_form_track,
} from "../../../../routes/hr/index"; // Ensure this is the correct import path
import LoadingComponent from "../../components/Loading"; // Ensure this is the correct import path
import TrackTable from "../../components/tables/TrackTable";

function AppraisalTrack() {
  const { id } = useParams();
  const [trackData, setTrackData] = useState([]); // Correct useState syntax
  const [loading, setLoading] = useState(true); // Add loading state

  const currentPath = window.location.pathname;
  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "Appraisal Management", path: "/hr/appraisal" },

    { title: "Track", path: `${currentPath}` },
  ];

  useEffect(() => {
    const fetchAppraisalTrack = async () => {
      console.log("Fetching Appraisal Track...");
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found!");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${get_form_track(id)}`, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await response.json();
        setTrackData(data.file_history); // Set fetched data
        setLoading(false); // Set loading to false once data is fetched
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch Appraisal Track:", error);
        setLoading(false); // Set loading to false if there’s an error
      }
    };
    fetchAppraisalTrack(); // Ensure function is called
  }, []); // Adding empty dependency array to run only once

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <TrackTable
      title="Appraisal Track"
      data={trackData}
      formType="appraisal"
      exampleItems={exampleItems}
    />
  );
}

export default AppraisalTrack;

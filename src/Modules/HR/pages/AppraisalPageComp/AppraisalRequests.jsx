import React, { useEffect, useState } from "react";
import RequestsTable from "../../components/tables/RequestsTable";
import { get_appraisal_requests } from "../../../../routes/hr/index"; // Ensure this is the correct import path
import LoadingComponent from "../../components/Loading"; // Ensure this is the correct import path

function AppraisalRequests() {
  const [requestData, setRequestData] = useState([]); // Correct useState syntax
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchAppraisalRequests = async () => {
      console.log("Fetching Appraisal requests...");
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found!");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(get_appraisal_requests, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await response.json();
        setRequestData(data.appraisal_requests); // Set fetched data
        setLoading(false); // Set loading to false once data is fetched
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch Appraisal requests:", error);
        setLoading(false); // Set loading to false if there’s an error
      }
    };
    fetchAppraisalRequests(); // Ensure function is called
  }, []); // Adding empty dependency array to run only once

  if (loading) {
    return <LoadingComponent />;
  }

  return <RequestsTable title="Appraisal Requests" data={requestData} />;
}

export default AppraisalRequests;

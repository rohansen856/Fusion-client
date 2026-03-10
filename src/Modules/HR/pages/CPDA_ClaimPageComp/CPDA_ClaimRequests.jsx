import React, { useEffect, useState } from "react";
import RequestsTable from "../../components/tables/RequestsTable";
import { get_cpda_claim_requests } from "../../../../routes/hr/index"; // Ensure this is the correct import path
import LoadingComponent from "../../components/Loading"; // Ensure this is the correct import path

function CPDA_ClaimRequests() {
  const [requestData, setRequestData] = useState([]); // Correct useState syntax
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchCPDAClaimRequests = async () => {
      console.log("Fetching CPDA Claim requests...");
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found!");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(get_cpda_claim_requests, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await response.json();
        setRequestData(data.cpda_claim_requests); // Set fetched data
        setLoading(false); // Set loading to false once data is fetched
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch CPDA Claim requests:", error);
        setLoading(false); // Set loading to false if there’s an error
      }
    };
    fetchCPDAClaimRequests(); // Ensure function is called
  }, []); // Adding empty dependency array to run only once

  if (loading) {
    return <LoadingComponent />;
  }

  return <RequestsTable title="CPDA Claim Requests" data={requestData} />;
}

export default CPDA_ClaimRequests;

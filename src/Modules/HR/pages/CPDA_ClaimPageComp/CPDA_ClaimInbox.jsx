import React, { useEffect, useState } from "react";
import InboxTable from "../../components/tables/InboxTable";
import { get_cpda_claim_inbox } from "../../../../routes/hr/index"; // Ensure this is the correct import path
import LoadingComponent from "../../components/Loading"; // Ensure this is the correct import path

function CPDA_ClaimInbox() {
  const [inboxData, setInboxData] = useState([]); // Correct useState syntax
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchCPDAClaimInbox = async () => {
      console.log("Fetching CPDA Claim inbox...");
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found!");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(get_cpda_claim_inbox, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await response.json();
        setInboxData(data.cpda_claim_inbox); // Set fetched data
        setLoading(false); // Set loading to false once data is fetched
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch CPDA Claim inbox:", error);
        setLoading(false); // Set loading to false if there’s an error
      }
    };
    fetchCPDAClaimInbox(); // Ensure function is called
  }, []); // Adding empty dependency array to run only once

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <InboxTable
      title="CPDA Claim Inbox"
      data={inboxData}
      formType="cpda_claim"
    />
  );
}

export default CPDA_ClaimInbox;

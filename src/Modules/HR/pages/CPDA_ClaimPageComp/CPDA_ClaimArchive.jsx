import React, { useEffect, useState } from "react";
import ArchiveTable from "../../components/tables/ArchiveTable"; // Ensure the import path is correct
import { get_cpda_claim_archive } from "../../../../routes/hr/index"; // Ensure the import path is correct
import LoadingComponent from "../../components/Loading"; // Ensure the import path is correct

function CPDA_ClaimArchive() {
  const [archiveData, setArchiveData] = useState([]); // Correct useState syntax
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchCPDAClaimArchive = async () => {
      console.log("Fetching CPDA Claim archive...");
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found!");
        setLoading(false); // Set loading to false if no token
        return;
      }
      try {
        const response = await fetch(get_cpda_claim_archive, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await response.json();
        setArchiveData(data.cpda_claim_archive); // Set fetched data
        setLoading(false); // Set loading to false once data is fetched
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch CPDA Claim archive:", error);
        setLoading(false); // Set loading to false if there’s an error
      }
    };
    fetchCPDAClaimArchive(); // Ensure function is called
  }, []); // Add dependency array to run only once

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <ArchiveTable
      title="CPDA Claim Archive"
      data={archiveData}
      formType="cpda_claim"
    />
  );
}

export default CPDA_ClaimArchive;

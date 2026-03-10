import React, { useEffect, useState } from "react";
import ArchiveTable from "../../components/tables/ArchiveTable"; // Ensure the import path is correct
import { get_cpda_adv_archive } from "../../../../routes/hr/index"; // Ensure the import path is correct
import LoadingComponent from "../../components/Loading"; // Ensure the import path is correct

function Cpda_ADVANCEArchive() {
  const [archiveData, setArchiveData] = useState([]); // Correct useState syntax
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchCPDAArchive = async () => {
      console.log("Fetching CPDA Advance archive...");
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found!");
        setLoading(false); // Set loading to false if no token
        return;
      }
      try {
        const response = await fetch(get_cpda_adv_archive, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await response.json();
        setArchiveData(data.cpda_adv_archive); // Set fetched data
        setLoading(false); // Set loading to false once data is fetched
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch CPDA Advance archive:", error);
        setLoading(false); // Set loading to false if there’s an error
      }
    };
    fetchCPDAArchive(); // Ensure function is called
  }, []); // Add dependency array to run only once

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <ArchiveTable
      title="CPDA Adv Archive"
      data={archiveData}
      formType="cpda_adv"
    />
  );
}

export default Cpda_ADVANCEArchive;

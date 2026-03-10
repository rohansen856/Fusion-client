import React, { useEffect, useState } from "react";
import InboxTable from "../../components/tables/InboxTable";
import { get_form_track, get_ltc_inbox } from "../../../../routes/hr/index"; // Ensure this is the correct import path
import LoadingComponent from "../../components/Loading"; // Ensure this is the correct import path

function LTCTrack() {
  const [trackData, setTrackData] = useState([]); // Correct useState syntax
  const [loading, setLoading] = useState(true); // Add loading state

  const currentPath = window.location.pathname;
  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "LTC", path: "/hr/ltc" },

    { title: "Track", path: `${currentPath}` },
  ];

  useEffect(() => {
    const fetchLTCTrack = async () => {
      console.log("Fetching LTC Track...");
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
        console.error("Failed to fetch LTC Track:", error);
        setLoading(false); // Set loading to false if there’s an error
      }
    };
    fetchLTCTrack(); // Ensure function is called
  }, []); // Adding empty dependency array to run only once

  if (loading) {
    return <LoadingComponent />;
  }

  // return <InboxTable title="LTC Inbox" data={inboxData} />;
  return (
    <TrackTable
      title="Track File"
      exampleItems={exampleItems}
      data={trackData}
    />
  );
}

export default LTCTrack;

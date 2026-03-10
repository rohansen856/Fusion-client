import React, { useEffect, useState, lazy } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom"; // Import Link for navigation
import { host } from "../../../routes/globalRoutes/index.jsx";

// Lazy load SpecialTable component
const SpecialTable = lazy(() => import("./SpecialTable.jsx"));

// Random data generators for empty fields
const generateRandomData = () => {
  const randomInterests = [
    "AI",
    "Data Science",
    "Robotics",
    "Quantum Computing",
    "Computer Vision",
  ];
  const randomCabins = [
    "Cabin 101",
    "Cabin 202",
    "Cabin 303",
    "Cabin 404",
    "Cabin 505",
  ];
  const randomOrchidIds = [
    "ORCHID1234",
    "ORCHID5678",
    "ORCHID9101",
    "ORCHID1121",
    "ORCHID3141",
  ];
  const randomScholarLinks = [
    "https://scholar.google.com/citations?user=abcd1234",
    "https://scholar.google.com/citations?user=efgh5678",
    "https://scholar.google.com/citations?user=ijkl9101",
    "https://scholar.google.com/citations?user=mnop1121",
    "https://scholar.google.com/citations?user=qrst3141",
  ];
  const randomQualifications = ["PhD", "MSc", "MTech", "BTech"]; // Removed MBA

  return {
    research_interest:
      randomInterests[Math.floor(Math.random() * randomInterests.length)],
    place_of_cabin:
      randomCabins[Math.floor(Math.random() * randomCabins.length)],
    orchid_id:
      randomOrchidIds[Math.floor(Math.random() * randomOrchidIds.length)],
    google_scholar_link:
      randomScholarLinks[Math.floor(Math.random() * randomScholarLinks.length)],
    highest_qualification:
      randomQualifications[
        Math.floor(Math.random() * randomQualifications.length)
      ],
  };
};

const columns = [
  {
    accessorKey: "id",
    header: "Faculty ID",
    cell: ({ row }) => (
      <Link
        to={`/eis/profile/${row.original.id}`} // Navigate to the faculty profile page
        style={{ textDecoration: "none", color: "blue" }}
      >
        {row.original.id}
      </Link>
    ),
  },
  {
    accessorKey: "title", // Change this to "title" to fetch Faculty Designation
    header: "Faculty Designation",
  },
  {
    accessorKey: "research_interest",
    header: "Research Interest",
    cell: ({ row }) =>
      row.original.research_interest || generateRandomData().research_interest,
  },
  {
    accessorKey: "place_of_cabin",
    header: "Place of Cabin",
    cell: ({ row }) =>
      row.original.place_of_cabin || generateRandomData().place_of_cabin,
  },
  {
    accessorKey: "orchid_id",
    header: "Orchid ID",
    cell: ({ row }) => row.original.orchid_id || generateRandomData().orchid_id,
  },
  {
    accessorKey: "google_scholar_link",
    header: "Google Scholar Link",
    cell: ({ row }) => (
      <a
        href={
          row.original.google_scholar_link ||
          generateRandomData().google_scholar_link
        }
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "blue" }}
      >
        {row.original.google_scholar_link || "No link available"}
      </a>
    ),
  },
  {
    accessorKey: "highest_qualification",
    header: "Highest Qualification",
    cell: ({ row }) =>
      row.original.highest_qualification ||
      generateRandomData().highest_qualification,
  },
];

function Faculty({ branch }) {
  const [facultyData, setFacultyData] = useState([]);

  if (branch === "DS") branch = "Design";
  if (branch === "Natural Science") branch = "Natural_Science";

  // Fetch faculty data from API with Auth Token
  useEffect(() => {
    const fetchUrl = `${host}/dep/api/faculty-data/${branch}/`;

    fetch(fetchUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("authToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setFacultyData(data);
      })
      .catch((error) => {
        console.error("There was a problem with your fetch operation:", error);
      });
  }, [branch]);

  return (
    <div
      style={{
        overflowX: "auto", // Enable horizontal scrolling
        width: "100%", // Ensure the container takes the full width
        marginTop: "10px", // Add some spacing
      }}
    >
      <SpecialTable
        title={`Faculties in ${branch} Department`}
        columns={columns}
        data={facultyData}
        rowOptions={["10", "20", "30"]}
      />
    </div>
  );
}

Faculty.propTypes = {
  branch: PropTypes.string.isRequired,
};

export default Faculty;

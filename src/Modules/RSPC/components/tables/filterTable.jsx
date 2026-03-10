import {
  Button,
  Flex,
  Paper,
  Title,
  Text,
  Group,
  Menu,
  Divider,
  MultiSelect,
  Loader,
  Alert,
  Table,
  ScrollArea,
  Pagination,
  Tabs,
  Box,
} from "@mantine/core";
import {
  IconFilter,
  IconX,
  IconDownload,
  IconChevronDown,
  IconAlertCircle,
  IconTable,
} from "@tabler/icons-react";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useState, useEffect } from "react";
import classes from "../../styles/formStyle.module.css";
import {
  getAllFacultyIdsRoute,
  dataTypeToEndpoint,
} from "../../../../routes/RSPCRoutes/additional";

function FilterTable() {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDataTypes, setSelectedDataTypes] = useState([]);
  const [selectedSubTypes, setSelectedSubTypes] = useState({});
  const [filteredDataByType, setFilteredDataByType] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputs, setInputs] = useState({
    fromDate: "",
    toDate: "",
  });
  const [activeTab, setActiveTab] = useState(null);

  // Pagination state - now per data type
  const [currentPages, setCurrentPages] = useState({});
  const rowsPerPage = 20;

  // Department options
  const departments = [
    { value: "ALL", label: "All Departments" },
    { value: "CSE", label: "Computer Science and Engineering" },
    { value: "ECE", label: "Electronics and Communication Engineering" },
    { value: "ME", label: "Mechanical Engineering" },
    { value: "SM", label: "Smart Manufacturing" },
    { value: "DESIGN", label: "Design Department" },
  ];

  // Data type options with sub-options
  const dataTypes = [
    {
      value: "publications",
      label: "Publications",
      subTypes: [
        { value: "publications_journal", label: "Journal" },
        { value: "publications_books", label: "Books" },
        { value: "publications_conference", label: "Conference" },
      ],
    },
    {
      value: "projects",
      label: "Projects",
      subTypes: [
        { value: "projects_research", label: "Research Projects" },
        { value: "projects_patents", label: "Patents" },
        { value: "projects_consultancy", label: "Consultancy Projects" },
      ],
    },
    {
      value: "thesis",
      label: "Thesis Supervision",
      subTypes: [
        { value: "thesis_pg", label: "PG Thesis" },
        { value: "thesis_phd", label: "PhD Thesis" },
      ],
    },
    {
      value: "events_organized",
      label: "Events Organized",
      subTypes: [{ value: "events_organized_workshop", label: "Workshop" }],
    },
    {
      value: "visits",
      label: "Visits",
      subTypes: [
        { value: "visits_foreign", label: "Foreign" },
        { value: "visits_indian", label: "Indian" },
      ],
    },
    {
      value: "events_attended",
      label: "Events Attended",
      subTypes: [{ value: "events_attended", label: "Events Attended" }],
    },
    {
      value: "others",
      label: "Others",
      subTypes: [
        { value: "others_achievements", label: "Achievements" },
        { value: "others_honors", label: "Honors" },
      ],
    },
    {
      value: "expert_lectures",
      label: "Expert Lectures or Invited Talks",
      subTypes: [{ value: "expert_lectures", label: "EL or IT" }],
    },
  ];

  // Column definitions for each data type
  const columnDefinitions = {
    publications_books: ["title", "authors", "p_type", "pyear", "publisher"],
    projects_consultancy: [
      "title",
      "consultants",
      "client",
      "start_date",
      "end_date",
      "financial_outlay",
    ],
    projects_research: [
      "pi",
      "co_pi",
      "funding_agency",
      "status",
      "start_date",
      "finish_date",
      "sub",
      "financial_outlay",
      "title",
    ],
    visits_foreign: ["country", "place", "purpose", "start_date", "end_date"],
    visits_indian: ["country", "place", "purpose", "start_date", "end_date"],
    publications_journal: [
      "title_paper",
      "authors",
      "co_authors",
      "venue",
      "year",
    ],
    publications_conference: [
      "title_paper",
      "authors",
      "co_authors",
      "name",
      "year",
    ],
    projects_patents: [
      "title",
      "p_no",
      "status",
      "earnings",
      "p_year",
      "a_month",
    ],
    events_organized_workshop: [
      "role",
      "name",
      "venue",
      "sponsoring_agency",
      "type",
      "start_date",
      "end_date",
    ],
    events_attended: ["name", "venue", "role1", "start_date", "end_date"],
    thesis_pg: ["title", "rollno", "s_name", "s_year", "a_month"],
    thesis_phd: ["title", "rollno", "s_name", "s_year", "a_month"],
    others_achievements: ["type", "a_day", "a_month", "a_year", "details"],
    others_honors: ["title", "period", "description"],
    expert_lectures: ["l_type", "place", "title", "l_date"],
  };

  // Column display names
  const columnDisplayNames = {
    title: "Title",
    authors: "Authors",
    p_type: "Publish Type",
    pyear: "Year",
    publisher: "Publisher",
    consultants: "Consultant",
    client: "Client",
    start_date: "Start Date",
    end_date: "End Date",
    financial_outlay: "Financial Outlay",
    country: "Country",
    place: "Place",
    purpose: "Purpose",
    title_paper: "Title Of Journal",
    co_authors: "Co-Authors",
    venue: "Journal Name",
    year: "Year",
    name: "Name",
    p_no: "Patent Number",
    status: "Status",
    earnings: "Earnings",
    p_year: "Year",
    a_month: "Month",
    rollno: "Roll Number",
    s_name: "Name",
    s_year: "Year",
    pi: "Principal Investigator",
    co_pi: "Co-Principal Investigator",
    funding_agency: "Funding Agency",
    finish_date: "Finish Date",
    sub: "Subject",
    role: "Role",
    sponsoring_agency: "Sponsoring Agency",
    type: "Type",
    conference_name: "Conference Name",
    conference_venue: "Conference Venue",
    conference_role: "Conference Role",
    conference_start_date: "Conference Start Date",
    conference_end_date: "Conference End Date",
    a_day: "Day",
    a_year: "Year",
    details: "Details",
    period: "Period",
    description: "Description",
    l_date: "Date",
  };

  // Get columns to display based on selected data type and subtype
  const getColumnsToDisplay = (subType) => {
    return columnDefinitions[subType] || [];
  };

  // Get current page data for a specific subtype
  const getCurrentPageData = (subType) => {
    const data = filteredDataByType[subType] || [];
    const page = currentPages[subType] || 1;
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Update the selectedDepartment state to handle multiple departments
  // Replace the single selectedDepartment state with this
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  // Update the getAllFacultyIdsRoute function to accept department filter
  // Replace the existing function with this modified version
  const fetchFacultyList = async (selectedDepts = []) => {
    try {
      const response = await axios.get(getAllFacultyIdsRoute);
      let formattedFacultyList = response.data.map((faculty) => ({
        value: String(faculty.user_id),
        label: `${faculty.user_id} (${faculty.id})`,
        department_id: faculty.department_id,
      }));

      // Filter faculty list by selected departments if any are selected
      if (selectedDepts.length > 0 && !selectedDepts.includes("ALL")) {
        // Map department values to their IDs
        const deptIdMap = {
          CSE: 51,
          ECE: 30,
          ME: 37,
          SM: 53,
          DESIGN: 44,
        };

        // Get department IDs from selected department values
        const selectedDeptIds = selectedDepts
          .map((dept) => deptIdMap[dept])
          .filter((id) => id);

        // Filter faculty list by department IDs
        formattedFacultyList = formattedFacultyList.filter((faculty) =>
          selectedDeptIds.includes(faculty.department_id),
        );
      }

      setFacultyList(formattedFacultyList);
      // eslint-disable-next-line no-shadow
    } catch (error) {
      console.error("Error fetching faculty list:", error);
      setError("Failed to fetch faculty list. Please try again later.");
    }
  };

  // Update the useEffect hook to call the new fetchFacultyList function
  useEffect(() => {
    fetchFacultyList();
  }, []);

  // Get sub-types for a specific data type
  const getSubTypes = (dataType) => {
    const selectedType = dataTypes.find((type) => type.value === dataType);
    return selectedType ? selectedType.subTypes : [];
  };

  // Handle input change
  // eslint-disable-next-line no-unused-vars
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle data type selection change
  const handleDataTypeChange = (selectedValues) => {
    setSelectedDataTypes(selectedValues);

    // Initialize or update selectedSubTypes for each data type
    const updatedSubTypes = { ...selectedSubTypes };

    // Remove entries for deselected data types
    Object.keys(updatedSubTypes).forEach((key) => {
      const dataType = key.split("_")[0]; // Extract the data type prefix
      if (!selectedValues.includes(dataType)) {
        delete updatedSubTypes[key];
      }
    });

    setSelectedSubTypes(updatedSubTypes);
  };

  // Handle sub-type selection change for a specific data type
  const handleSubTypeChange = (dataType, selectedValues) => {
    setSelectedSubTypes((prev) => ({
      ...prev,
      [dataType]: selectedValues,
    }));
  };

  // Prepare filter parameters for a specific faculty and subtype
  const prepareFilterParams = (faculty, subType) => {
    const formData = new FormData();

    if (faculty) {
      formData.append("pf_no", faculty);
    }

    if (
      selectedDepartments.length > 0 &&
      !selectedDepartments.includes("ALL")
    ) {
      // Map department values to their IDs
      const deptIdMap = {
        CSE: 51,
        ECE: 30,
        ME: 37,
        SM: 53,
        DESIGN: 44,
      };

      // Get department IDs from selected department values
      const selectedDeptIds = selectedDepartments
        .map((dept) => deptIdMap[dept])
        .filter((id) => id)
        .join(",");

      formData.append("department_ids", selectedDeptIds);
    }

    // Add date range parameters
    if (inputs.fromDate) {
      formData.append("start_date", inputs.fromDate);
    }

    if (inputs.toDate) {
      formData.append("end_date", inputs.toDate);
    }

    // Add specific parameters based on data type
    if (subType.startsWith("publications_")) {
      if (subType === "publications_journal") {
        formData.append("rtype", "Journal");
      } else if (subType === "publications_conference") {
        formData.append("rtype", "Conference");
      }
    } else if (subType.startsWith("thesis_")) {
      if (subType === "thesis_pg") {
        formData.append("degree_type", "1"); // 1 for M.Tech
      } else if (subType === "thesis_phd") {
        formData.append("degree_type", "2"); // 2 for Ph.D
      }
    } else if (subType.startsWith("visits_")) {
      if (subType === "visits_foreign") {
        formData.append("v_type", "1"); // 1 for Foreign
      } else if (subType === "visits_indian") {
        formData.append("v_type", "2"); // 2 for Indian
      }
    }

    return formData;
  };

  // Get all selected subtypes across all data types
  const getAllSelectedSubTypes = () => {
    const allSubTypes = [];

    selectedDataTypes.forEach((dataType) => {
      const subTypesForDataType = selectedSubTypes[dataType] || [];
      if (subTypesForDataType.length > 0) {
        allSubTypes.push(...subTypesForDataType);
      } else {
        // If no subtypes selected for this data type, use all available subtypes
        const availableSubTypes = getSubTypes(dataType);
        allSubTypes.push(...availableSubTypes.map((st) => st.value));
      }
    });

    return allSubTypes;
  };

  // Update the handleFilter function to work with the new department selection logic
  const handleFilter = async () => {
    setIsLoading(true);
    setError(null);
    setFilteredDataByType({});

    try {
      if (selectedDataTypes.length === 0) {
        throw new Error("Please select at least one data type");
      }

      // Check if we need faculty selection
      if (
        !selectedDepartments.includes("ALL") &&
        selectedFaculties.length === 0
      ) {
        throw new Error("Please select at least one faculty");
      }

      const allSubTypes = getAllSelectedSubTypes();
      if (allSubTypes.length === 0) {
        throw new Error("Please select at least one sub-type");
      }

      // Initialize results object
      const results = {};

      // If "All Departments" is selected, we need to fetch all faculties first
      let facultiesToProcess = selectedFaculties;

      if (selectedDepartments.includes("ALL")) {
        // Fetch all faculties if "All Departments" is selected
        try {
          const response = await axios.get(getAllFacultyIdsRoute);
          facultiesToProcess = response.data.map((faculty) =>
            String(faculty.user_id),
          );
          // eslint-disable-next-line no-shadow
        } catch (error) {
          console.error("Error fetching all faculty list:", error);
          throw new Error(
            "Failed to fetch faculty list. Please try again later.",
          );
        }
      }

      // For each faculty and subtype combination, make a request
      // eslint-disable-next-line no-restricted-syntax
      for (const faculty of facultiesToProcess) {
        // eslint-disable-next-line no-restricted-syntax
        for (const subType of allSubTypes) {
          // Check if we have an endpoint for this subtype
          const endpoint = dataTypeToEndpoint[subType];
          if (!endpoint) {
            console.warn(`No endpoint found for subtype: ${subType}`);
            // eslint-disable-next-line no-continue
            continue;
          }

          const formData = prepareFilterParams(faculty, subType);

          try {
            // eslint-disable-next-line no-await-in-loop
            const response = await axios.post(endpoint, formData);

            if (response.data && Array.isArray(response.data)) {
              // Initialize the subtype array if it doesn't exist
              if (!results[subType]) {
                results[subType] = [];
              }

              // Add faculty identifier to each record
              const dataWithFaculty = response.data.map((item) => ({
                ...item,
                faculty_id: faculty,
              }));

              // Append the results
              results[subType] = [...results[subType], ...dataWithFaculty];
            }
          } catch (subError) {
            console.error(
              `Error fetching data for faculty ${faculty}, subtype ${subType}:`,
              subError,
            );
            // Continue with other requests even if one fails
          }
        }
      }

      // Update state with all results
      setFilteredDataByType(results);

      // Initialize pagination for each subtype
      const newCurrentPages = {};
      Object.keys(results).forEach((subType) => {
        newCurrentPages[subType] = 1;
      });
      setCurrentPages(newCurrentPages);

      // Set active tab to the first subtype that has data
      const firstSubTypeWithData = Object.keys(results).find(
        (subType) => results[subType] && results[subType].length > 0,
      );

      if (firstSubTypeWithData) {
        setActiveTab(firstSubTypeWithData);
      }
      // eslint-disable-next-line no-shadow
    } catch (error) {
      console.error("Error filtering data:", error);
      setError(error.message || "Failed to filter data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handleClearFilter function to reset the new state
  const handleClearFilter = () => {
    setSelectedFaculties([]);
    setSelectedDepartments([]);
    setSelectedDataTypes([]);
    setSelectedSubTypes({});
    setFilteredDataByType({});
    setError(null);
    setInputs({
      fromDate: "",
      toDate: "",
    });
    setCurrentPages({});
    setActiveTab(null);
  };

  // Filter data to only include specified columns
  const filterDataColumns = (data, subType) => {
    const columnsToDisplay = getColumnsToDisplay(subType);

    if (columnsToDisplay.length === 0 || data.length === 0) {
      return data;
    }

    return data.map((item) => {
      const filteredItem = {};
      columnsToDisplay.forEach((column) => {
        if (item[column] !== undefined) {
          filteredItem[column] = item[column];
        }
      });
      // Always include faculty_id if it exists
      if (item.faculty_id) {
        filteredItem.faculty_id = item.faculty_id;
      }
      return filteredItem;
    });
  };

  // Convert data to CSV
  const convertToCSV = (data, subType) => {
    const filteredData = filterDataColumns(data, subType);
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    return csvOutput;
  };

  // Convert all data to XLSX with multiple sheets
  const convertAllToXLSX = () => {
    const workbook = XLSX.utils.book_new();

    Object.entries(filteredDataByType).forEach(([subType, data]) => {
      if (data && data.length > 0) {
        const filteredData = filterDataColumns(data, subType);
        const worksheet = XLSX.utils.json_to_sheet(filteredData);

        // Get a readable name for the sheet
        // eslint-disable-next-line no-use-before-define
        const dataTypeInfo = getDataTypeInfoFromSubType(subType);
        const sheetName = dataTypeInfo
          ? `${dataTypeInfo.dataTypeLabel.slice(0, 10)}_${dataTypeInfo.subTypeLabel.slice(0, 10)}`
          : subType.replace(/_/g, " ").slice(0, 20);

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    });

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    return new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  };

  // Convert single data type to XLSX
  const convertToXLSX = (data, subType) => {
    const filteredData = filterDataColumns(data, subType);
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    return new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  };

  // Convert data to PDF
  const convertToPDF = (data, subType) => {
    const filteredData = filterDataColumns(data, subType);
    // eslint-disable-next-line new-cap
    const doc = new jsPDF("landscape");

    // Get readable names for the data type and subtype
    // eslint-disable-next-line no-use-before-define
    const dataTypeInfo = getDataTypeInfoFromSubType(subType);
    const dataTypeLabel = dataTypeInfo ? dataTypeInfo.dataTypeLabel : "Data";
    const subTypeLabel = dataTypeInfo ? dataTypeInfo.subTypeLabel : subType;

    // Add title
    const title = `${dataTypeLabel} - ${subTypeLabel} Report`;
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    // Add filter information
    doc.setFontSize(10);
    let yPos = 25;

    if (selectedFaculties.length > 0) {
      doc.text(`Faculty: ${selectedFaculties.join(", ")}`, 14, yPos);
      yPos += 5;
    }
    if (selectedDepartment) {
      doc.text(`Department: ${selectedDepartment}`, 14, yPos);
      yPos += 5;
    }
    if (inputs.fromDate) {
      doc.text(`From Date: ${inputs.fromDate}`, 14, yPos);
      yPos += 5;
    }
    if (inputs.toDate) {
      doc.text(`To Date: ${inputs.toDate}`, 14, yPos);
      yPos += 5;
    }

    // Create table
    if (filteredData.length > 0) {
      const columnsToDisplay = getColumnsToDisplay(subType);
      // Add faculty_id to columns if it exists in the data
      if (filteredData[0].faculty_id) {
        columnsToDisplay.unshift("faculty_id");
      }

      const headers = columnsToDisplay.map(
        (column) => columnDisplayNames[column] || column,
      );

      const rows = filteredData.map((item) =>
        columnsToDisplay.map((column) =>
          item[column] !== null && item[column] !== undefined
            ? String(item[column])
            : "",
        ),
      );

      doc.autoTable({
        head: [headers],
        body: rows,
        startY: yPos + 5,
        margin: { top: 35 },
        styles: { overflow: "linebreak", cellWidth: "auto", fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
        columnStyles: {
          // You can add specific column styles here if needed
        },
        // eslint-disable-next-line no-shadow
        didDrawPage: (data) => {
          // Add page numbers
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10,
          );
        },
      });
    } else {
      doc.text("No data available", 14, yPos + 5);
    }

    return doc.output("blob");
  };

  // Get data type and subtype labels from subtype value
  const getDataTypeInfoFromSubType = (subType) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const dataType of dataTypes) {
      // eslint-disable-next-line no-restricted-syntax
      for (const subTypeObj of dataType.subTypes) {
        if (subTypeObj.value === subType) {
          return {
            dataTypeLabel: dataType.label,
            subTypeLabel: subTypeObj.label,
          };
        }
      }
    }
    return null;
  };

  // Handle download for a specific subtype
  const handleDownload = async (format, subType) => {
    const data = filteredDataByType[subType];

    if (!data || data.length === 0) {
      setError(`No data to download for ${subType}`);
      return;
    }

    try {
      let blob;
      let fileName;

      // Get readable names for the data type and subtype
      const dataTypeInfo = getDataTypeInfoFromSubType(subType);
      const dataTypeLabel = dataTypeInfo
        ? dataTypeInfo.dataTypeLabel.replace(/\s+/g, "_")
        : subType.split("_")[0];
      const subTypeLabel = dataTypeInfo
        ? dataTypeInfo.subTypeLabel.replace(/\s+/g, "_")
        : subType.split("_")[1];

      switch (format) {
        case "csv":
          // eslint-disable-next-line no-case-declarations
          const csvData = convertToCSV(data, subType);
          blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
          fileName = `${dataTypeLabel}_${subTypeLabel}_report.csv`;
          break;

        case "xlsx":
          blob = convertToXLSX(data, subType);
          fileName = `${dataTypeLabel}_${subTypeLabel}_report.xlsx`;
          break;

        case "pdf":
          blob = convertToPDF(data, subType);
          fileName = `${dataTypeLabel}_${subTypeLabel}_report.pdf`;
          break;

        default:
          throw new Error("Unsupported format");
      }

      saveAs(blob, fileName);
      // eslint-disable-next-line no-shadow
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      setError(`Failed to download ${format}. ${error.message}`);
    }
  };

  // Add this new function to create a single PDF with all tables
  // ENHANCED: New function to combine all tables into a single PDF document
  const convertAllToPDF = () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF("landscape");

    // Add title
    doc.setFontSize(18);
    doc.text("Combined Data Report", 14, 15);

    // Add filter information
    doc.setFontSize(10);
    let yPos = 25;

    if (selectedFaculties.length > 0) {
      doc.text(`Faculty: ${selectedFaculties.join(", ")}`, 14, yPos);
      yPos += 5;
    }
    if (selectedDepartment) {
      doc.text(`Department: ${selectedDepartment}`, 14, yPos);
      yPos += 5;
    }
    if (inputs.fromDate) {
      doc.text(`From Date: ${inputs.fromDate}`, 14, yPos);
      yPos += 5;
    }
    if (inputs.toDate) {
      doc.text(`To Date: ${inputs.toDate}`, 14, yPos);
      yPos += 5;
    }

    // Initial Y position for the first table
    let currentY = yPos + 10;

    // Process each data type and add to the PDF
    Object.entries(filteredDataByType).forEach(([subType, data], index) => {
      if (data && data.length > 0) {
        // Get readable names for the data type and subtype
        const dataTypeInfo = getDataTypeInfoFromSubType(subType);
        const dataTypeLabel = dataTypeInfo
          ? dataTypeInfo.dataTypeLabel
          : "Data";
        const subTypeLabel = dataTypeInfo ? dataTypeInfo.subTypeLabel : subType;

        // Add section title for this table
        doc.setFontSize(14);
        doc.text(`${dataTypeLabel} - ${subTypeLabel}`, 14, currentY);
        currentY += 8;

        // Filter data to include only relevant columns
        const filteredData = filterDataColumns(data, subType);

        // Prepare table headers and rows
        const columnsToDisplay = getColumnsToDisplay(subType);
        // Add faculty_id to columns if it exists in the data
        if (filteredData[0].faculty_id) {
          columnsToDisplay.unshift("faculty_id");
        }

        const headers = columnsToDisplay.map(
          (column) => columnDisplayNames[column] || column,
        );

        const rows = filteredData.map((item) =>
          columnsToDisplay.map((column) =>
            item[column] !== null && item[column] !== undefined
              ? String(item[column])
              : "",
          ),
        );

        // Add the table to the PDF
        doc.autoTable({
          head: [headers],
          body: rows,
          startY: currentY,
          margin: { top: 35 },
          styles: { overflow: "linebreak", cellWidth: "auto", fontSize: 8 },
          headStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] },
        });

        // Update the Y position for the next table
        // ENHANCED: Add significant spacing between tables (20 units)
        currentY = doc.lastAutoTable.finalY + 20;

        // Add a page break if we're near the bottom of the page
        if (
          currentY > doc.internal.pageSize.height - 40 &&
          index < Object.keys(filteredDataByType).length - 1
        ) {
          doc.addPage();
          currentY = 20;
        }
      }
    });
    // Add page numbers to all pages
    const totalPages = doc.internal.getNumberOfPages();
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${totalPages}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10,
      );
    }

    return doc.output("blob");
  };

  // Handle download all data types
  const handleDownloadAll = async (format) => {
    if (Object.keys(filteredDataByType).length === 0) {
      setError("No data to download");
      return;
    }

    try {
      if (format === "xlsx") {
        // For XLSX, we can create a single file with multiple sheets
        const blob = convertAllToXLSX();
        saveAs(blob, `all_data_report.xlsx`);
      } else if (format === "pdf") {
        // ENHANCED: Create a single PDF with all tables instead of multiple files
        const blob = convertAllToPDF();
        saveAs(blob, `all_data_report.pdf`);
      } else {
        // For other formats, create a zip file with multiple files
        // This is a simplified approach - in a real app, you might want to use JSZip
        // For now, we'll just download each file separately
        // eslint-disable-next-line no-restricted-syntax
        for (const subType of Object.keys(filteredDataByType)) {
          if (filteredDataByType[subType].length > 0) {
            // eslint-disable-next-line no-await-in-loop
            await handleDownload(format, subType);
          }
        }
      }
      // eslint-disable-next-line no-shadow
    } catch (error) {
      console.error(`Error downloading all data:`, error);
      setError(`Failed to download all data. ${error.message}`);
    }
  };

  // Get human-readable tab label from subtype
  const getTabLabel = (subType) => {
    const dataTypeInfo = getDataTypeInfoFromSubType(subType);
    if (dataTypeInfo) {
      return `${dataTypeInfo.subTypeLabel}`;
    }
    return subType.replace(/_/g, " ");
  };

  return (
    <>
      <Paper padding="lg" shadow="s" className={classes.formContainer}>
        <Title order={2} className={classes.formTitle}>
          Filter Faculty Data
        </Title>

        <Flex
          direction={{ base: "column", md: "row" }}
          gap="md"
          align="flex-start"
          wrap="wrap"
        >
          {/* Update the department selection component to use MultiSelect instead of Select
            and add logic to handle "All Departments" selection */}
          <MultiSelect
            label="Select Department"
            placeholder="Choose department(s)"
            data={departments}
            value={selectedDepartments}
            onChange={(values) => {
              // Check if "ALL" is being selected or deselected
              if (
                values.includes("ALL") &&
                !selectedDepartments.includes("ALL")
              ) {
                // If "ALL" is being selected, only select "ALL"
                setSelectedDepartments(["ALL"]);
                setSelectedFaculties([]);
                setFacultyList([]);
              } else if (
                !values.includes("ALL") &&
                selectedDepartments.includes("ALL")
              ) {
                // If "ALL" is being deselected, clear selection
                setSelectedDepartments([]);
                setSelectedFaculties([]);
                setFacultyList([]);
              } else if (!values.includes("ALL")) {
                // Normal selection of departments (not including "ALL")
                setSelectedDepartments(values);
                setSelectedFaculties([]);
                // Fetch faculty list filtered by selected departments
                fetchFacultyList(values);
              }
            }}
            clearable
            style={{ flex: 1, minWidth: "200px" }}
          />

          {/* Update the faculty selection component to be conditionally rendered
            based on department selection */}
          {selectedDepartments.length > 0 &&
            !selectedDepartments.includes("ALL") && (
              <MultiSelect
                label="Select Faculty"
                placeholder="Choose faculty members"
                data={facultyList}
                value={selectedFaculties}
                onChange={setSelectedFaculties}
                searchable
                clearable
                style={{ flex: 1, minWidth: "200px" }}
              />
            )}

          <MultiSelect
            label="Select Data Types"
            placeholder="Choose data types"
            data={dataTypes.map((type) => ({
              value: type.value,
              label: type.label,
            }))}
            value={selectedDataTypes}
            onChange={handleDataTypeChange}
            clearable
            style={{ flex: 1, minWidth: "200px" }}
          />
        </Flex>

        {/* Update the UI layout for data types and subtypes to have max 2 per row
          Replace the existing sub-type selection section with this */}
        {selectedDataTypes.length > 0 && (
          <Box mt="md">
            <Text fw={500} mb="xs">
              Select Sub-Types for Each Data Type:
            </Text>
            <Flex
              direction={{ base: "column", md: "row" }}
              gap="md"
              align="flex-start"
              wrap="wrap"
            >
              {selectedDataTypes.map((dataType) => {
                const subTypes = getSubTypes(dataType);
                if (subTypes.length === 0) return null;

                return (
                  <MultiSelect
                    key={dataType}
                    label={`${dataTypes.find((dt) => dt.value === dataType)?.label} Sub-Types`}
                    placeholder={`Select ${dataType} sub-types`}
                    data={subTypes}
                    value={selectedSubTypes[dataType] || []}
                    onChange={(values) => handleSubTypeChange(dataType, values)}
                    clearable
                    style={{ flex: "0 0 calc(50% - 8px)", minWidth: "200px" }}
                  />
                );
              })}
            </Flex>
          </Box>
        )}

        <Group mt="xl">
          {/* Update the Filter button's disabled condition to account for "All Departments" selection */}
          <Button
            leftSection={<IconFilter size={16} />}
            onClick={handleFilter}
            loading={isLoading}
            disabled={
              selectedDataTypes.length === 0 ||
              (!selectedDepartments.includes("ALL") &&
                selectedFaculties.length === 0)
            }
          >
            Filter
          </Button>

          <Button
            variant="outline"
            leftSection={<IconX size={16} />}
            onClick={handleClearFilter}
          >
            Clear Filter
          </Button>

          <Menu position="bottom-end">
            <Menu.Target>
              <Button
                variant="light"
                rightSection={<IconChevronDown size={16} />}
                leftSection={<IconDownload size={16} />}
                disabled={Object.keys(filteredDataByType).length === 0}
              >
                Download All
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item onClick={() => handleDownloadAll("pdf")}>
                Download All as PDF
              </Menu.Item>
              <Menu.Item onClick={() => handleDownloadAll("csv")}>
                Download All as CSV
              </Menu.Item>
              <Menu.Item onClick={() => handleDownloadAll("xlsx")}>
                Download All as XLSX (Multi-sheet)
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Paper>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          mt="md"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {isLoading && (
        <Paper
          p="xl"
          radius="md"
          withBorder
          mt="md"
          style={{ textAlign: "center" }}
        >
          <Loader size="md" />
          <Text mt="md">Loading data...</Text>
        </Paper>
      )}

      {!isLoading && Object.keys(filteredDataByType).length > 0 && (
        <Paper padding="lg" shadow="s" className={classes.formContainer}>
          <Flex justify="space-between" align="center" mb="md">
            <Title order={2} className={classes.formTitle}>
              Results (
              {Object.values(filteredDataByType).reduce(
                (sum, arr) => sum + arr.length,
                0,
              )}{" "}
              items)
            </Title>

            {activeTab && filteredDataByType[activeTab]?.length > 0 && (
              <Menu position="bottom-end">
                <Menu.Target>
                  <Button
                    variant="light"
                    rightSection={<IconChevronDown size={16} />}
                    leftSection={<IconDownload size={16} />}
                    size="sm"
                  >
                    Download Current Tab
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item onClick={() => handleDownload("pdf", activeTab)}>
                    Download as PDF
                  </Menu.Item>
                  <Menu.Item onClick={() => handleDownload("csv", activeTab)}>
                    Download as CSV
                  </Menu.Item>
                  <Menu.Item onClick={() => handleDownload("xlsx", activeTab)}>
                    Download as XLSX
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Flex>

          <Divider mb="md" />

          {/* Tabs for different data types */}
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              {Object.entries(filteredDataByType).map(
                ([subType, data]) =>
                  data.length > 0 && (
                    <Tabs.Tab
                      key={subType}
                      value={subType}
                      leftSection={<IconTable size={14} />}
                    >
                      {getTabLabel(subType)} ({data.length})
                    </Tabs.Tab>
                  ),
              )}
            </Tabs.List>

            {Object.entries(filteredDataByType).map(
              ([subType, data]) =>
                data.length > 0 && (
                  <Tabs.Panel key={subType} value={subType} pt="md">
                    <ScrollArea>
                      <Table
                        striped
                        highlightOnHover
                        style={{ minWidth: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr style={{ backgroundColor: "#f8f9fa" }}>
                            {/* Always show faculty_id first */}
                            <th
                              style={{
                                textAlign: "center",
                                padding: "12px 16px",
                                color: "#495057",
                                fontWeight: "600",
                                border: "1px solid #dee2e6",
                                backgroundColor: "#f1f3f5",
                              }}
                            >
                              Faculty ID
                            </th>

                            {getColumnsToDisplay(subType).map(
                              (column, index) => (
                                <th
                                  key={index}
                                  style={{
                                    textAlign: "center",
                                    padding: "12px 16px",
                                    color: "#495057",
                                    fontWeight: "600",
                                    border: "1px solid #dee2e6",
                                    backgroundColor: "#f1f3f5",
                                  }}
                                >
                                  {columnDisplayNames[column] ||
                                    column.replace(/_/g, " ").toUpperCase()}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {getCurrentPageData(subType).map((item, rowIndex) => (
                            <tr
                              key={rowIndex}
                              style={{ backgroundColor: "#fff" }}
                            >
                              {/* Always show faculty_id first */}
                              <td
                                style={{
                                  padding: "12px 16px",
                                  textAlign: "center",
                                  border: "1px solid #dee2e6",
                                  fontWeight: "500",
                                }}
                              >
                                {item.faculty_id || "N/A"}
                              </td>

                              {getColumnsToDisplay(subType).map(
                                (column, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    style={{
                                      padding: "12px 16px",
                                      textAlign: "center",
                                      border: "1px solid #dee2e6",
                                      color:
                                        column === "financial_outlay"
                                          ? "#0d6efd"
                                          : "inherit",
                                      fontWeight:
                                        column === "financial_outlay"
                                          ? "500"
                                          : "normal",
                                    }}
                                  >
                                    {item[column] !== null &&
                                    item[column] !== undefined
                                      ? String(item[column])
                                      : ""}
                                  </td>
                                ),
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </ScrollArea>

                    {data.length > rowsPerPage && (
                      <Pagination
                        total={Math.ceil(data.length / rowsPerPage)}
                        value={currentPages[subType] || 1}
                        onChange={(page) =>
                          setCurrentPages((prev) => ({
                            ...prev,
                            [subType]: page,
                          }))
                        }
                        position="center"
                        mt="lg"
                      />
                    )}
                  </Tabs.Panel>
                ),
            )}
          </Tabs>
        </Paper>
      )}

      {!isLoading &&
        Object.keys(filteredDataByType).length === 0 &&
        selectedDataTypes.length > 0 &&
        !error && (
          <Paper p="md" radius="md" withBorder mt="md">
            <Text align="center" c="dimmed">
              No data found. Try adjusting your filters.
            </Text>
          </Paper>
        )}
    </>
  );
}

export default FilterTable;

import JsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { fetchStaffRoute } from "../../../routes/RSPCRoutes";
import { host } from "../../../routes/globalRoutes";

const calculateProgress = (startDate, durationMonths) => {
  const start = new Date(startDate);
  const now = new Date();
  const end = new Date(start);
  end.setMonth(start.getMonth() + durationMonths);

  const totalTime = end - start;
  const elapsedTime = now - start;
  const progress = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  return Math.round(progress);
};

export const ProjectPDF = async (projectData, staffPositions, budget, role) => {
  const token = localStorage.getItem("authToken");
  if (!token) return console.error("No authentication token found!");

  let staffRequests = [];
  try {
    const response = await axios.get(fetchStaffRoute, {
      params: { "pids[]": [projectData.pid], role, type: 1 },
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    staffRequests = response.data;
  } catch (error) {
    console.error("Error fetching staff requests:", error);
  }

  const doc = new JsPDF();
  const marginY = 20;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(33, 33, 33);
  doc.setFont(undefined, "bold");
  doc.text(projectData.name, 14, marginY);

  // Status Badge
  const statusText = projectData.status;
  const statusFontSize = 13;
  const statusWidth = doc.getTextWidth(statusText);
  const statusHeight = 10;
  const statusX = doc.internal.pageSize.width - statusWidth - 14;
  const statusY = marginY - statusHeight + 3;

  doc.setFontSize(statusFontSize);
  doc.setTextColor(255);
  doc.setFillColor(21, 171, 255);
  doc.roundedRect(statusX, statusY, statusWidth, statusHeight, 5, 5, "F");
  doc.text(
    statusText,
    statusX + statusWidth / 2,
    statusY + statusHeight / 2 + 2,
    { align: "center" },
  );

  let currentY = marginY + 20;

  // Project Progress
  doc.setFontSize(13);
  doc.setTextColor(0);
  doc.setFont(undefined, "bold");
  doc.text("Project Timeline", 105, currentY, { align: "center" });
  const progress = calculateProgress(
    projectData.start_date,
    projectData.duration,
  );
  doc.setDrawColor(200);
  doc.setFillColor(230);
  doc.roundedRect(14, currentY + 4, 180, 8, 4, 4, "F");
  doc.setFillColor(21, 171, 255);
  doc.roundedRect(14, currentY + 4, (progress * 180) / 100, 8, 4, 4, "F");
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.text(`${progress}%`, 100, currentY + 10, { align: "center" });
  currentY += 28;

  // Project Information
  doc.setFontSize(13);
  doc.setTextColor(0);
  doc.setFont(undefined, "bold");
  doc.text("Project Information", 105, currentY, { align: "center" });
  doc.setFont(undefined, "normal");
  currentY += 6;

  autoTable(doc, {
    startY: currentY,
    head: [["Field", "Details"]],
    body: [
      ["Principal Investigator", projectData.pi_name],
      ["Co-PIs", projectData.copis?.join(", ") || "None"],
      ["Department", projectData.dept],
      ["Project Type", projectData.type],
      ["Sponsoring Agency", projectData.sponsored_agency],
      ["Project Category", projectData.category],
      ["Scheme", projectData.scheme],
      [
        "Operated By",
        projectData.access === "Co" ? "Only PI" : "Either PI or Co-PIs",
      ],
      ["Start Date", new Date(projectData.start_date).toLocaleDateString()],
      [
        "Submission Date",
        new Date(projectData.submission_date).toLocaleDateString(),
      ],
      [
        "Sanction Date",
        new Date(projectData.sanction_date).toLocaleDateString(),
      ],
      ["Duration", `${projectData.duration} months`],
      ["Total Proposed Budget", `INR ${projectData.total_budget}`],
      ["Sanctioned Amount", `INR ${projectData.sanctioned_amount}`],
      ["Project Abstract", projectData.description || "N/A"],
    ],
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 110 },
    },
    styles: { fontSize: 11, valign: "middle" },
    headStyles: {
      fillColor: [21, 171, 255],
      textColor: 255,
      fontStyle: "bold",
    },
    theme: "grid",
  });

  currentY = doc.lastAutoTable.finalY + 14;

  if (budget && budget.manpower?.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.setFont(undefined, "bold");
    doc.text("Budget Allocation", 105, currentY, { align: "center" });
    doc.setFont(undefined, "normal");
    currentY += 6;

    const categories = [
      "manpower",
      "travel",
      "contingency",
      "consumables",
      "equipments",
    ];
    const headRow = [
      "Category",
      ...budget.manpower.map((_, i) => `Year ${i + 1}`),
    ];
    const bodyRows = categories.map((cat) => [
      cat.charAt(0).toUpperCase() + cat.slice(1),
      ...budget[cat].map((val) => `INR ${val}`),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [headRow],
      body: bodyRows,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [21, 171, 255], textColor: 255 },
      theme: "grid",
    });

    currentY = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(11);
    doc.setTextColor(33);
    doc.setFont(undefined, "normal");
    doc.text(`Overhead Expenses: INR ${budget.overhead}`, 14, currentY);
    currentY += 14;
  }

  if (
    staffPositions &&
    staffPositions.positions &&
    Object.keys(staffPositions.positions).length > 0
  ) {
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.setFont(undefined, "bold");
    doc.text("Project Personnel", 105, currentY, { align: "center" });
    doc.setFont(undefined, "normal");
    currentY += 6;

    const staffBody = Object.keys(staffPositions.positions).map((pos) => [
      pos,
      staffPositions.positions[pos][0],
      staffPositions.positions[pos][1],
      staffPositions.incumbents[pos]?.map((i) => i.name).join(", ") || "None",
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [
        ["Designation", "Available Spots", "Occupied Spots", "Current Staff"],
      ],
      body: staffBody,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [21, 171, 255], textColor: 255 },
      theme: "grid",
    });

    currentY = doc.lastAutoTable.finalY + 14;
  }

  if (staffRequests && staffRequests.length > 0) {
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.setFont(undefined, "bold");
    doc.text("Staff Requests", 105, currentY, { align: "center" });
    doc.setFont(undefined, "normal");
    currentY += 6;

    const requestBody = staffRequests.map((row) => [
      row.approval,
      row.type,
      row.sid,
      row.person || "TBD",
      row.duration > 0 ? `${row.duration} months` : "---",
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Status", "Designation", "Staff ID", "Name", "Duration"]],
      body: requestBody,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [21, 171, 255], textColor: 255 },
      theme: "grid",
    });

    currentY = doc.lastAutoTable.finalY + 14;
  }

  // Project Documentation Section (only if files exist)
  const fileLinks = [];
  if (projectData.file) {
    fileLinks.push({
      label: "Project Agreement",
      url: `${host}/${projectData.file}`,
    });
  }
  if (projectData.registration_form) {
    fileLinks.push({
      label: "Registration Form",
      url: `${host}/${projectData.registration_form}`,
    });
  }
  if (projectData.end_report) {
    fileLinks.push({
      label: "UC/SE",
      url: `${host}/${projectData.end_report}`,
    });
  }

  if (fileLinks.length > 0) {
    const lineHeight = 8;
    const footerHeight = 20;
    const docHeight = doc.internal.pageSize.height;

    const requiredHeight = fileLinks.length * lineHeight + footerHeight;

    // Page break check
    if (currentY + requiredHeight > docHeight) {
      doc.addPage();
      currentY = 20;
    }

    // Heading
    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.setFont(undefined, "bold");
    doc.text("Project Documentation", 105, currentY, { align: "center" });
    doc.setFont(undefined, "normal");
    currentY += 6;

    // Render hyperlink text (not the raw URL)
    fileLinks.forEach((file, index) => {
      const y = currentY + index * lineHeight;
      doc.setFontSize(11);
      doc.setTextColor(21, 71, 255); // Blue
      doc.setFont(undefined, "normal");
      doc.textWithLink(file.label, 14, y, { url: file.url, underline: true });
    });

    currentY += fileLinks.length * lineHeight + 10;
  }

  // Footer Section (centered, light grey, bottom of page)
  const footerText = `This report was auto-generated through Fusion portal on ${new Date().toLocaleString()}`;
  doc.setFontSize(10);
  doc.setTextColor(120); // Light grey
  doc.setFont(undefined, "normal");
  doc.text(
    footerText,
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 14,
    {
      align: "center",
    },
  );

  doc.save(`${projectData.name.replace(/\s+/g, "_")}_Report.pdf`);
};

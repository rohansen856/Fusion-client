import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { Table, Button, Group, Text } from "@mantine/core";
import { IconPrinter, IconDownload } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import { generate_gradesheet_data } from "../routes/examinationRoutes";
import { useSelector } from "react-redux";
import "../styles/transcript.css";

const PDF_MARGIN = { top: 75, left: 23, right: 23, bottom: 23 }; // 7.5cm top, 2.3cm others
const PAGE_W_MM = 210;
const CONTENT_W_MM = PAGE_W_MM - PDF_MARGIN.left - PDF_MARGIN.right; // 164 mm
const CONTENT_W_PX = Math.round(CONTENT_W_MM * (96 / 25.4)); // ≈ 620 px

async function savePDFFromHTML(htmlStrings, filename) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let firstPage = true;

  for (const htmlString of htmlStrings) {
    const cleanHTML = htmlString
      .replace(/@page\b[^{]*\{[^}]*\}/g, "")
      .replace(/@media\s+print\s*\{[\s\S]*?\}/g, "")
      .replace(/(:\s*)hidden\b/g, "$1none")
      .replace(/border-collapse\s*:\s*collapse/g, "border-collapse:separate;border-spacing:0")
      .replace(/<\/style>/i, `
  body { background: #fff !important; }
</style>`);

    const iframe = document.createElement("iframe");
    iframe.style.cssText = `position:fixed;top:-99999px;left:-99999px;` +
      `width:${CONTENT_W_PX}px;height:10px;border:none;visibility:hidden;`;
    document.body.appendChild(iframe);

    try {
      const iDoc = iframe.contentDocument;
    iDoc.open();
    iDoc.write(cleanHTML);
    iDoc.close();

    await new Promise((r) => setTimeout(r, 250));
    iDoc.body.style.cssText = `margin:0;padding:0;width:${CONTENT_W_PX}px;background:#fff;`;
    iframe.style.height = iDoc.body.scrollHeight + "px";
    await new Promise((r) => setTimeout(r, 150));

    const BORDER = "1px solid #000";
    const NONE   = "none";

    const tables = [
      { sel: "#info-table",   type: "box",        noTopBorder: false },
      { sel: "#course-table", type: "box+header",  noTopBorder: true  },
      { sel: "#spi-table",    type: "grid",        noTopBorder: true  },
      { sel: "#gp-table",     type: "box+col",     noTopBorder: true  },
      { sel: "#abbr-table",   type: "box+col",     noTopBorder: true  },
      { sel: "#ss-table",     type: "box+col",     noTopBorder: true  },
      { sel: "#legend-table", type: "box+rows",    noTopBorder: true  },
    ];

    let spacerHeight = "50pt";
    iDoc.querySelectorAll("tr").forEach((row) => {
      const cells = Array.from(row.querySelectorAll("td, th"));
      if (cells.length > 0 && cells.every((c) => {
        const s = (c.getAttribute("style") || "").replace(/\s/g, "");
        return s.includes("border:none") && /height:[^;]+/.test(s);
      })) {

        const hMatch = (cells[0].getAttribute("style") || "").match(/height\s*:\s*([^;]+)/);
        if (hMatch) spacerHeight = hMatch[1].trim();
        row.remove();
      }
    });

    const legendTbl = iDoc.querySelector("#legend-table");
    if (legendTbl) {
      const gap = iDoc.createElement("div");
      gap.style.height = spacerHeight;
      legendTbl.parentNode.insertBefore(gap, legendTbl.nextSibling);
    }

    tables.forEach(({ sel, type, noTopBorder }) => {
      const tbl = iDoc.querySelector(sel);
      if (!tbl) return;
      const rows = Array.from(tbl.querySelectorAll("tr"));

      tbl.style.borderLeft   = BORDER;
      tbl.style.borderRight  = BORDER;
      tbl.style.borderTop    = noTopBorder ? NONE : BORDER;
      tbl.style.borderBottom = BORDER;

      const lastContentIdx = rows.length - 1;

      rows.forEach((row, rIdx) => {
        const isLastRow  = rIdx === lastContentIdx;
        const cellList   = Array.from(row.querySelectorAll("td, th"));

        cellList.forEach((cell, cIdx) => {
          const normStyle  = (cell.getAttribute("style") || "").replace(/\s/g, "");
          const isFirstCol = cIdx === 0;

          if (normStyle.includes("border:none")) {
            cell.style.border = "none";
            return;
          }

          const origHideLeft = normStyle.includes("border-left:none");
          let bottom, left;

          if (type === "grid") {
            bottom = isLastRow  ? NONE : BORDER;
            left   = (isFirstCol || origHideLeft) ? NONE : BORDER;
          } else if (type === "box+header") {
            bottom = (rIdx === 0 && !isLastRow) ? BORDER : NONE;
            left   = NONE;
          } else if (type === "box+rows") {
            bottom = isLastRow  ? NONE : BORDER;
            left   = NONE;
          } else if (type === "box+col") {
            bottom = NONE;
            left   = isFirstCol ? NONE : BORDER;
          } else {
            bottom = NONE;
            left   = NONE;
          }

          cell.style.borderTop    = NONE;
          cell.style.borderBottom = bottom;
          cell.style.borderLeft   = left;
          cell.style.borderRight  = NONE;
        });
      });
    });

    const canvas = await html2canvas(iDoc.body, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: CONTENT_W_PX,
      height: iDoc.body.scrollHeight,
      windowWidth: CONTENT_W_PX,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgH = (canvas.height / canvas.width) * CONTENT_W_MM;

    if (!firstPage) pdf.addPage();
    pdf.addImage(imgData, "PNG", PDF_MARGIN.left, PDF_MARGIN.top, CONTENT_W_MM, imgH);
    firstPage = false;
    } finally {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }
  }

  pdf.save(filename);
}

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function formatSemesterLabel(semester) {
  if (!semester) return "N/A";
  if (semester.type && semester.type.toLowerCase().includes("summer")) {
    const summerNo = Math.floor((semester.no || 0) / 2);
    return summerNo > 0 ? `Summer ${summerNo}` : `Summer`;
  }
  return String(semester.no);
}

function buildPrintHTML(studentInfo, courses, spi, cpi, semesterLabel, semesterHistory, selectedSemesterNo, selectedIsSummer) {
  const roman = (n) => {
    if (!n || n <= 0 || !isFinite(n)) return String(n ?? 0);
    const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    const syms = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
    let result = "", num = n;
    for (let i = 0; i < vals.length; i++) {
      while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
    }
    return result;
  };

  const isSpecialCourse = (c) => {
    const g = String(c.grade ?? "").trim();
    return g !== "" && !isNaN(Number(g));
  };
  const hasSpecialCourses = courses.some(isSpecialCourse);
  const specialCourseCodes = courses.filter(isSpecialCourse).map(c => c.coursecode).join(", ");

  const courseRows = courses
    .map((c, idx) => {
      const topHide = idx > 0 ? "border-top:hidden;" : "";
      const code = c.coursecode || "";
      return `
    <tr>
      <td style="text-align:center;vertical-align:middle;border-right:hidden;${topHide}">${esc(code)}</td>
      <td style="vertical-align:middle;border-left:hidden;border-right:hidden;${topHide}">${esc(c.coursename)}</td>
      <td style="text-align:center;vertical-align:middle;border-left:hidden;border-right:hidden;${topHide}">${esc(c.credits)}</td>
      <td style="text-align:center;vertical-align:middle;border-left:hidden;border-right:hidden;${topHide}">${esc(c.grade)}</td>
      <td style="text-align:center;vertical-align:middle;border-left:hidden;${topHide}">${esc(c.special_symbol || "")}</td>
    </tr>`;
    })
    .join("");

  const isBachelor = (
    (studentInfo.programme || "").toLowerCase().includes("bachelor") ||
    /^b\.(tech|des)/i.test(studentInfo.programme || "")
  );
  const minCpi = isBachelor ? "5.0" : "6.5";
  const creditThreshold = isBachelor ? 148 : 48;
  const allHistory = Array.isArray(semesterHistory) && semesterHistory.length > 0
    ? [...semesterHistory]
    : [{ semester: 1, spi: Number(spi), cpi: Number(cpi), cumulative_credits: 0, is_summer: false }];

  if (selectedIsSummer && !allHistory.some(h => h.is_summer && h.semester === selectedSemesterNo)) {
    allHistory.push({ semester: selectedSemesterNo, spi: Number(spi), cpi: Number(cpi), cumulative_credits: 0, is_summer: true });
  }

  const regularHistory = allHistory.filter(h => !h.is_summer);
  const summerMap = {};
  allHistory.filter(h => h.is_summer).forEach(h => { summerMap[h.semester] = h; });

  const N = selectedSemesterNo || 99;
  const allToSelected = allHistory.filter(h => {
    if (h.semester < N) return true;
    if (h.semester === N) return selectedIsSummer ? true : !h.is_summer;
    return false;
  });
  const regularToSelected = regularHistory.filter(h => h.semester <= N);
  const cutoffEntry = allToSelected.find(h => (h.cumulative_credits || 0) >= creditThreshold);

  // "Last semester" = no grade history exists beyond the currently viewed (semester, is_summer).
  // For a regular semester: nothing with a higher semester_no, and no summer at the same number.
  // For a summer semester: nothing with a higher semester_no.
  const isLastSemester = selectedIsSummer
    ? !allHistory.some(h => h.semester > selectedSemesterNo)
    : !allHistory.some(
        h => h.semester > selectedSemesterNo ||
             (h.semester === selectedSemesterNo && h.is_summer)
      );

  // Full grid (I → last semester + Final CPI) appears ONLY when BOTH:
  //   1. cumulative credits have met the graduation threshold, AND
  //   2. we are viewing the student's last semester.
  // Every other semester — even after credits are satisfied — shows the simple Result line.
  const showFullGrid = !!cutoffEntry && isLastSemester;

  // SPI/CPI for the simple single-line table.
  const currentEntry = selectedIsSummer
    ? { spi: Number(spi), cpi: Number(cpi) }
    : regularToSelected.length > 0
      ? regularToSelected[regularToSelected.length - 1]
      : { spi: Number(spi), cpi: Number(cpi) };

  let spiCpiTable;
  if (showFullGrid) {
    const allRegMap = {};
    regularToSelected.forEach(h => { allRegMap[h.semester] = h; });

    // Final CPI = CPI at the last viewed point.
    const finalCpi = selectedIsSummer
      ? Number(cpi)
      : (regularToSelected.length > 0
          ? Number(regularToSelected[regularToSelected.length - 1].cpi)
          : Number(cpi));

    const columns = [];
    for (let s = 1; s <= selectedSemesterNo; s++) {
      const h = allRegMap[s];
      columns.push({ label: roman(s), spi: h ? h.spi : null, cpi: h ? h.cpi : null });
      if (s % 2 === 0) {
        const sd = summerMap[s];
        columns.push({
          label: 'Summer',
          spi: sd ? Number(sd.spi) : null,
          cpi: sd ? Number(sd.cpi) : null,
        });
      }
    }

    spiCpiTable = `
<table id="spi-table" style="table-layout:auto;width:100%">
<tr>
  <th style="text-align:center;white-space:nowrap">Semester</th>
  ${columns.map(c => `<th style="text-align:center;white-space:nowrap">${c.label}</th>`).join("")}
  <th style="text-align:center;white-space:nowrap">Final CPI</th>
</tr>
<tr>
  <td class="lbl" style="border-right:none">SPI</td>
  ${columns.map(c => `<td style="text-align:center">${c.spi !== null ? Number(c.spi).toFixed(1) : '-'}</td>`).join("")}
  <td style="text-align:center" rowspan="2">${finalCpi.toFixed(1)}</td>
</tr>
<tr>
  <td class="lbl" style="border-right:none;border-top:hidden">CPI</td>
  ${columns.map(c => `<td style="text-align:center">${c.cpi !== null ? Number(c.cpi).toFixed(1) : '-'}</td>`).join("")}
</tr>
</table>`;
  } else {
    // Credits threshold not yet reached, or not viewing the last semester →
    // single row showing current SPI & CPI only.
    spiCpiTable = `
<table id="spi-table">
<colgroup><col style="width:20%"><col style="width:40%"><col style="width:40%"></colgroup>
<tr>
  <td class="lbl" style="text-align:center;border-right:hidden">Result</td>
  <td style="text-align:center;font-size:var(--fs-sm);border-left:hidden;border-right:hidden">SPI &nbsp;&nbsp; ${Number(currentEntry.spi).toFixed(1)}</td>
  <td style="text-align:center;font-size:var(--fs-sm);border-left:hidden">CPI &nbsp;&nbsp; ${Number(currentEntry.cpi).toFixed(1)}</td>
</tr>
</table>`;
  }

  const today = new Date();
  const issuedDate = today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Grade Sheet - ${esc(studentInfo.rollNumber)}</title>
<style>
  :root {
    --fs:    9pt;
    --fs-sm: 8.5pt;
    --fs-xs: 8pt;
  }
  @page {
    size: A4;
    margin-top: 7.5cm;
    margin-left: 2.3cm;
    margin-right: 2.3cm;
    margin-bottom: 2.3cm;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: var(--fs);
    color: #000;
    line-height: 1.25;
  }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  td, th {
    border: 1pt solid #000;
    padding: 2pt 3pt;
    font-size: var(--fs);
    vertical-align: middle;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  th { font-weight: bold; text-align: center; }
  .lbl { font-weight: bold; }

  /*  INFO TABLE  */
  #info-table col.i1 { width: 15%; }
  #info-table col.i2 { width: 40%; }
  #info-table col.i3 { width: 15%; }
  #info-table col.i4 { width: 30%; }
  #info-table td { vertical-align: top; padding: 3pt 5pt; line-height: 1.3; font-size: var(--fs); }
  #info-table .ir1 td { border-bottom: hidden; }
  #info-table .ir2 td { border-top: hidden; border-bottom: hidden; }
  #info-table .ir3 td { border-top: hidden; }

  /*  COURSE TABLE  */
  #course-table col.k1 { width: 13%; }
  #course-table col.k2 { width: 36%; }
  #course-table col.k3 { width: 12%; }
  #course-table col.k4 { width:  9%; }
  #course-table col.k5 { width: 30%; }
  #course-table tr:first-child th { border-top: none; }

  /*  SPI/CPI TABLE  */
  #spi-table tr:first-child th,
  #spi-table tr:first-child td { border-top: none; }
  #spi-table td, #spi-table th { font-size: var(--fs-sm); padding: 3pt 4pt; }
  #spi-table th { white-space: nowrap; font-size: var(--fs-xs); }
  #spi-table td { white-space: nowrap; text-align: center; }

  /*  GRADING POINTS TABLE  */
  #gp-table tr:first-child td { border-top: none; }
  #gp-table col.gp1 { width: 15%; }
  #gp-table col.gp2 { width: 85%; }
  #gp-table td { font-size: var(--fs-xs); line-height: 1.45; padding: 3pt 5pt; vertical-align: top; }
  #gp-table .lbl { font-size: var(--fs-xs); vertical-align: middle; }

  /*  ABBREVIATIONS TABLE  */
  #abbr-table tr:first-child td { border-top: none; }
  #abbr-table col.ab1 { width: 15%; }
  #abbr-table col.ab2 { width: 85%; }
  #abbr-table td { font-size: var(--fs-xs); line-height: 1.6; padding: 3pt 5pt; vertical-align: top; }
  #abbr-table .lbl { font-size: var(--fs-xs); vertical-align: middle; }

  /*  SPECIAL SYMBOLS TABLE  */
  #ss-table tr:first-child td { border-top: none; }
  #ss-table col.ss1 { width: 15%; }
  #ss-table col.ss2 { width: 85%; }
  #ss-table td { font-size: var(--fs-xs); line-height: 1.6; padding: 3pt 5pt; vertical-align: top; }
  #ss-table .lbl { font-size: var(--fs-xs); vertical-align: middle; }

  /*  LEGEND META TABLE  */
  #legend-table tr:first-child td { border-top: none; }
  #legend-table td { font-size: var(--fs-xs); line-height: 1.45; padding: 3pt 5pt; vertical-align: top; }
  #legend-table .lbl { font-size: var(--fs-xs); vertical-align: middle; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head><body>

<!-- ══ INFO TABLE ══ -->
<table id="info-table">
<colgroup><col class="i1"><col class="i2"><col class="i3"><col class="i4"></colgroup>
<tr class="ir1">
  <td class="lbl" style="border-right:none">Roll No.</td>
  <td style="border-left:none;border-right:none">${esc(studentInfo.rollNumber)}</td>
  <td class="lbl" style="border-left:none;border-right:none">Programme</td>
  <td style="border-left:none">${esc(studentInfo.programme)}</td>
</tr>
<tr class="ir2">
  <td class="lbl" style="border-right:none">Student Name</td>
  <td style="border-left:none;border-right:none">${esc(studentInfo.name)}</td>
  <td class="lbl" style="border-left:none;border-right:none">Discipline</td>
  <td style="border-left:none">${esc(studentInfo.discipline)}</td>
</tr>
<tr class="ir3">
  <td class="lbl" style="border-right:none">Semester</td>
  <td style="border-left:none;border-right:none">${esc(semesterLabel)}</td>
  <td class="lbl" style="border-left:none;border-right:none">Academic Year</td>
  <td style="border-left:none">${esc(studentInfo.academicYear)}</td>
</tr>
</table>

<!-- ══ COURSE TABLE ══ -->
<table id="course-table">
<colgroup><col class="k1"><col class="k2"><col class="k3"><col class="k4"><col class="k5"></colgroup>
<tr>
  <th style="border-right:hidden">Course No.</th>
  <th style="text-align:left;border-left:hidden;border-right:hidden">Course Title</th>
  <th style="border-left:hidden;border-right:hidden">Unit</th>
  <th style="border-left:hidden;border-right:hidden">Grade</th>
  <th style="border-left:hidden">Special Symbols</th>
</tr>
${courseRows}
</table>

<!-- ══ SPI/CPI TABLE ══ -->
${spiCpiTable}

<!-- ══ GRADING POINTS TABLE ══ -->
<table id="gp-table">
<colgroup><col class="gp1"><col class="gp2"></colgroup>
<tr>
  <td class="lbl" style="vertical-align:middle">Grading Points</td>
  <td>
    <table style="width:100%;border-collapse:collapse;table-layout:fixed">
      <colgroup><col style="width:20%"><col style="width:20%"><col style="width:20%"><col style="width:20%"><col style="width:20%"></colgroup>
      <tr>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">O=10 (Distinguished)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">A+=10 (Outstanding)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">A=9 (Excellent)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">B+=8 (Very Good)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">B=7 (Good)</td>
      </tr>
      <tr>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">C+=6 (Average)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">C=5 (Below Average)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">D+=4 (Marginal)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">D=3 (Poor)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">F=2 (Very Poor)</td>
      </tr>
      <tr>
        <td style="border:none;padding:0;font-size:var(--fs-xs)">I=0 (Incomplete)</td>
        <td style="border:none;padding:0;font-size:var(--fs-xs)">S=0 (Satisfactory)</td>
        <td style="border:none;padding:0;font-size:var(--fs-xs)">X=0 (Unsatisfactory)</td>
        <td style="border:none;padding:0;font-size:var(--fs-xs)"></td>
        <td style="border:none;padding:0;font-size:var(--fs-xs)"></td>
      </tr>
    </table>
    ${hasSpecialCourses ? `<div style="font-size:8pt;margin-top:3pt">*In ${esc(specialCourseCodes)} student is awarded SPI based on performance in various evaluation in place of grade.</div>` : ""}
  </td>
</tr>
</table>

<!-- ══ ABBREVIATIONS TABLE ══ -->
<table id="abbr-table">
<colgroup><col class="ab1"><col class="ab2"></colgroup>
<tr>
  <td class="lbl" style="vertical-align:middle">Abbreviations</td>
  <td style="padding:3pt 5pt">
    <b>SPI</b>: Semester Performance Index<br>
    <b>CPI</b>: Cumulative Performance Index<br>
    <b>AU</b>: Indicates that the course has been Audited<br>
    <b>CD</b>: Indicates that the course has been Dropped due to a shortage of attendance
  </td>
</tr>
</table>

<!-- ══ SPECIAL SYMBOLS TABLE ══ -->
<table id="ss-table">
<colgroup><col class="ss1"><col class="ss2"></colgroup>
<tr>
  <td class="lbl" style="vertical-align:middle">Special Symbols</td>
  <td style="padding:3pt 5pt">
    <b>&#8216;R&#8217;</b> after letter grade indicates that the course has been Repeated<br>
    <b>&#8216;S&#8217;</b> after letter grade indicates that the course has been Substituted
  </td>
</tr>
</table>

<!-- ══ LEGEND META TABLE ══ -->
<table id="legend-table" style="table-layout:auto;width:100%">
<tr>
  <td style="font-size:8pt;padding:3pt 5pt;white-space:nowrap;width:auto;text-align:center;border-right:hidden">&#8226;&nbsp;Medium of Instruction is English</td>
  <td style="font-size:8pt;padding:3pt 5pt;white-space:nowrap;width:auto;text-align:center;border-left:hidden">&#8226;&nbsp;Conversion from CPI to Percentage using (CPI&#215;10)%</td>
</tr>
<tr>
  <td style="font-size:8pt;text-align:center;font-weight:bold;border-right:hidden">Minimum Graduating CPI: ${minCpi}</td>
  <td style="font-size:8pt;text-align:center;font-weight:bold;border-left:hidden">Maximum Graduating CPI: 10.0</td>
</tr>
${cutoffEntry ? `<tr>
  <td colspan="2" style="font-size:9pt;text-align:center;font-weight:bold;padding:4pt 5pt">Student has successfully completed the programme.</td>
</tr>` : ""}
<tr>
  <td colspan="2" style="border:none;height:50pt"></td>
</tr>
</table>

<table style="width:100%;border-collapse:collapse;table-layout:fixed">
<tr>
  <td style="border:none;font-size:9pt;text-align:left;width:33%">Academic Office</td>
  <td style="border:none;font-size:9pt;text-align:center;width:34%">Issued on ${issuedDate}</td>
  <td style="border:none;font-size:9pt;text-align:right;width:33%">Assistant/Deputy Registrar</td>
</tr>
</table>

</body></html>`;
}

// Fetch grade data and build HTML for one student's grade sheet, used by both print and PDF export handlers.
async function fetchStudentHTML(student, token, userRole, semester) {
  const { data: gsData } = await axios.post(
    generate_gradesheet_data,
    { Role: userRole, student: student.id_id, semester: JSON.stringify(semester) },
    { headers: { Authorization: `Token ${token}` } }
  );
  if (!gsData) throw new Error("Failed to load grade sheet.");
  const courseEntries = gsData.courses_grades ? Object.values(gsData.courses_grades) : [];
  if (courseEntries.length === 0) throw new Error("Marks not yet submitted.");
  const processedCourses = courseEntries.map((course) => ({
    coursecode: course.course_code,
    coursename: course.course_name,
    credits: course.credit || 0,
    grade: course.grade,
    special_symbol: course.special_symbol || "",
  }));
  let userData = {};
  try { userData = JSON.parse(localStorage.getItem("user")) || {}; } catch (_) {}
  const studentInfo = {
    name: gsData.student_name || gsData.name || student.name || userData.name || "",
    rollNumber: gsData.roll_number || student.id_id || "",
    programme: gsData.programme || student.programme || "N/A",
    discipline: gsData.discipline || gsData.department || gsData.branch || student.branch || "N/A",
    academicYear: gsData.academic_year || student.academic_year || "N/A",
  };
  const semesterLabel = formatSemesterLabel(semester);
  const selectedIsSummer = !!(semester?.type && semester.type.toLowerCase().includes("summer"));
  return buildPrintHTML(
    studentInfo, processedCourses,
    parseFloat(gsData.spi) || 0, parseFloat(gsData.cpi) || 0,
    semesterLabel, gsData.semester_history || [], semester?.no || 1, selectedIsSummer
  );
}

const EXPORT_BATCH_SIZE = 30;
const PDF_PAGES_PER_FILE = 60;

const GradeSheet = forwardRef(function GradeSheet({ data, semester, batchLabel }, ref) {
  const [printing, setPrinting] = useState({});
  const [printError, setPrintError] = useState({});
  const [downloading, setDownloading] = useState({});
  const [downloadError, setDownloadError] = useState({});
  const [exportingAll, setExportingAll] = useState(false);
  const students = data?.students || [];
  const userRole = useSelector((state) => state.user.role);
  const iframeRef = useRef(null);

  // Clean up hidden iframe when component unmounts
  useEffect(() => {
    return () => {
      if (iframeRef.current && document.body.contains(iframeRef.current)) {
        document.body.removeChild(iframeRef.current);
      }
    };
  }, []);

  const printViaIframe = useCallback((html) => {
    if (iframeRef.current && document.body.contains(iframeRef.current)) {
      document.body.removeChild(iframeRef.current);
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "620px";
    iframe.style.height = "1px";
    iframe.style.overflow = "hidden";
    iframe.style.border = "none";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    document.body.appendChild(iframe);
    iframeRef.current = iframe;

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      const iDoc = iframe.contentDocument;
      const availH = Math.round((297 - 80 - 23) / 25.4 * 96);
      let base = 9;
      for (let i = 0; i < 3; i++) {
        if (iDoc.body.scrollHeight <= availH) break;
        base -= 1;
        iDoc.documentElement.style.setProperty("--fs",    base + "pt");
        iDoc.documentElement.style.setProperty("--fs-sm",  (base - 0.5) + "pt");
        iDoc.documentElement.style.setProperty("--fs-xs",  (base - 1) + "pt");
      }
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 400);
  }, []);

  const handlePrint = async (student) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setPrintError((prev) => ({ ...prev, [student.id_id]: "Authentication error. Please log in again." }));
      return;
    }
    setPrinting((prev) => ({ ...prev, [student.id_id]: true }));
    setPrintError((prev) => { const n = { ...prev }; delete n[student.id_id]; return n; });
    try {
      const html = await fetchStudentHTML(student, token, userRole, semester);
      printViaIframe(html);
    } catch (err) {
      console.error("Print error:", err);
      setPrintError((prev) => ({ ...prev, [student.id_id]: err.message || "Failed to load grade sheet. Please try again." }));
    } finally {
      setPrinting((prev) => ({ ...prev, [student.id_id]: false }));
    }
  };

  const handleDownload = async (student) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setDownloadError((prev) => ({ ...prev, [student.id_id]: "Authentication error. Please log in again." }));
      return;
    }
    setDownloading((prev) => ({ ...prev, [student.id_id]: true }));
    setDownloadError((prev) => { const n = { ...prev }; delete n[student.id_id]; return n; });
    try {
      const html = await fetchStudentHTML(student, token, userRole, semester);
      const safe = (s) => String(s || "").replace(/[\/\\?%*:|"<>]/g, "_");
      await savePDFFromHTML([html], `GradeSheet_${safe(student.id_id)}.pdf`);
    } catch (err) {
      console.error("Download error:", err);
      setDownloadError((prev) => ({ ...prev, [student.id_id]: err.message || "Failed to download grade sheet." }));
    } finally {
      setDownloading((prev) => ({ ...prev, [student.id_id]: false }));
    }
  };

  const exportAll = useCallback(async (onDone) => {
    const token = localStorage.getItem("authToken");
    if (!token || students.length === 0) { onDone?.(); return; }
    setExportingAll(true);
    try {
      const htmls = [];
      let failed = 0;
      for (let i = 0; i < students.length; i += EXPORT_BATCH_SIZE) {
        const batch = students.slice(i, i + EXPORT_BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map((student) => fetchStudentHTML(student, token, userRole, semester))
        );
        results.forEach((r) => {
          if (r.status === "fulfilled") htmls.push(r.value);
          else failed++;
        });
      }

      if (htmls.length === 0) {
        showNotification({ title: "Export Failed", message: "No grade sheets could be generated.", color: "red" });
        return;
      }

      const _safe = (s) => String(s || "").replace(/[\/\\?%*:|"<>]/g, "_");
      const _semLabel = semester?.type === "summer" ? `Summer_Sem${semester.no}` : `Sem${semester.no}`;
      const _base = `GradeSheets_${_safe(batchLabel || "Batch")}_${_semLabel}`;

      // Split into chunks to avoid jsPDF's internal string-length overflow
      // when exporting a large class (can be 60+ students).
      const chunkCount = Math.ceil(htmls.length / PDF_PAGES_PER_FILE);
      for (let c = 0; c < chunkCount; c++) {
        const chunk = htmls.slice(c * PDF_PAGES_PER_FILE, (c + 1) * PDF_PAGES_PER_FILE);
        const suffix = chunkCount > 1 ? `_Part${c + 1}of${chunkCount}` : "";
        await savePDFFromHTML(chunk, `${_base}${suffix}.pdf`);
      }

      if (failed > 0) {
        showNotification({
          title: "Partial Export",
          message: `${htmls.length} sheet(s) exported. ${failed} could not be generated.`,
          color: "yellow",
        });
      }
    } catch (err) {
      console.error("Export all error:", err);
      showNotification({ title: "Export Failed", message: "An unexpected error occurred.", color: "red" });
    } finally {
      setExportingAll(false);
      onDone?.();
    }
  }, [students, userRole, semester]);

  useImperativeHandle(ref, () => ({ exportAll, exportingAll }), [exportAll, exportingAll]);

  return (
    <div className="transcript-container">
      {students.length > 0 ? (
        <Table striped highlightOnHover captionSide="top" mt="md" className="transcript-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Programme</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id_id} className="table-row">
                <td className="table-cell">{student.id_id}</td>
                <td className="table-cell">{student.programme}</td>
                <td style={{ textAlign: "center" }}>
                  <Group gap="xs" justify="center" align="center" wrap="wrap">
                    <Button
                      size="xs"
                      color="blue"
                      leftSection={<IconPrinter size={14} />}
                      onClick={() => handlePrint(student)}
                      loading={printing[student.id_id]}
                    >
                      Print
                    </Button>
                    <Button
                      size="xs"
                      color="teal"
                      variant="outline"
                      leftSection={<IconDownload size={14} />}
                      onClick={() => handleDownload(student)}
                      loading={downloading[student.id_id]}
                    >
                      Download
                    </Button>
                    {printError[student.id_id] && (
                      <Text c="red" size="xs">{printError[student.id_id]}</Text>
                    )}
                    {downloadError[student.id_id] && (
                      <Text c="red" size="xs">{downloadError[student.id_id]}</Text>
                    )}
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="no-data">No grade sheet records available.</div>
      )}
    </div>
  );
});

export default GradeSheet;

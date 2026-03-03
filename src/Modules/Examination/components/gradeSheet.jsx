import { useState, useRef, useCallback, useEffect } from "react";
import { Table, Button, Group } from "@mantine/core";
import { IconPrinter } from "@tabler/icons-react";
import axios from "axios";
import { generate_gradesheet_data } from "../routes/examinationRoutes";
import { useSelector } from "react-redux";
import "../styles/transcript.css";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function formatSemesterLabel(semester) {
  if (!semester) return "N/A";
  if (semester.type && semester.type.toLowerCase().includes("summer")) {
    const map = { 2: "Summer 1", 4: "Summer 2", 6: "Summer 3", 8: "Summer 4" };
    return map[semester.no] || `Summer ${semester.no}`;
  }
  return String(semester.no);
}

function buildPrintHTML(studentInfo, courses, spi, cpi, semesterLabel, semesterHistory, selectedSemesterNo) {
  const roman = (n) => ["I","II","III","IV","V","VI","VII","VIII"][n - 1] || String(n);

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

  const isBachelor = (studentInfo.programme || "").toLowerCase().includes("bachelor");
  const minCpi = isBachelor ? "5.0" : "6.5";
  const creditThreshold = isBachelor ? 148 : 72;
  const allHistory = Array.isArray(semesterHistory) && semesterHistory.length > 0
    ? semesterHistory
    : [{ semester: 1, spi: Number(spi), cpi: Number(cpi), cumulative_credits: 0, is_summer: false }];

  const regularHistory = allHistory.filter(h => !h.is_summer);
  const summerMap = {};
  allHistory.filter(h => h.is_summer).forEach(h => { summerMap[h.semester] = h; });

  const allToSelected = allHistory.filter(h => h.semester <= (selectedSemesterNo || 99));
  const regularToSelected = regularHistory.filter(h => h.semester <= (selectedSemesterNo || 99));
  const cutoffEntry = allToSelected.find(h => (h.cumulative_credits || 0) >= creditThreshold);
  const currentEntry = regularToSelected.length > 0
    ? regularToSelected[regularToSelected.length - 1]
    : { spi: Number(spi), cpi: Number(cpi) };

  let spiCpiTable;
  if (cutoffEntry) {
    const regularUpToCutoff = regularToSelected.filter(h => h.semester <= cutoffEntry.semester);
    const finalCpiEntry = regularUpToCutoff[regularUpToCutoff.length - 1];

    const regularMap = {};
    regularUpToCutoff.forEach(h => { regularMap[h.semester] = h; });

    const columns = [];
    for (let s = 1; s <= cutoffEntry.semester; s++) {
      const h = regularMap[s];
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
  <td style="text-align:center" rowspan="2">${Number(finalCpiEntry.cpi).toFixed(1)}</td>
</tr>
<tr>
  <td class="lbl" style="border-right:none;border-top:hidden">CPI</td>
  ${columns.map(c => `<td style="text-align:center">${c.cpi !== null ? Number(c.cpi).toFixed(1) : '-'}</td>`).join("")}
</tr>
</table>`;
  } else {
    // Credits threshold not yet reached — single row showing current SPI & CPI
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
  #legend-table col.l1 { width: 50%; }
  #legend-table col.l2 { width: 50%; }
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
    ${hasSpecialCourses ? `<div style="font-size:8pt;margin-top:3pt">*In ${specialCourseCodes} student is awarded SPI based on performance in various evaluation in place of grade.</div>` : ""}
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

function GradeSheet({ data, semester }) {
  const [printing, setPrinting] = useState({});
  const [printError, setPrintError] = useState({});
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

    try {
      setPrinting((prev) => ({ ...prev, [student.id_id]: true }));
      const { data: gsData } = await axios.post(
        generate_gradesheet_data,
        {
          Role: userRole,
          student: student.id_id,
          semester: JSON.stringify(semester),
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      if (!gsData) {
        setPrintError((prev) => ({ ...prev, [student.id_id]: "Failed to load grade sheet. Please try again." }));
        return;
      }

      const courseEntries = gsData.courses_grades
        ? Object.values(gsData.courses_grades)
        : [];

      if (courseEntries.length === 0) {
        setPrintError((prev) => ({ ...prev, [student.id_id]: "Marks not yet submitted." }));
        return;
      }

      setPrintError((prev) => { const n = { ...prev }; delete n[student.id_id]; return n; });

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
      const html = buildPrintHTML(
        studentInfo,
        processedCourses,
        parseFloat(gsData.spi) || 0,
        parseFloat(gsData.cpi) || 0,
        semesterLabel,
        gsData.semester_history || [],
        semester?.no || 1
      );

      printViaIframe(html);
    } catch (err) {
      console.error("Print error:", err);
      setPrintError((prev) => ({ ...prev, [student.id_id]: "Failed to load grade sheet. Please try again." }));
    } finally {
      setPrinting((prev) => ({ ...prev, [student.id_id]: false }));
    }
  };

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
                  <Group gap="xs" justify="center" align="center">
                    <Button
                      size="xs"
                      color="blue"
                      leftSection={<IconPrinter size={14} />}
                      onClick={() => handlePrint(student)}
                      loading={printing[student.id_id]}
                    >
                      Print
                    </Button>
                    {printError[student.id_id] && (
                      <span style={{ color: "red", fontSize: "12px" }}>
                        {printError[student.id_id]}
                      </span>
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
}

export default GradeSheet;

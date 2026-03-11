import React, { useState, useEffect } from "react";
import {
  MantineProvider,
  Table,
  Flex,
  Container,
  Button,
  TextInput,
  Text,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchWorkingCurriculumsData, fetchStudentMyInfo } from "./api/api";

function ViewAllWorkingCurriculums() {
  const role = useSelector((state) => state.user.role);
  const isStudent = role === "student";
  const [searchTerm, setSearchTerm] = useState("");
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentCurriculumIds, setStudentCurriculumIds] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const curriculaPromise = (async () => {
          const cachedData = localStorage.getItem("curriculumsCache");
          const timestamp = localStorage.getItem("curriculumsTimestamp");
          const isCacheValid =
            timestamp && Date.now() - parseInt(timestamp, 10) < 10 * 60 * 1000;

          if (cachedData && isCacheValid) {
            return JSON.parse(cachedData) || [];
          }
          const token = localStorage.getItem("authToken");
          if (!token) throw new Error("Authorization token is missing");
          const data = await fetchWorkingCurriculumsData(token);
          const list = data.curriculums || [];
          localStorage.setItem("curriculumsCache", JSON.stringify(list));
          localStorage.setItem("curriculumsTimestamp", Date.now().toString());
          return list;
        })();

        const studentInfoPromise = isStudent ? fetchStudentMyInfo() : Promise.resolve(null);

        const [list, info] = await Promise.all([curriculaPromise, studentInfoPromise]);

        setCurriculums(list);

        if (info && Array.isArray(info.curriculum_ids)) {
          setStudentCurriculumIds(info.curriculum_ids);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          "Failed to load curriculum data. Contact the academic office.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isStudent]);

  const baseData =
    isStudent && Array.isArray(studentCurriculumIds) && studentCurriculumIds.length > 0
      ? curriculums.filter((c) => studentCurriculumIds.includes(c.id))
      : curriculums;

  const filteredData = baseData.filter((item) => {
    const s = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(s) ||
      item.version.toLowerCase().includes(s) ||
      (item.batch || []).some((b) => b.toLowerCase().includes(s)) ||
      item.semesters.toString().includes(s)
    );
  });

  const cellStyle = {
    padding: "15px 20px",
    textAlign: "center",
    borderRight: "1px solid #d3d3d3",
  };

  const rows = filteredData.map((element, index) => (
    <tr
      key={element.id}
      style={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#E6F7FF" }}
    >
      <td style={cellStyle}>
        <Link
          to={`/programme_curriculum/stud_curriculum_view/${element.id}`}
          style={{ color: "#3498db", textDecoration: "none" }}
        >
          {element.name}
        </Link>
      </td>
      <td style={cellStyle}>{element.version}</td>
      <td style={{ padding: "15px 20px", borderRight: "1px solid #d3d3d3", textAlign: "center" }}>
        {element.batch && element.batch.length > 0
          ? element.batch.map((b, i) => <div key={i}>{b}</div>)
          : <div>No batches available</div>}
      </td>
      <td style={{ padding: "15px 20px", textAlign: "center" }}>
        {element.semesters}
      </td>
    </tr>
  ));

  if (error) {
    return (
      <Container>
        <Text color="red">{error}</Text>
      </Container>
    );
  }

  return (
    <MantineProvider
      theme={{ colorScheme: "light" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Container style={{ padding: "20px", maxWidth: "100%" }}>
        <Flex justify="space-between" align="center" mb={20}>
          <Button variant="filled">Curriculums</Button>
          <TextInput
            placeholder="Search by name, version, batch, or semesters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            style={{ width: "400px" }}
          />
        </Flex>
        <hr />
        <div
          style={{
            maxHeight: "61vh",
            overflowY: "auto",
            border: "1px solid #d3d3d3",
            borderRadius: "10px",
            scrollbarWidth: "none",
          }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          <Table style={{ backgroundColor: "white", padding: "20px" }}>
            <thead>
              <tr>
                {["Name", "Version", "Batch", "No. of Semesters"].map((header, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "15px 20px",
                      backgroundColor: "#C5E2F6",
                      color: "#3498db",
                      fontSize: "16px",
                      textAlign: "center",
                      borderRight: i < 3 ? "1px solid #d3d3d3" : "none",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                    Loading...
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                    No curriculums found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Container>
    </MantineProvider>
  );
}

export default ViewAllWorkingCurriculums;

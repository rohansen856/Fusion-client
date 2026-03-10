import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Box, Group, Loader, Text } from "@mantine/core";
import axios from "axios";
import StudentInfoCard from "../../components/students/StudentInfoCard";
import StudentInfo from "../all-actors/StudentInfo";
import { getStudentsInfo } from "../../../../routes/hostelManagementRoutes"; // Adjust this import path as needed

export default function StudentDashboard() {
  const [allStudents, setAllStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRollNo = useSelector((state) => state.user.roll_no);

  const fetchAllStudentsInfo = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(getStudentsInfo, {
        headers: { Authorization: `Token ${token}` },
      });
      setAllStudents(response.data);

      // Filter to find the current student
      const currentStudentData = response.data.find(
        (student) => student.id__user__username === userRollNo,
      );
      console.log(response.data);
      console.log(currentStudentData);
      if (currentStudentData) {
        setCurrentStudent(currentStudentData);
      } else {
        setError("Current student information not found.");
      }
    } catch (err) {
      console.error("Error fetching students info:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch student information. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllStudentsInfo();
  }, []);

  return (
    <Box style={{ overflow: "hidden" }}>
      <Group align="flex-start" style={{ height: "78vh" }}>
        <Box style={{ height: "100%" }}>
          {loading ? (
            <Loader size="md" />
          ) : error ? (
            <Text color="red">{error}</Text>
          ) : currentStudent ? (
            <StudentInfoCard
              name={currentStudent.id__user__username}
              programme={currentStudent.programme}
              batch={currentStudent.batch}
              cpi={currentStudent.cpi}
              category={currentStudent.category}
              hall_id={currentStudent.hall_id}
              room_no={currentStudent.room_no}
            />
          ) : (
            <Text>No student information available</Text>
          )}
        </Box>
        <Box style={{ height: "100%", flex: 1 }}>
          <StudentInfo students={allStudents} />
        </Box>
      </Group>
    </Box>
  );
}

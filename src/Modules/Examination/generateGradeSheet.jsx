import React, { useState, useEffect } from "react";
import {
  Alert,
  Card,
  Paper,
  Select,
  Button,
  Stack,
  Group,
  Box,
  SimpleGrid,
  LoadingOverlay,
} from "@mantine/core";
import axios from "axios";
import { useSelector } from "react-redux";
import GradeSheet from "./components/gradeSheet.jsx";
import { generate_gradesheet_form } from "./routes/examinationRoutes.jsx";
import { SEMESTER_OPTIONS } from "./constants/semesterOptions.jsx";

export default function GenerateGradeSheet() {
  const userRole = useSelector((state) => state.user.role);
  const [formData, setFormData] = useState({
    batch: "",
    semester: null,
  });
  const [formOptions, setFormOptions] = useState({
    batches: [],
    semesters: [],
  });
  const [showGradeSheet, setShowGradeSheet] = useState(false);
  const [gradeSheetData, setGradeSheetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormOptions = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found!");
        return;
      }
      try {
        setLoading(true);
        const { data } = await axios.get(generate_gradesheet_form, {
          params: { role: userRole },
          headers: { Authorization: `Token ${token}` },
        });
        const batches = (data.batches || []).slice().sort((a, b) => {
          const yearA = parseInt((a.label || "").match(/(\d{4})/g)?.pop() || 0);
          const yearB = parseInt((b.label || "").match(/(\d{4})/g)?.pop() || 0);
          return yearB - yearA;
        });
        setFormOptions({
          batches: batches.map((batch) => ({
            value: batch.id.toString(),
            label: batch.label,
          })),
          semesters: SEMESTER_OPTIONS,
        });
      } catch (e) {
        setError(`Error fetching form options: ${e.message}`);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFormOptions();
  }, [userRole]);

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setShowGradeSheet(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found!");
      return;
    }
    if (!formData.batch) {
      setError("Please select a batch.");
      return;
    }
    if (!formData.semester) {
      setError("Please select a semester.");
      return;
    }
    const { no: semester_no, type: semester_type } = JSON.parse(
      formData.semester,
    );
    try {
      setLoading(true);
      const requestData = {
        Role: userRole,
        ...formData,
        semester: semester_no,
        semester_type,
      };
      const { data } = await axios.post(generate_gradesheet_form, requestData, {
        headers: { Authorization: `Token ${token}` },
      });
      setGradeSheetData(data);
      setShowGradeSheet(true);
      setError(null);
    } catch (err) {
      setError(`Error generating grade sheet: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Stack spacing="md" pos="relative">
        <LoadingOverlay visible={loading} />
        {error && (
          <Alert color="red" radius="sm">
            {error}
          </Alert>
        )}
        <Paper shadow="sm" radius="sm" p="md" withBorder>
          <Stack spacing="md">
            <h1>Grade Sheet Details</h1>
            <form onSubmit={handleSubmit}>
              <SimpleGrid cols={2} spacing="md">
                <Box>
                  <Select
                    label="Batch"
                    placeholder="Select Batch"
                    data={formOptions.batches}
                    value={formData.batch?.toString()}
                    onChange={handleChange("batch")}
                    radius="sm"
                  />
                </Box>
                <Box>
                  <Select
                    label="Semester"
                    placeholder="Select Semester"
                    data={formOptions.semesters}
                    value={formData.semester}
                    onChange={handleChange("semester")}
                    radius="sm"
                  />
                </Box>
              </SimpleGrid>
              <Group position="right" mt="md">
                <Button type="submit" size="md" radius="sm">
                  Generate Grade Sheet
                </Button>
              </Group>
            </form>
          </Stack>
        </Paper>
        {showGradeSheet && (
          <Paper shadow="sm" radius="sm" p="md" withBorder>
            <GradeSheet
              data={gradeSheetData}
              semester={JSON.parse(formData.semester)}
            />
          </Paper>
        )}
      </Stack>
    </Card>
  );
}

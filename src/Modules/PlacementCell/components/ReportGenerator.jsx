import React, { useState } from "react";
import {
  Paper,
  Title,
  Group,
  Select,
  Button,
  Loader,
  Stack,
  Text,
  Anchor,
  Alert,
  Card,
  Radio,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  FileArrowDown,
  FilePdf,
  FileXls,
  Warning,
  CheckCircle,
} from "@phosphor-icons/react";
import api from "../api";
import { generateReportRoute } from "../../../routes/placementCellRoutes";

const REPORT_TYPES = [
  { value: "batch", label: "Batch Report" },
  { value: "company", label: "Company Report" },
  { value: "branch", label: "Branch Report" },
];

const DEPARTMENT_OPTIONS = [
  { value: "", label: "All Departments" },
  { value: "CSE", label: "Computer Science" },
  { value: "ECE", label: "Electronics & Communication" },
  { value: "ME", label: "Mechanical Engineering" },
  { value: "CE", label: "Civil Engineering" },
  { value: "EE", label: "Electrical Engineering" },
  { value: "SM", label: "Smart Manufacturing" },
  { value: "Design", label: "Design" },
  { value: "NS", label: "Natural Sciences" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const year = currentYear - i;
  return { value: String(year), label: String(year) };
});

export default function ReportGenerator() {
  const [reportType, setReportType] = useState(null);
  const [year, setYear] = useState(String(currentYear));
  const [department, setDepartment] = useState("");
  const [format, setFormat] = useState("pdf");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleGenerate = async () => {
    if (!reportType) {
      showNotification({
        title: "Validation Error",
        message: "Please select a report type.",
        color: "red",
      });
      return;
    }

    setLoading(true);
    setDownloadUrl(null);

    try {
      const params = {
        report_type: reportType,
        year,
        output_format: format,
      };
      if (department) params.department = department;

      const response = await api.get(generateReportRoute, {
        params,
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      const filenameMatch = contentDisposition?.match(/filename="?(.+?)"?$/);
      const extension = format === "pdf" ? "pdf" : "xlsx";
      const filename =
        filenameMatch?.[1] ||
        `placement_report_${reportType}_${year}.${extension}`;

      const blob = new Blob([response.data], {
        type:
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl({ url, filename });

      showNotification({
        title: "Report Generated",
        message: "Your report is ready for download.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const parsed = JSON.parse(text);
          showNotification({
            title: "Error",
            message: parsed.detail || "Failed to generate report.",
            color: "red",
            icon: <Warning size={18} />,
          });
        } catch {
          showNotification({
            title: "Error",
            message: "Failed to generate report.",
            color: "red",
            icon: <Warning size={18} />,
          });
        }
      } else {
        showNotification({
          title: "Error",
          message:
            error.response?.data?.detail || "Failed to generate report.",
          color: "red",
          icon: <Warning size={18} />,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl.url;
    link.download = downloadUrl.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Paper p="xl" radius="md" withBorder>
      <Title order={3} mb="lg">
        <Group gap="xs">
          <FileArrowDown size={24} />
          Report Generator
        </Group>
      </Title>

      <Stack gap="md">
        <Select
          label="Report Type"
          placeholder="Select report type"
          data={REPORT_TYPES}
          value={reportType}
          onChange={setReportType}
          required
          w={300}
        />

        <Group align="flex-end">
          <Select
            label="Year"
            data={YEAR_OPTIONS}
            value={year}
            onChange={setYear}
            w={160}
          />
          <Select
            label="Department"
            placeholder="All Departments"
            data={DEPARTMENT_OPTIONS}
            value={department}
            onChange={(val) => setDepartment(val || "")}
            clearable
            w={250}
          />
        </Group>

        <Radio.Group
          label="Export Format"
          value={format}
          onChange={setFormat}
        >
          <Group mt="xs">
            <Radio
              value="pdf"
              label={
                <Group gap={6}>
                  <FilePdf size={16} />
                  PDF
                </Group>
              }
            />
            <Radio
              value="excel"
              label={
                <Group gap={6}>
                  <FileXls size={16} />
                  Excel
                </Group>
              }
            />
          </Group>
        </Radio.Group>

        <Group mt="md">
          <Button
            onClick={handleGenerate}
            loading={loading}
            leftSection={<FileArrowDown size={18} />}
          >
            Generate Report
          </Button>
        </Group>

        {loading && (
          <Group justify="center">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">
              Generating report...
            </Text>
          </Group>
        )}

        {downloadUrl && (
          <Card withBorder p="md" bg="green.0">
            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Text fw={500}>Report Ready</Text>
                <Text size="sm" c="dimmed">
                  {downloadUrl.filename}
                </Text>
              </Stack>
              <Button
                color="green"
                onClick={handleDownload}
                leftSection={
                  format === "pdf" ? (
                    <FilePdf size={18} />
                  ) : (
                    <FileXls size={18} />
                  )
                }
              >
                Download {format === "pdf" ? "PDF" : "Excel"}
              </Button>
            </Group>
          </Card>
        )}
      </Stack>
    </Paper>
  );
}

import React, { useEffect, useState } from "react";
import {
  Card,
  Paper,
  Table,
  Text,
  Group,
  Button,
  Loader,
  Alert,
  Title,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
} from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  announce_result,
  update_result_announcement,
  create_announcemet,
} from "./routes/examinationRoutes.jsx";

export default function AnnounceResult() {
  const userRole = useSelector((state) => state.user.role);
  const [announcements, setAnnouncements] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({ batch: null });
  const [semesterType, setSemesterType] = useState(null);
  const [semesterNo, setSemesterNo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const SEMESTER_TYPES = [
    { value: "Odd Semester",    label: "Odd Semester" },
    { value: "Even Semester",   label: "Even Semester" },
    { value: "Summer Semester", label: "Summer Semester" },
  ];

  const semesterNoOptions = (() => {
    if (!semesterType) return [];
    if (semesterType === "Odd Semester")
      return Array.from({ length: 6 }, (_, i) => ({
        value: String(2 * i + 1),
        label: `Semester ${2 * i + 1}`,
      }));
    if (semesterType === "Even Semester")
      return Array.from({ length: 6 }, (_, i) => ({
        value: String(2 * i + 2),
        label: `Semester ${2 * i + 2}`,
      }));
    return Array.from({ length: 6 }, (_, i) => ({
      value: String(2 * i + 2),
      label: `Summer ${i + 1}`,
    }));
  })();

  const handleSemesterTypeChange = (val) => {
    setSemesterType(val);
    setSemesterNo(null);
  };

  useEffect(() => {
    setInitialLoading(true);
    const token = localStorage.getItem("authToken");
    axios
      .get(announce_result, {
        params: { role: userRole },
        headers: { Authorization: `Token ${token}` },
      })
      .then(({ data }) => {
        setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
        setBatchOptions(
          Array.isArray(data.batches)
            ? data.batches.map((b) => ({ value: String(b.id), label: b.label }))
            : []
        );
      })
      .catch(() => {
        setFetchError("Could not load announcements. Please refresh the page.");
      })
      .finally(() => setInitialLoading(false));
  }, [userRole]);

  const handleChange = (field) => (value) => {
    setFormData((f) => ({ ...f, [field]: value }));
  };

  const isDuplicate = !!(formData.batch && semesterType && semesterNo) && announcements.some(
    (a) =>
      String(a.batch?.id) === formData.batch &&
      a.semester === parseInt(semesterNo, 10) &&
      a.semester_type === semesterType
  );

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.batch)   errors.batch = "Please select a batch";
    if (!semesterType)     errors.semesterType = "Please select a semester type";
    if (!semesterNo)       errors.semesterNo = "Please select a semester";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        create_announcemet,
        {
          Role: userRole,
          batch: formData.batch,
          semester: parseInt(semesterNo, 10),
          semester_type: semesterType,
        },
        { headers: { Authorization: `Token ${token}` } }
      );
      const ann = response.data;
      if (response.status === 201) {
        setAnnouncements((prev) => [ann, ...prev]);
        showNotification({ title: "Announcement Created", message: "Result announcement has been created successfully.", color: "green" });
      } else {
        setAnnouncements((prev) => prev.map((a) => (a.id === ann.id ? ann : a)));
        showNotification({ title: "Already Exists", message: "An announcement for this batch and semester already exists.", color: "blue" });
      }
      setFormData({ batch: null });
      setSemesterType(null);
      setSemesterNo(null);
    } catch (err) {
      const status = err?.response?.status;
      let message = "Something went wrong. Please try again.";
      if (status === 400) message = "Invalid selection. Please check the batch and semester details.";
      else if (status === 403) message = "You do not have permission to create announcements.";
      else if (status === 404) message = "Selected batch was not found. Please refresh and try again.";
      else if (status === 409) message = "An announcement for this batch and semester already exists.";
      showNotification({ title: "Could Not Create Announcement", message, color: "red" });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAnnouncement = async (id, currentStatus) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.post(
        update_result_announcement,
        { id, announced: !currentStatus, Role: userRole },
        { headers: { Authorization: `Token ${token}` } }
      );
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, announced: !currentStatus } : item
        )
      );
      showNotification({
        title: currentStatus ? "Announcement Reverted" : "Result Published",
        message: currentStatus
          ? "The result announcement has been reverted."
          : "The result has been published to students.",
        color: currentStatus ? "orange" : "green",
      });
    } catch {
      showNotification({
        title: "Action Failed",
        message: "Could not update the announcement. Please try again.",
        color: "red",
      });
    }
  };

  const semesterSortKey = (semester, semesterType) => {
    const n = parseInt(semester, 10);
    let group, pos;
    if (semesterType === "Odd Semester")       { group = (n - 1) / 2; pos = 0; }
    else if (semesterType === "Even Semester") { group = n / 2 - 1;   pos = 1; }
    else                                       { group = n / 2 - 1;   pos = 2; }
    return group * 3 + pos;
  };

  const filteredAnnouncements = announcements
    .filter((item) =>
      item.batch?.label?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const degCmp = (a.batch?.name ?? "").localeCompare(b.batch?.name ?? "");
      if (degCmp !== 0) return degCmp;
      const yearDiff = (b.batch?.year ?? 0) - (a.batch?.year ?? 0);
      if (yearDiff !== 0) return yearDiff;
      const discCmp = (a.batch?.discipline ?? "").localeCompare(b.batch?.discipline ?? "");
      if (discCmp !== 0) return discCmp;
      return semesterSortKey(b.semester, b.semester_type) - semesterSortKey(a.semester, a.semester_type);
    });

  if (initialLoading)
    return (
      <Card p="lg" radius="md" withBorder>
        <Group position="center">
          <Loader size="lg" />
          <Text>Loading...</Text>
        </Group>
      </Card>
    );

  if (fetchError)
    return (
      <Card p="lg" radius="md" withBorder>
        <Alert icon={<IconX size={16} />} title="Failed to Load" color="red">
          {fetchError}
        </Alert>
      </Card>
    );

  return (
    <Card p="lg" radius="md" withBorder>
      <Title order={2} mb="md">
        Announce Result
      </Title>

      <Paper shadow="sm" p="md" withBorder mb="md">
        <form onSubmit={handleCreateAnnouncement}>
          <Stack spacing="md">
            <SimpleGrid cols={3} spacing="md">
              <Select
                label="Batch"
                placeholder="Select Batch"
                data={batchOptions}
                value={formData.batch}
                onChange={(v) => { setFormData((f) => ({ ...f, batch: v })); setFieldErrors((e) => ({ ...e, batch: null })); }}
                error={fieldErrors.batch}
                required
              />
              <Select
                label="Semester Type"
                placeholder="Select Semester Type"
                data={SEMESTER_TYPES}
                value={semesterType}
                onChange={(v) => { handleSemesterTypeChange(v); setFieldErrors((e) => ({ ...e, semesterType: null })); }}
                error={fieldErrors.semesterType}
                required
              />
              <Select
                label="Semester"
                placeholder={semesterType ? "Select Semester" : "Select Semester"}
                data={semesterNoOptions}
                value={semesterNo}
                onChange={(v) => { setSemesterNo(v); setFieldErrors((e) => ({ ...e, semesterNo: null })); }}
                disabled={!semesterType}
                error={fieldErrors.semesterNo}
                required
              />
            </SimpleGrid>

            <Group position="right">
              <Button type="submit" variant="outline" disabled={submitting || isDuplicate} loading={submitting}>
                {isDuplicate ? "Already Exists" : "Create Announcement"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>

      <Paper shadow="sm" p="md" withBorder>
        <TextInput
          placeholder="Search by batch..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          icon={<IconSearch size={16} />}
          mb="md"
        />
        <Table highlightOnHover striped>
          <thead>
            <tr>
              <th>Batch</th>
              <th>Semester</th>
              <th>Announced</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnnouncements.map((item) => (
              <tr key={item.id}>
                <td>{item.batch?.label || "N/A"}</td>
                <td>{item.semester_label || item.semester}</td>
                <td>{item.announced ? "Yes" : "No"}</td>
                <td>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => toggleAnnouncement(item.id, item.announced)}
                  >
                    {item.announced ? "Revert" : "Publish"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Paper>
    </Card>
  );
}

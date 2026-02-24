import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, Table, Button, Group, Badge, Checkbox, Select, ActionIcon, Tooltip, Alert, Loader, Title, Box, Card, Stack } from '@mantine/core';
import { IconDownload, IconCheck, IconX, IconArrowBackUp, IconTrash } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import * as XLSX from 'xlsx';
import { 
  adminSwayamListRequestsRoute,
  adminSwayamApproveRoute,
  adminSwayamRejectRoute,
  adminSwayamRevertRoute,
  adminSwayamDeleteRoute
} from '../../routes/academicRoutes';

const SEMESTER_CHOICES = [
  { value: 'Odd Semester', label: 'Odd Semester' },
  { value: 'Even Semester', label: 'Even Semester' },
  { value: 'Summer Semester', label: 'Summer Semester' },
];

const generateAcademicYears = () => {
  const endYear = new Date().getFullYear();
  const years = [];
  for (let y = endYear; y >= 2020; y--) {
    years.push({ value: `${y}-${String(y + 1).slice(-2)}`, label: `${y}-${String(y + 1).slice(-2)}` });
  }
  return years;
};

const AdminSwayamDashboard = () => {
  const [activeRequestTab, setActiveRequestTab] = useState('replace');
  const [activeStatusTab, setActiveStatusTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [academicYear, setAcademicYear] = useState('');
  const [semesterType, setSemesterType] = useState('');
  const academicYears = useMemo(() => generateAcademicYears(), []);

  useEffect(() => {
    fetchRequests();
  }, [activeRequestTab, activeStatusTab, academicYear, semesterType]);

  const fetchRequests = async () => {
    if (!academicYear || !semesterType) {
      setRequests([]);
      return;
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      const requestType = activeRequestTab === 'extra_credits' ? 'Extra_Credits' : 'Swayam_Replace';
      const statusParam = activeStatusTab === 'pending' ? 'Pending' : 
                          activeStatusTab === 'approved' ? 'Approved' : 'Rejected';
      
      const response = await fetch(
        `${adminSwayamListRequestsRoute}?request_type=${requestType}&status=${statusParam}&academic_year=${academicYear}&semester_type=${semesterType}`,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch requests');

      const data = await response.json();
      setRequests(data.requests || []);
      setCounts(data.counts || { pending: 0, approved: 0, rejected: 0, total: 0 });
      setSelectedIds([]);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to fetch requests',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      const endpointMap = {
        approve: adminSwayamApproveRoute,
        reject: adminSwayamRejectRoute,
        revert: adminSwayamRevertRoute,
        delete: adminSwayamDeleteRoute
      };
      const endpoint = endpointMap[action];

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_id: requestId }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} request`);

      showNotification({
        title: 'Success',
        message: `Request ${action}d successfully`,
        color: 'green',
      });

      fetchRequests();
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      showNotification({
        title: 'Error',
        message: `Failed to ${action} request`,
        color: 'red',
      });
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) {
      showNotification({
        title: 'Warning',
        message: 'Please select at least one request',
        color: 'yellow',
      });
      return;
    }

    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      const endpointMap = {
        approve: adminSwayamApproveRoute,
        reject: adminSwayamRejectRoute,
        revert: adminSwayamRevertRoute,
        delete: adminSwayamDeleteRoute
      };
      const endpoint = endpointMap[action];
      
      for (const id of selectedIds) {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ request_id: id }),
        });
      }

      showNotification({
        title: 'Success',
        message: `${selectedIds.length} request(s) ${action}d successfully`,
        color: 'green',
      });

      fetchRequests();
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      showNotification({
        title: 'Error',
        message: `Failed to ${action} selected requests`,
        color: 'red',
      });
    }
  };

  const exportToExcel = () => {
    const exportData = requests.map((req, index) => ({
      'S. No.': index + 1,
      'Student Name': req.student.name,
      'Roll No': req.student.roll_no,
      'Batch': req.student.batch,
      'Request Type': req.request_type,
      'Old Course': req.old_course ? `${req.old_course.code} - ${req.old_course.name}` : 'N/A',
      'New Course': `${req.new_course.code} - ${req.new_course.name}`,
      'Slot': req.slot.name,
      'Status': req.status,
      'Submitted At': new Date(req.submitted_at).toLocaleString(),
      'Processed At': req.processed_at ? new Date(req.processed_at).toLocaleString() : 'N/A',
      'Academic Year': req.academic_year,
      'Semester Type': req.semester_type,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Swayam Requests');
    
    const filename = `Swayam_${activeRequestTab}_${activeStatusTab}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);

    showNotification({
      title: 'Success',
      message: 'Data exported successfully',
      color: 'green',
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === requests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(requests.map(r => r.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'yellow';
      case 'Approved':
        return 'green';
      case 'Rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const renderTable = () => {
    if (requests.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No {activeStatusTab} {activeRequestTab === 'extra_credits' ? 'Extra Credits' : 'Replace'} requests found
        </div>
      );
    }

    const columns = [
      {
        key: 'checkbox',
        header: (
          <Checkbox
            checked={selectedIds.length === requests.length && requests.length > 0}
            indeterminate={selectedIds.length > 0 && selectedIds.length < requests.length}
            onChange={toggleSelectAll}
          />
        ),
        render: (req) => (
          <Checkbox
            checked={selectedIds.includes(req.id)}
            onChange={() => toggleSelect(req.id)}
          />
        ),
      },
      { key: 'sno', header: 'S. No.', render: (req, index) => index + 1 },
      { key: 'student', header: 'Student Name', render: (req) => req.student.name },
      { key: 'roll', header: 'Roll No', render: (req) => req.student.roll_no },
      { key: 'batch', header: 'Batch', render: (req) => req.student.batch },
    ];

    if (activeRequestTab === 'replace') {
      columns.push({
        key: 'old_course',
        header: 'Old Course',
        render: (req) => req.old_course ? `${req.old_course.code} - ${req.old_course.name}` : 'N/A',
      });
    }

    columns.push(
      {
        key: 'new_course',
        header: 'New Course',
        render: (req) => `${req.new_course.code} - ${req.new_course.name}`,
      },
      { key: 'slot', header: 'Slot', render: (req) => req.slot.name },
      {
        key: 'status',
        header: 'Status',
        render: (req) => <Badge color={getStatusBadgeColor(req.status)}>{req.status}</Badge>,
      },
      {
        key: 'submitted',
        header: 'Submitted At',
        render: (req) => new Date(req.submitted_at).toLocaleString(),
      }
    );

    if (activeStatusTab !== 'pending') {
      columns.push({
        key: 'processed',
        header: 'Processed At',
        render: (req) => req.processed_at ? new Date(req.processed_at).toLocaleString() : 'N/A',
      });
    }

    columns.push({
      key: 'actions',
      header: 'Actions',
      render: (req) => (
        <Group spacing="xs">
          {activeStatusTab === 'pending' && (
            <>
              <Tooltip label="Approve">
                <ActionIcon
                  color="green"
                  variant="light"
                  onClick={() => handleAction(req.id, 'approve')}
                >
                  <IconCheck size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Reject">
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => handleAction(req.id, 'reject')}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
          {activeStatusTab === 'rejected' && (
            <Tooltip label="Revert to Pending">
              <ActionIcon
                color="blue"
                variant="light"
                onClick={() => handleAction(req.id, 'revert')}
              >
                <IconArrowBackUp size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Delete">
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => handleAction(req.id, 'delete')}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    });

    return (
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {requests.map((req, index) => (
            <tr key={req.id}>
              {columns.map((col) => (
                <td key={col.key}>{col.render(req, index)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <>
      <Card>
        <Stack spacing="md">
          <Group grow align="flex-start">
            <Select
              label="Academic Year"
              placeholder="e.g. 2025-26"
              data={academicYears}
              value={academicYear}
              onChange={setAcademicYear}
              searchable
            />
            <Select
              label="Semester Type"
              placeholder="Select semester"
              data={SEMESTER_CHOICES}
              value={semesterType}
              onChange={setSemesterType}
            />
          </Group>
          <Group position="left">
            <Button
              size="sm"
              onClick={fetchRequests}
              loading={loading}
              disabled={!academicYear || !semesterType}
            >
              Refresh
            </Button>
          </Group>
        </Stack>
      </Card>

      {/* Main tabs */}
      <Tabs
        value={activeRequestTab}
        onChange={setActiveRequestTab}
        variant="pills"
        color="blue"
        keepMounted={false}
      >
        <Box
          style={{
            background: "#f1f5f9",
            borderBottom: "1px solid #dde3ea",
            padding: "10px 16px",
          }}
        >
          <Tabs.List style={{ gap: 6, flexWrap: "nowrap" }}>
            <Tabs.Tab
              value="replace"
              style={{
                fontWeight: activeRequestTab === "replace" ? 700 : 500,
                fontSize: 14,
                padding: "9px 20px",
                borderRadius: 6,
              }}
            >
              Replace with Swayam
            </Tabs.Tab>
            <Tabs.Tab
              value="extra_credits"
              style={{
                fontWeight: activeRequestTab === "extra_credits" ? 700 : 500,
                fontSize: 14,
                padding: "9px 20px",
                borderRadius: 6,
              }}
            >
              Extra Credits
            </Tabs.Tab>
          </Tabs.List>
        </Box>

        {/* Static panel for each tab */}
        {["replace", "extra_credits"].map((tabVal) => (
          <Tabs.Panel key={tabVal} value={tabVal} style={{ background: "#fff" }}>
            {loading ? (
              <Box style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                <Loader size="lg" />
              </Box>
            ) : !academicYear || !semesterType ? (
              <Box p="lg">
                <Alert color="gray">
                  Select academic year and semester to view Swayam requests.
                </Alert>
              </Box>
            ) : (
              <Tabs
                value={activeStatusTab}
                onChange={setActiveStatusTab}
                variant="unstyled"
                keepMounted={false}
              >
                <Box
                  style={{
                    background: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                    padding: "0 28px",
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <Tabs.List style={{ gap: 0, border: "none" }}>
                    {[
                      { value: "pending",  label: `Pending (${counts.pending})` },
                      { value: "approved", label: `Approved (${counts.approved})` },
                      { value: "rejected", label: `Rejected (${counts.rejected})` },
                    ].map(({ value, label }) => {
                      const isActive = activeStatusTab === value;
                      return (
                        <Tabs.Tab
                          key={value}
                          value={value}
                          style={{
                            fontSize: 13,
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? "#228be6" : "#6c757d",
                            padding: "10px 20px",
                            borderBottom: isActive ? "2px solid #228be6" : "2px solid transparent",
                            marginBottom: -2,
                            background: "transparent",
                            borderRadius: 0,
                            cursor: "pointer",
                            transition: "color 0.15s, border-color 0.15s",
                          }}
                        >
                          {label}
                        </Tabs.Tab>
                      );
                    })}
                  </Tabs.List>
                </Box>

                {["pending", "approved", "rejected"].map((statusVal) => (
                  <Tabs.Panel key={statusVal} value={statusVal}>
                  <Box p="lg" style={{ background: "#fff" }}>
                    <Group position="apart" mb="md">
                      <Title order={5} style={{ color: "#333" }}>
                        {activeRequestTab === "extra_credits" ? "Extra Credits" : "Replace with Swayam"}{" "}
                        — {activeStatusTab.charAt(0).toUpperCase() + activeStatusTab.slice(1)} Requests
                      </Title>
                      <Group spacing="xs">
                        {activeStatusTab === "pending" && (
                          <>
                            <Button
                              size="sm"
                              color="green"
                              variant="outline"
                              leftSection={<IconCheck size={16} />}
                              onClick={() => handleBulkAction("approve")}
                              disabled={selectedIds.length === 0}
                            >
                              Approve ({selectedIds.length})
                            </Button>
                            <Button
                              size="sm"
                              color="red"
                              variant="outline"
                              leftSection={<IconX size={16} />}
                              onClick={() => handleBulkAction("reject")}
                              disabled={selectedIds.length === 0}
                            >
                              Reject ({selectedIds.length})
                            </Button>
                          </>
                        )}
                        {activeStatusTab === "rejected" && (
                          <Button
                            size="sm"
                            color="blue"
                            variant="outline"
                            leftSection={<IconArrowBackUp size={16} />}
                            onClick={() => handleBulkAction("revert")}
                            disabled={selectedIds.length === 0}
                          >
                            Revert to Pending ({selectedIds.length})
                          </Button>
                        )}
                        <Button
                          size="sm"
                          color="red"
                          variant="outline"
                          leftSection={<IconTrash size={16} />}
                          onClick={() => handleBulkAction("delete")}
                          disabled={selectedIds.length === 0}
                        >
                          Delete ({selectedIds.length})
                        </Button>
                        <Button
                          size="sm"
                          color="blue"
                          leftSection={<IconDownload size={16} />}
                          onClick={exportToExcel}
                        >
                          Export to Excel
                        </Button>
                      </Group>
                    </Group>

                    {requests.length > 0 ? (
                      renderTable()
                    ) : (
                      <Alert color="blue">
                        No {activeStatusTab}{" "}
                        {activeRequestTab === "extra_credits" ? "Extra Credits" : "Replace with Swayam"}{" "}
                        requests.
                      </Alert>
                    )}
                  </Box>
                  </Tabs.Panel>
                ))}
              </Tabs>
            )}
          </Tabs.Panel>
        ))}
      </Tabs>
    </>
  );
};

export default AdminSwayamDashboard;

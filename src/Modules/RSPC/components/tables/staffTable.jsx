import PropTypes from "prop-types";
import cx from "clsx";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  Container,
  Text,
  Loader,
  Button,
  ScrollArea,
} from "@mantine/core";
import {
  Eye,
  DownloadSimple,
  FileText,
  ArrowUp,
  ArrowDown,
  ArrowsDownUp,
} from "@phosphor-icons/react";
import axios from "axios";
import classes from "../../styles/tableStyle.module.css";
import { fetchStaffRoute } from "../../../../routes/RSPCRoutes";
import StaffViewModal from "../modals/staffViewModal";
import JoiningReportAndIDCardFormModal from "../modals/joiningReportAndIDCardFormModal";
import { host } from "../../../../routes/globalRoutes";

function StaffTable({ projectData }) {
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(true);
  const role = useSelector((state) => state.user.role);
  const [documentModalOpened, setDocumentModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const sortData = (data, column) => {
    const sorted = [...data].sort((a, b) => {
      if (a[column] === null || a[column] === undefined) return 1;
      if (b[column] === null || b[column] === undefined) return -1;

      const aValue =
        typeof a[column] === "string" ? a[column].toLowerCase() : a[column];
      const bValue =
        typeof b[column] === "string" ? b[column].toLowerCase() : b[column];

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  };
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const [staff, setStaff] = useState([]);
  useEffect(() => {
    setLoading(true);
    const fetchStaffData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return console.error("No authentication token found!");

      try {
        const response = await axios.get(fetchStaffRoute, {
          params: { "pids[]": [projectData.pid], type: 3 },
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true, // Include credentials if necessary
        });
        console.log("Fetched Staff:", response.data);
        setStaff(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error during fetching details:", error);
        setLoading(false);
        setFetched(false);
      }
    };
    fetchStaffData();
  }, projectData);

  const handleViewClick = (row) => {
    setSelectedStaff(row);
    setViewModalOpened(true);
  };
  const handleActionClick = (row) => {
    setSelectedStaff(row);
    setDocumentModalOpened(true);
  };

  const displayedStaff = sortColumn ? sortData(staff, sortColumn) : staff;
  const staffRows = displayedStaff.map((row, index) => {
    const startDate = row.start_date ? new Date(row.start_date) : null;
    const endDate =
      startDate && row.duration > 0
        ? new Date(startDate.setMonth(startDate.getMonth() + row.duration))
        : null;
    const isOver = endDate && new Date() > endDate;
    return (
      <Table.Tr key={index} style={isOver && { backgroundColor: "#D3D3D3" }}>
        <Table.Td className={classes["row-content"]}>{row.person}</Table.Td>
        <Table.Td className={classes["row-content"]}>{row.type}</Table.Td>
        <Table.Td className={classes["row-content"]}>
          {row.start_date
            ? new Date(row.start_date).toLocaleDateString()
            : "---"}
        </Table.Td>
        <Table.Td className={classes["row-content"]}>
          {row.duration > 0 ? `${row.duration} months` : "---"}
        </Table.Td>
        <Table.Td className={classes["row-content"]}>
          {row.salary_per_month > 0 ? `₹${row.salary_per_month}` : "---"}
        </Table.Td>
        <Table.Td className={classes["row-content"]}>
          {role.includes("SectionHead_RSPC") ? (
            <Button
              onClick={() => handleActionClick(row)}
              variant="outline"
              color="#15ABFF"
              size="xs"
              disabled={projectData.status !== "OnGoing"}
              style={{ borderRadius: "8px" }}
            >
              <FileText size={26} style={{ marginRight: "3px" }} />
              Document Upload
            </Button>
          ) : (
            <Button
              variant="outline"
              color="#15ABFF"
              size="xs"
              style={{ borderRadius: "8px" }}
              component="a"
              href={
                row.joining_report ? `${host}/${row.joining_report}` : undefined
              } // Directly access the file URL
              target="_blank"
              rel="noopener noreferrer"
              disabled={!row.joining_report}
            >
              <DownloadSimple size={26} style={{ marginRight: "3px" }} />
              Open Report
            </Button>
          )}
        </Table.Td>
        <Table.Td className={classes["row-content"]}>
          <Button
            onClick={() => handleViewClick(row)}
            variant="outline"
            color="#15ABFF"
            size="xs"
            style={{ borderRadius: "8px" }}
          >
            <Eye size={26} style={{ margin: "3px" }} />
            View
          </Button>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <div style={{ padding: "3% 5%" }}>
      <ScrollArea
        h={350}
        onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
      >
        <Table highlightOnHover>
          <Table.Thead
            className={cx(classes.header, { [classes.scrolled]: scrolled })}
          >
            <Table.Tr>
              <Table.Th
                className={classes["header-cell"]}
                onClick={() => handleSort("person")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Name
                  {sortColumn === "person" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp size={16} style={{ marginLeft: "5px" }} />
                    ) : (
                      <ArrowDown size={16} style={{ marginLeft: "5px" }} />
                    )
                  ) : (
                    <ArrowsDownUp size={16} style={{ marginLeft: "5px" }} />
                  )}
                </div>
              </Table.Th>
              <Table.Th
                className={classes["header-cell"]}
                onClick={() => handleSort("type")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Designation
                  {sortColumn === "type" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp size={16} style={{ marginLeft: "5px" }} />
                    ) : (
                      <ArrowDown size={16} style={{ marginLeft: "5px" }} />
                    )
                  ) : (
                    <ArrowsDownUp size={16} style={{ marginLeft: "5px" }} />
                  )}
                </div>
              </Table.Th>
              <Table.Th
                className={classes["header-cell"]}
                onClick={() => handleSort("start_date")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Joining Date
                  {sortColumn === "start_date" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp size={16} style={{ marginLeft: "5px" }} />
                    ) : (
                      <ArrowDown size={16} style={{ marginLeft: "5px" }} />
                    )
                  ) : (
                    <ArrowsDownUp size={16} style={{ marginLeft: "5px" }} />
                  )}
                </div>
              </Table.Th>
              <Table.Th
                className={classes["header-cell"]}
                onClick={() => handleSort("duration")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Tenure
                  {sortColumn === "duration" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp size={16} style={{ marginLeft: "5px" }} />
                    ) : (
                      <ArrowDown size={16} style={{ marginLeft: "5px" }} />
                    )
                  ) : (
                    <ArrowsDownUp size={16} style={{ marginLeft: "5px" }} />
                  )}
                </div>
              </Table.Th>
              <Table.Th
                className={classes["header-cell"]}
                onClick={() => handleSort("salary_per_month")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Salary (per month)
                  {sortColumn === "salary_per_month" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp size={16} style={{ marginLeft: "5px" }} />
                    ) : (
                      <ArrowDown size={16} style={{ marginLeft: "5px" }} />
                    )
                  ) : (
                    <ArrowsDownUp size={16} style={{ marginLeft: "5px" }} />
                  )}
                </div>
              </Table.Th>
              <Table.Th className={classes["header-cell"]}>
                Joining Report
              </Table.Th>
              <Table.Th className={classes["header-cell"]}>
                File Details
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan="6">
                  <Container py="xl">
                    <Loader size="lg" />
                  </Container>
                </Table.Td>
              </Table.Tr>
            ) : fetched ? (
              <> {staffRows} </>
            ) : (
              <Table.Tr>
                <Table.Td colSpan="6" align="center">
                  <Text color="red" align="center">
                    Failed to load staff details
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <StaffViewModal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        staffData={selectedStaff}
      />
      <JoiningReportAndIDCardFormModal
        opened={documentModalOpened}
        onClose={() => setDocumentModalOpened(false)}
        staffData={selectedStaff}
      />
    </div>
  );
}

StaffTable.propTypes = {
  projectData: PropTypes.shape({
    pid: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
};

export default StaffTable;

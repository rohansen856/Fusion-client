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
  Badge,
  ScrollArea,
} from "@mantine/core";
import {
  ArrowBendDoubleUpRight,
  ArrowDown,
  ArrowsDownUp,
  ArrowUp,
  Eye,
  FileText,
} from "@phosphor-icons/react";
import axios from "axios";
import classes from "../../styles/tableStyle.module.css";
import { fetchStaffRoute, fetchPIDsRoute } from "../../../../routes/RSPCRoutes";
import StaffViewModal from "../modals/staffViewModal";
import { badgeColor } from "../../helpers/badgeColours";
import SelectionCommitteeReportApprovalModal from "../modals/selectionCommitteeReportApprovalModal";
import AdvertisementAndCommitteeApprovalModal from "../modals/advertisementAndCommitteeApprovalModal";

function InboxTable({ setActiveTab }) {
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(true);
  const role = useSelector((state) => state.user.role);

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

  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [reportApprovalModalOpened, setReportApprovalModalOpened] =
    useState(false);
  const [
    advertisementAndCommitteeApprovalModalOpened,
    setAdvertisementAndCommitteeApprovalModalOpened,
  ] = useState(false);

  const [PIDs, setPIDs] = useState([]);
  useEffect(() => {
    const fetchPIDs = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return console.error("No authentication token found!");
      try {
        const response = await axios.get(fetchPIDsRoute(role), {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log("Fetched PIDs:", response.data);
        setPIDs(response.data);
      } catch (error) {
        console.error("Error during Axios GET:", error);
      }
    };
    fetchPIDs();
  }, [role]);

  const handleViewClick = (row) => {
    setSelectedStaff(row);
    setViewModalOpened(true);
  };

  const handleActionClick = (row) => {
    setSelectedStaff(row);
    if (!row.final_selection || row.final_selection.length === 0) {
      setAdvertisementAndCommitteeApprovalModalOpened(true);
    } else {
      setReportApprovalModalOpened(true);
    }
  };

  const [staffRequests, setStaffRequests] = useState([]);
  useEffect(() => {
    setLoading(true);
    const fetchStaffData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return console.error("No authentication token found!");

      try {
        const response = await axios.get(fetchStaffRoute, {
          params: { "pids[]": PIDs, role, type: 2 },
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true, // Include credentials if necessary
        });
        console.log("Fetched Staff:", response.data);
        const enrichedData = response.data.map((row) => ({
          ...row,
          approval_type:
            !row.final_selection || row.final_selection.length === 0
              ? "Advertisement"
              : "Committee Report",
        }));
        setStaffRequests(enrichedData);
        setLoading(false);
      } catch (error) {
        console.error("Error during fetching details:", error);
        setLoading(false);
        setFetched(false);
      }
    };
    fetchStaffData();
  }, [PIDs]);

  const displayedStaff = sortColumn
    ? sortData(staffRequests, sortColumn)
    : staffRequests;
  const staffRows = displayedStaff.map((row, index) => (
    <Table.Tr key={index}>
      <Table.Td className={classes["row-content"]}>
        <Badge
          color={badgeColor[row.approval]}
          size="lg"
          style={{ minWidth: "180px", color: "#3f3f3f" }}
        >
          {row.approval}
        </Badge>
      </Table.Td>
      <Table.Td className={classes["row-content"]}>{row.type}</Table.Td>
      <Table.Td className={classes["row-content"]}>
        {row.project_title}
      </Table.Td>
      <Table.Td className={classes["row-content"]}>{row.pid}</Table.Td>
      <Table.Td className={classes["row-content"]}>
        {row.approval_type}
      </Table.Td>
      <Table.Td className={classes["row-content"]}>
        <Button
          onClick={() => handleActionClick(row)}
          variant="outline"
          color="#15ABFF"
          size="xs"
          style={{ borderRadius: "8px" }}
        >
          {role.includes("HOD") ? (
            <>
              <ArrowBendDoubleUpRight
                size={26}
                style={{ marginRight: "3px" }}
              />
              Forward
            </>
          ) : (
            <>
              <FileText size={26} style={{ marginRight: "3px" }} />
              Approve
            </>
          )}
        </Button>
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
  ));

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
                onClick={() => handleSort("approval")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Status
                  {sortColumn === "approval" ? (
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
                  Staff Designation
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
                onClick={() => handleSort("project_title")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Project Title
                  {sortColumn === "project_title" ? (
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
                onClick={() => handleSort("pid")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Project ID
                  {sortColumn === "pid" ? (
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
                onClick={() => handleSort("approval_type")}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Approval Type
                  {sortColumn === "approval_type" ? (
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
                Action Centre
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
                    Failed to load personnel details
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
      <SelectionCommitteeReportApprovalModal
        opened={reportApprovalModalOpened}
        onClose={() => setReportApprovalModalOpened(false)}
        staffData={selectedStaff}
        setActiveTab={setActiveTab}
      />
      <AdvertisementAndCommitteeApprovalModal
        opened={advertisementAndCommitteeApprovalModalOpened}
        onClose={() => setAdvertisementAndCommitteeApprovalModalOpened(false)}
        staffData={selectedStaff}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}

InboxTable.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
};

export default InboxTable;

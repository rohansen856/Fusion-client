import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Container,
  Table,
  Button,
  Title,
  Loader,
  Grid,
  Select,
  Paper,
  TextInput,
  Group,
  Text,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import ViewRequestFile from "./ViewRequestFile";
import { IWD_ROUTES } from "../routes/iwdRoutes";
import { GetRequestsOrBills } from "../handlers/handlers";

function CreatedRequests() {
  const role = useSelector((state) => state.user.role);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
  };

  const handleBackToList = () => {
    setSelectedRequest(null);
    setRefresh((prev) => !prev);
  };

  const [createdRequestsList, setRequestsList] = useState([]);
  useEffect(() => {
    GetRequestsOrBills({
      setLoading,
      setList: setRequestsList,
      role,
      URL: IWD_ROUTES.REQUESTS_STATUS,
    });
  }, [role, refresh]);

  // const filteredRequests = createdRequestsList.filter(
  //   (request) => statusFilter === "all" || request.status === statusFilter,
  // );
  const filteredRequests = createdRequestsList
    .sort((a, b) => new Date(b.creatiion_time) - new Date(a.creatiion_time))
    .filter((request) => {
      const matchesStatus = !statusFilter || request.status === statusFilter;

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        request.name?.toLowerCase().includes(query) ||
        request.description?.toLowerCase().includes(query) ||
        request.status?.toLowerCase().includes(query) ||
        request.area?.toLowerCase().includes(query) ||
        request.requestCreatedBy?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  const statusList = [
    { value: "all", label: "All" },
    { value: "Work Completed", label: "Work Completed" },
    {
      value: "Approved by the director",
      label: "Approved",
    },
    { value: "Approved by the IWD Admin", label: "Approved by the IWD Admin" },
    { value: "Rejected by the IWD Admin", label: "Rejected" },
    { value: "Rejected by the director", label: "Rejected by the Director" },
    { value: "Pending", label: "Pending" },
    { value: "Work Order issued", label: "Work Order issued" },
    { value: "Approved by the dean", label: "Approved by the Dean" },
    { value: "Proposal created", label: "Proposal Created" },
  ];
  return (
    <Grid
      style={{
        maxHeight: "100vh",
      }}
    >
      <div
        className="contains"
        style={{
          maxWidth: "100vw",
          width: "100vw",
          margin: "0 auto",
          maxHeight: "100vh",
          padding: "1rem",
        }}
      >
        <br />
        {loading ? (
          <Grid mt="xl">
            <Container py="xl">
              <Loader size="lg" />
            </Container>
          </Grid>
        ) : !selectedRequest ? (
          <Paper
            style={{
              padding: "20px",
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.15)",
              // borderLeft: "0.6rem solid #15ABFF",
              maxHeight: "100vh",
              overflow: "auto",
              margin: "0 auto",
            }}
          >
            <Title align="center" mt="md">
              Requests Status
            </Title>
            <Group align="end" spacing="md" mb="md">
              <Select
                label="Filter by Status"
                placeholder="Select status"
                value={statusFilter}
                onChange={setStatusFilter}
                data={statusList}
                radius="sm"
                size="md"
                withinPortal
                searchable
                nothingFound="No status found"
                style={{
                  marginBottom: "20px",
                  width: "30vw",
                }}
              />
              <TextInput
                placeholder="Search requests..."
                icon={<IconSearch size="0.9rem" />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                radius="sm"
                size="md"
                style={{ marginBottom: "20px", width: "50vw" }}
              />
            </Group>
            <div style={{ maxHeight: "55vh", overflow: "auto" }}>
              <Table
                highlightOnHover
                withBorder
                withColumnBorders
                striped={false}
              >
                <thead style={{ backgroundColor: "#f5f5f5" }}>
                  <tr>
                    <th>
                      <Title size="lg">ID</Title>
                    </th>
                    <th>
                      <Title size="lg">Title</Title>
                    </th>
                    <th>
                      <Title size="lg">Description</Title>
                    </th>
                    <th>
                      <Title size="lg">Area</Title>
                    </th>
                    <th>
                      <Title size="lg">Created By</Title>
                    </th>
                    <th>
                      <Title size="lg">Status</Title>
                    </th>
                    <th>
                      <Title size="lg">Actions</Title>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request, index) => (
                    <tr key={index} id={request.request_id}>
                      <td>
                        <Text>{request.request_id}</Text>
                      </td>
                      <td>
                        <Text
                          style={{ marginTop: "10px", marginBottom: "10px" }}
                        >
                          {request.name}
                        </Text>
                      </td>
                      <td>
                        <Text
                          style={{ marginTop: "10px", marginBottom: "10px" }}
                        >
                          {request.description}
                        </Text>
                      </td>
                      <td>
                        <Text
                          style={{ marginTop: "10px", marginBottom: "10px" }}
                        >
                          {request.area}
                        </Text>
                      </td>
                      <td>
                        <Text
                          style={{ marginTop: "10px", marginBottom: "10px" }}
                        >
                          {request.requestCreatedBy}
                        </Text>
                      </td>
                      <td>
                        <Text
                          style={{ marginTop: "10px", marginBottom: "10px" }}
                        >
                          {request.status}
                        </Text>
                      </td>
                      <td>
                        <Button
                          size="xs"
                          onClick={() => handleViewRequest(request)}
                          radius="sm"
                          color="green"
                          variant="filled"
                          style={{ margin: "10px" }}
                        >
                          <Text fw="bold">View File</Text>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Paper>
        ) : (
          <ViewRequestFile
            request={selectedRequest}
            handleBackToList={handleBackToList}
          />
        )}
      </div>
    </Grid>
  );
}

export default CreatedRequests;

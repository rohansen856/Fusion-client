import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Container,
  Table,
  Button,
  Title,
  Loader,
  Grid,
  Paper,
  TextInput,
  Text,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import ViewWorkFile from "./viewWorkFile";
import { IWD_ROUTES } from "../routes/iwdRoutes";
import { GetRequestsOrBills } from "../handlers/handlers";

export default function WorkDetails() {
  const role = useSelector((state) => state.user.role);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
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
      URL: IWD_ROUTES.ISSUED_WORK,
    });
  }, [role, refresh]);

  const filteredRequests = createdRequestsList
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
    .filter((request) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        request.name?.toLowerCase().includes(query) ||
        request.status?.toLowerCase().includes(query) ||
        request.area?.toLowerCase().includes(query) ||
        request.work_issuer?.toLowerCase().includes(query);

      return matchesSearch;
    });

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
              Work Details
            </Title>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <TextInput
                placeholder="Search requests..."
                align="center"
                icon={<IconSearch size="0.9rem" />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                radius="sm"
                size="md"
                style={{ marginBottom: "20px", width: "50vw" }}
              />
            </div>
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
                      <Title size="lg">Area</Title>
                    </th>
                    <th>
                      <Title size="lg">Work Issuer</Title>
                    </th>
                    <th>
                      <Title size="lg">Start Date</Title>
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
                          {request.area}
                        </Text>
                      </td>
                      <td>
                        <Text
                          style={{ marginTop: "10px", marginBottom: "10px" }}
                        >
                          {request.work_issuer}
                        </Text>
                      </td>
                      <td>
                        <Text
                          style={{ marginTop: "10px", marginBottom: "10px" }}
                        >
                          {request.start_date}
                        </Text>
                      </td>
                      <td>
                        <Text
                          style={{ marginTop: "10px", marginBottom: "10px" }}
                        >
                          {request.work_completed === 1
                            ? "Work Completed"
                            : "Pending"}
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
          <ViewWorkFile
            request={selectedRequest}
            handleBackToList={handleBackToList}
          />
        )}
      </div>
    </Grid>
  );
}

import { useSelector } from "react-redux";
import { useState, useContext, useEffect } from "react";
import "../GlobTable.css";
import {
  Card,
  Text,
  Table,
  Tabs,
  Button,
  Paper,
  Title,
  Collapse,
  Divider,
  Box,
  Grid,
  Container,
  Loader,
} from "@mantine/core";
import { Plus } from "phosphor-react";
import AddVendor from "./addvendor/AddVendor";
import { WorkContext } from "../../helper/WorkContext";
import classes from "../../../Dashboard/Dashboard.module.css";
import { GetVendorData } from "../../handlers/handlers";

export default function Vendors() {
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const role = useSelector((state) => state.user.role);
  const { workDetails } = useContext(WorkContext);
  const [isLoading, setLoading] = useState(true);
  const [vendorData, setVendorData] = useState();
  const [activePage, setActivePage] = useState(null);
  useEffect(() => {
    GetVendorData(workDetails.id, setVendorData, setLoading);
  }, [role, refresh]);
  const onBack = () => {
    setActivePage(null);
    setRefresh((prev) => !prev);
  };
  return (
    <Paper
      style={{
        padding: "20px",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.15)",
        borderLeft: "0.6rem solid #15ABFF",
        overflow: "auto",
        margin: "0 auto",
        maxHeight: "100vh",
      }}
    >
      {isLoading ? (
        <Grid mt="xl">
          <Container py="xl">
            <Loader size="lg" />
          </Container>
        </Grid>
      ) : activePage === null ? (
        <Card radius="md" style={{ overflowY: "auto", maxHeight: "65vh" }}>
          <Box p="lg">
            <Title mb="md" align="center">
              Manage Vendors
            </Title>
            <Button
              style={{ float: "right" }}
              onClick={() => setActivePage("add-vendor")}
            >
              Add Vendor
              <Plus size={18} style={{ marginLeft: "10px" }} />
            </Button>

            <div className={classes.fusionTabsContainer}>
              <Tabs
                style={{
                  display: "flex",
                  flexWrap: "nowrap",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <Tabs.List>
                  {vendorData.map((item, index) => (
                    <Tabs.Tab
                      key={index}
                      value={`${index}`}
                      onClick={() =>
                        setActiveSubTab((prev) =>
                          prev === index ? null : index,
                        )
                      }
                      className={
                        activeSubTab === index
                          ? classes.fusionActiveRecentTab
                          : ""
                      }
                      style={{
                        cursor: "pointer",
                        marginRight: "10px",
                        padding: "10px 15px",
                      }}
                    >
                      <Text>{item.name}</Text>
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs>
            </div>

            {/* Content panels */}
            {vendorData.map((vendor, index) => (
              <Collapse key={index} in={activeSubTab === index}>
                <Divider my="sm" />
                <Table striped highlightOnHover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Contact Number</th>
                      <th>Email Address</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{vendor.name}</td>
                      <td>{vendor.contact_number}</td>
                      <td>{vendor.email_address}</td>
                      <td>
                        <Button onClick={() => {}}>Manage Bills</Button>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Collapse>
            ))}
          </Box>
        </Card>
      ) : (
        <AddVendor onBack={onBack} work_id={workDetails.id} />
      )}
    </Paper>
  );
}

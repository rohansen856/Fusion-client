import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Container, Table, Button, Title, Loader, Grid } from "@mantine/core";
import { CaretLeft } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import { GetItems, GetProposals } from "../handlers/handlers";

function ViewSelectedProposal({ requestId }) {
  const role = useSelector((state) => state.user.role);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemsList, setItemsList] = useState([]);
  const [proposalIds, setProposalIds] = useState([]);

  // Fetches all proposal IDs
  useEffect(() => {
    console.log("Request ID:", requestId);
    console.log("Role:", role);
    if (requestId) {
      GetProposals({
        setLoading,
        setProposalIds,
        requestId,
      });
    }
  }, [requestId]);

  // Fetches all items when proposalIds are available
  useEffect(() => {
    if (proposalIds.length > 0) {
      GetItems({
        setLoading,
        setItemsList,
        proposalIds,
        role,
      });
    }
  }, [proposalIds, refresh, role]);
  console.log("proposalIds:", proposalIds);

  const viewDoc = (item) => setSelectedItem(item);
  const handleBackToList = () => {
    setSelectedItem(null);
    setRefresh((prev) => !prev);
  };

  return (
    <Container>
      {loading ? (
        <Grid mt="sm">
          <Container py="sm">
            <Loader size="lg" />
          </Container>
        </Grid>
      ) : !selectedItem ? (
        <div
          style={{
            border: "1px solid #ccc",
            width: "100%",
            overflow: "auto",
            padding: "20px",
          }}
        >
          <Title size="26px" align="center" mb="md">
            Item List
          </Title>
          <Table striped highlightOnHover>
            <thead style={{ backgroundColor: "#f5f5f5" }}>
              <tr>
                <th>Item ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Unit</th>
                <th>Price Per Unit</th>
                <th>Total Amount</th>
                <th>Document (if any)</th>
              </tr>
            </thead>
            <tbody>
              {itemsList.length > 0 ? (
                itemsList.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>{item.unit}</td>
                    <td>{item.price_per_unit}</td>
                    <td>{item.total_price}</td>
                    <td>
                      <Button
                        size="xs"
                        color="blue"
                        onClick={() => viewDoc(item)}
                        style={{ borderRadius: "20px" }}
                      >
                        View Docs
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No items available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      ) : (
        <Button
          variant="subtle"
          leftIcon={<CaretLeft size={12} />}
          onClick={handleBackToList}
          style={{ marginBottom: "10px" }}
        >
          Back to List
        </Button>
      )}
    </Container>
  );
}

ViewSelectedProposal.propTypes = {
  requestId: PropTypes.number.isRequired,
};

export default ViewSelectedProposal;

import React, { useState, useEffect } from "react";
import { Table, Button, Title, Loader, Flex, Text } from "@mantine/core";
import PropTypes from "prop-types";
import { GetItems, GetProposals } from "../handlers/handlers";
import ItemList from "./ItemsTable";

function ProposalTable({ requestId, onBack }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [proposaldata, setProposalData] = useState({});

  useEffect(() => {
    if (requestId) {
      GetProposals({
        setLoading,
        setProposalList: setProposals,
        requestId,
        setProposalIds: () => {},
      });
    }
  }, [requestId]);

  const handleViewItems = (proposalId) => {
    GetItems(setLoading, proposalId).then((data) => {
      setProposalData(data);
    });
    setSelectedProposalId(proposalId);
  };

  return (
    <div>
      {loading ? (
        <Loader size="lg" />
      ) : !selectedProposalId ? (
        <>
          <Title mb="md">Proposals</Title>
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>
                  <Title size="md">Proposal ID</Title>
                </th>
                <th>
                  <Title size="md">Current Status</Title>
                </th>
                <th>
                  <Title size="md">Created By</Title>
                </th>
                <th>
                  <Title size="md">Last Updated</Title>
                </th>
                <th>
                  <Title size="md">Created At</Title>
                </th>
                <th>
                  <Title size="md">Proposal Budget</Title>
                </th>
                <th>
                  <Title size="md">Action</Title>
                </th>
              </tr>
            </thead>
            <tbody>
              {proposals.length > 0 ? (
                proposals.map((proposal) => (
                  <tr key={proposal.id}>
                    <td>
                      <Text style={{ marginTop: "10px", marginBottom: "10px" }}>
                        {proposal.id}
                      </Text>
                    </td>
                    <td>
                      <Text style={{ marginTop: "10px", marginBottom: "10px" }}>
                        {proposal.status}
                      </Text>
                    </td>
                    <td>
                      <Text style={{ marginTop: "10px", marginBottom: "10px" }}>
                        {proposal.created_by}
                      </Text>
                    </td>
                    <td>
                      <Text style={{ marginTop: "10px", marginBottom: "10px" }}>
                        {new Date(proposal.updated_at).toLocaleDateString()}
                      </Text>
                    </td>
                    <td>
                      <Text style={{ marginTop: "10px", marginBottom: "10px" }}>
                        {new Date(proposal.created_at).toLocaleDateString()}
                      </Text>
                    </td>
                    <td>
                      <Text style={{ marginTop: "10px", marginBottom: "10px" }}>
                        {proposal.proposal_budget}
                      </Text>
                    </td>
                    <td>
                      <Button
                        onClick={() => handleViewItems(proposal.id)}
                        style={{ margin: "10px" }}
                        variant="filled"
                        color="green"
                      >
                        <Text size="md" fw="bold">
                          View Items
                        </Text>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No proposals available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <Flex direction="row" gap="xs" mt="md">
            <Button
              size="sm"
              color="green"
              borderRadius="sm"
              variant="outline"
              onClick={onBack}
            >
              Back
            </Button>
          </Flex>
        </>
      ) : (
        <ItemList
          setSelectedProposalId={setSelectedProposalId}
          proposaldata={proposaldata}
        />
      )}
    </div>
  );
}

ProposalTable.propTypes = {
  onBack: PropTypes.func.isRequired,
  requestId: PropTypes.number.isRequired,
};

export default ProposalTable;

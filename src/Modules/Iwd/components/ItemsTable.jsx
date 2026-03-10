import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  Button,
  Title,
  Text,
  Group,
  Stack,
  ScrollArea,
} from "@mantine/core";
import { Paperclip, CaretLeft } from "@phosphor-icons/react";
import { host } from "../../../routes/globalRoutes";

export default function ItemsTable({ setSelectedProposalId, proposaldata }) {
  const { itemsList, proposal } = proposaldata;
  console.log("itemlist", itemsList);
  return (
    <>
      <Group position="apart" mb="xl" align="flex-end">
        <Title>Proposal Information</Title>
      </Group>
      <Stack spacing="md" mb="lg">
        <Group position="apart">
          <Title size="lg">ID:</Title>
          <Text size="lg">{proposal?.id || "N/A"}</Text>
        </Group>
        <Group position="apart">
          <Title size="lg">Created By:</Title>
          <Text size="lg">{proposal?.created_by || "N/A"}</Text>
        </Group>
        <Group position="apart">
          <Title size="lg">Budget:</Title>
          <Text>{proposal?.proposal_budget || "N/A"}</Text>
        </Group>
        {proposal.supporting_documents && (
          <Group position="apart">
            <Title size="lg">Docs:</Title>
            <Group spacing="xs">
              <Paperclip size="16" />
              <Button
                variant="light"
                component="a"
                href={`${host}/${proposal.supporting_documents}`}
                target="_blank"
                radius="md"
                sx={{
                  textOverflow: "ellipsis",
                  maxWidth: "200px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {proposal.supporting_documents.split("/")[2] || "N/A"}
              </Button>
            </Group>
          </Group>
        )}
      </Stack>
      <ScrollArea>
        <Table highlightOnHover striped>
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th>
                <Title size="md">Item ID</Title>
              </th>
              <th>
                <Title size="md">Name</Title>
              </th>
              <th>
                <Title size="md">Description</Title>
              </th>
              <th>
                <Title size="md">Unit</Title>
              </th>
              <th>
                <Title size="md">Price/Unit</Title>
              </th>
              <th>
                <Title size="md">Total</Title>
              </th>
              <th>
                <Title size="md">Quantity</Title>
              </th>
              <th>
                <Title size="md">Document</Title>
              </th>
            </tr>
          </thead>
          <tbody>
            {itemsList.length > 0 ? (
              itemsList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Text style={{ marginTop: "10px", marginBottom: "10px" }}>
                      {item.id}
                    </Text>
                  </td>
                  <td>
                    <Text style={{ marginTop: "10px", marginBottom: "10px" }}>
                      {item.name}
                    </Text>
                  </td>
                  <td>
                    <Text style={{ marginTop: "10px", marginBottom: "10px" }}>
                      {item.description}
                    </Text>
                  </td>
                  <td>
                    <Text style={{ marginTop: "10px", marginBottom: "10px" }}>
                      {item.unit}
                    </Text>
                  </td>
                  <td>
                    <Text style={{ marginTop: "10px", marginBottom: "10px" }}>
                      {item.price_per_unit}
                    </Text>
                  </td>
                  <td>
                    <Text style={{ marginTop: "10px", marginBottom: "10px" }}>
                      {item.total_price}
                    </Text>
                  </td>
                  <td>
                    <Text style={{ marginTop: "10px", marginBottom: "10px" }}>
                      {item.quantity}
                    </Text>
                  </td>
                  <td>
                    <Group spacing="xs">
                      <Paperclip size="16" />
                      <Button
                        color="green"
                        variant="filled"
                        component="a"
                        disabled={!item.docs}
                        href={item.docs && `${host}/${item.docs}`}
                        target="_blank"
                        radius="md"
                        sx={{
                          textOverflow: "ellipsis",
                          maxWidth: "200px",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        View Docs
                        {/* {item?.docs.split("/")[3] || "N/A"} */}
                      </Button>
                    </Group>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "12px" }}
                >
                  No items available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        {setSelectedProposalId && (
          <Button
            leftIcon={<CaretLeft size={16} />}
            onClick={() => setSelectedProposalId(null)}
            radius="sm"
            color="green"
            variant="outline"
          >
            Back
          </Button>
        )}
      </ScrollArea>
    </>
  );
}

ItemsTable.propTypes = {
  setSelectedProposalId: PropTypes.func,
  proposaldata: PropTypes.shape({
    itemsList: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        unit: PropTypes.string,
        price_per_unit: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
        total_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        docs: PropTypes.string,
      }),
    ),
    proposal: PropTypes.shape({
      proposal_budget: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      created_by: PropTypes.string,
      supporting_documents: PropTypes.string,
    }),
  }).isRequired,
};

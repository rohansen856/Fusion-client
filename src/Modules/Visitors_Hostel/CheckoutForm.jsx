import React, { useState } from "react";
import {
  Modal,
  Group,
  Button,
  Grid,
  Card,
  Text,
  Container,
  Table,
  TextInput,
  NumberInput,
  Divider,
} from "@mantine/core";
import axios from "axios";
import PropTypes from "prop-types";
import { host } from "../../routes/globalRoutes";

function CheckoutForm({ modalOpened, onClose, bookingId, bookingDetails }) {
  const [items, setItems] = useState([
    { id: 1, name: "", quantity: 1, cost: 0 },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Move updateTotal function here
  const updateTotal = (updatedItems) => {
    const total = updatedItems.reduce(
      (sum, item) => sum + item.quantity * item.cost,
      0,
    );
    setTotalAmount(total);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      { id: items.length + 1, name: "", quantity: 1, cost: 0 },
    ]);
  };

  const handleRemoveRow = (id) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    updateTotal(updatedItems); // Call updateTotal after removing a row
  };

  const handleInputChange = (id, field, value) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    setItems(updatedItems);
    updateTotal(updatedItems); // Call updateTotal after updating an item
  };

  const handleCompleteCheckout = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return console.error("No authentication token found!");
    }

    try {
      const now = new Date();
      const formattedTime = now.toTimeString().split(" ")[0]; // Extract time in HH:MM:SS format

      const data = {
        booking_id: bookingId,
        inventory_items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          cost: item.cost,
        })),
        meal_bill: 0, // Add meal bill if applicable
        room_bill: totalAmount, // Total amount as room bill
        check_out_time: formattedTime, // Send time in HH:MM:SS format
      };

      console.log("Data being sent to backend:", data); // Log the data

      // Send request to the backend
      const response = await axios.post(
        `${host}/visitorhostel/check-out-with-inventory/`,
        data,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Successfully completed checkout for booking ID:", bookingId);
      console.log("Response from backend:", response.data);

      alert("Checkout completed successfully!");
      onClose(); // Close the modal after checkout
    } catch (error) {
      console.error("Error completing checkout:", error);
      alert("Failed to complete checkout. Please try again.");
    }
  };
  return (
    <Modal
      opened={modalOpened}
      onClose={onClose}
      title="Checkout Details"
      size="xl"
      overlayOpacity={0.55}
      overlayBlur={3}
    >
      <Container>
        <Grid>
          {/* Booking Information */}
          <Grid.Col span={12}>
            <Card shadow="sm" p="md">
              <Text weight={700}>Booking ID: {bookingId}</Text>
              <Text>Room: {bookingDetails?.rooms?.join(", ")}</Text>
            </Card>
          </Grid.Col>

          {/* Items Table */}
          <Grid.Col span={12}>
            <Table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <TextInput
                        placeholder="Item Name"
                        value={item.name}
                        onChange={(e) =>
                          handleInputChange(item.id, "name", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <NumberInput
                        min={1}
                        value={item.quantity}
                        onChange={(value) =>
                          handleInputChange(item.id, "quantity", value)
                        }
                      />
                    </td>
                    <td>
                      <NumberInput
                        min={0}
                        value={item.cost}
                        onChange={(value) =>
                          handleInputChange(item.id, "cost", value)
                        }
                      />
                    </td>
                    <td>
                      <Button
                        color="red"
                        variant="subtle"
                        onClick={() => handleRemoveRow(item.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button onClick={handleAddRow} mt="md">
              Add Item
            </Button>
          </Grid.Col>

          {/* Total Amount */}
          <Grid.Col span={12}>
            <Divider my="sm" />
            <Group position="apart">
              <Text weight={700}>Total Amount</Text>
              <Text weight={700}>₹{totalAmount}</Text>
            </Group>
          </Grid.Col>

          {/* Confirm Checkout */}
          <Grid.Col span={12}>
            <Button
              fullWidth
              mt="md"
              onClick={handleCompleteCheckout}
              disabled={items.length === 0 || totalAmount === 0}
            >
              Confirm Checkout
            </Button>
          </Grid.Col>
        </Grid>
      </Container>
    </Modal>
  );
}

CheckoutForm.propTypes = {
  modalOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookingId: PropTypes.string.isRequired,
  bookingDetails: PropTypes.shape({
    rooms: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default CheckoutForm;

import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  MantineProvider,
  TextInput,
  NumberInput,
  Textarea,
  Group,
  Grid,
  Modal,
  LoadingOverlay,
  MultiSelect,
  Button,
  Text,
} from "@mantine/core";
import axios from "axios";
import html2canvas from "html2canvas";
import JsPDF from "jspdf";
import { host } from "../../routes/globalRoutes";
import {
  cancelBookingRoute,
  checkInBookingRoute,
  // checkOutBookingRoute,
} from "../../routes/visitorsHostelRoutes"; // Add this import
import UpdateBookingForm from "./updateBooking";
import CheckoutForm from "./CheckoutForm";
import ConfirmBookingIn from "./confirmBooking_Incharge";
// import ForwardBookingForm from "./forwardBooking";

function ViewBooking({ modalOpened, onClose, bookingId, bookingf, onCancel }) {
  const [formData, setFormData] = useState({
    intenderUsername: "",
    intenderEmail: "",
    bookingFrom: "",
    bookingTo: "",
    visitorCategory: "",
    modifiedVisitorCategory: "",
    personCount: 1,
    numberOfRooms: 1,
    rooms: [],
    purpose: "",
    billToBeSettledBy: "",
    remarks: "",
    visitorName: "",
    visitorEmail: "",
    visitorPhone: "",
    visitorOrganization: "",
    visitorAddress: "",
  });
  const [confirmModalOpened, setConfirmModalOpened] = useState(false); // New state for ConfirmBookingIn modal
  const [availableRooms, setAvailableRooms] = useState([]);
  // const [forwardModalOpened, setForwardModalOpened] = useState(null);
  const printRef = useRef();
  const role = useSelector((state) => state.user.role);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const response = await axios.get(
          `${host}/visitorhostel/get-booking-details/${bookingId}/`,
        );
        const booking = response.data;
        console.log("Active Booking Data: ", booking);

        setFormData({
          intenderUsername: booking.intenderUsername,
          intenderEmail: booking.intenderEmail,
          bookingFrom: booking.bookingFrom,
          bookingTo: booking.bookingTo,
          visitorCategory: booking.visitorCategory,
          modifiedVisitorCategory: booking.modifiedVisitorCategory,
          personCount: booking.personCount,
          numberOfRooms: booking.numberOfRooms,
          // Use the rooms data from bookingf prop instead
          rooms: bookingf.rooms || [],
          purpose: booking.purpose,
          billToBeSettledBy: booking.billToBeSettledBy,
          remarks: booking.remarks,
          visitorName: booking.visitorName,
          visitorEmail: booking.visitorEmail,
          visitorPhone: booking.visitorPhone,
          visitorOrganization: booking.visitorOrganization,
          visitorAddress: booking.visitorAddress,
        });

        setAvailableRooms(
          booking.availableRooms.map((room) => room.room_number),
        );
      } catch (error) {
        console.error("Error fetching booking data", error);
      }
    };

    if (bookingId) {
      fetchBookingData();
    }
  }, [bookingId, bookingf]); // Add bookingf as a dependency
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleSaveToPDF = async () => {
    const input = printRef.current;
    const canvas = await html2canvas(input, { scale: 3 }); // Increased scaling
    const imgData = canvas.toDataURL("image/png");
    const pdf = new JsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, pdfHeight - 95);
    pdf.save("booking_details.pdf");
  };

  const handleCheckIn = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return console.error("No authentication token found!");
    }
    try {
      const data = {
        booking_id: bookingId,
        name: formData.visitorName,
        phone: formData.visitorPhone,
        email: formData.visitorEmail,
        address: formData.visitorAddress,
        check_in_date: new Date().toISOString().split("T")[0], // Current date
        check_in_time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }), // Current time in "12:12 AM" format
      };
      await axios.post(checkInBookingRoute, data, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Successfully checked in booking with ID:", bookingId);
      // Optionally, you can add logic to refresh the booking data or close the modal
      onClose(); // Close the modal after check-in
      window.location.reload();
    } catch (error) {
      console.error("Error checking in the booking:", error);
    }
  };

  // const handleCheckOut = async () => {
  //   const token = localStorage.getItem("authToken");
  //   if (!token) {
  //     return console.error("No authentication token found!");
  //   }
  //   try {
  //     const data = {
  //       booking_id: bookingId,
  //       name: formData.visitorName,
  //       phone: formData.visitorPhone,
  //       email: formData.visitorEmail,
  //       address: formData.visitorAddress,
  //       check_out_date: new Date().toISOString().split("T")[0], // Current date
  //       check_out_time: new Date().toLocaleTimeString([], {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //         hour12: true,
  //       }), // Current time in "12:12 AM" format
  //     };
  //     await axios.post(checkOutBookingRoute, data, {
  //       headers: {
  //         Authorization: `Token ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     console.log("Successfully checked out booking with ID:", bookingId);
  //     // Optionally, you can add logic to refresh the booking data or close the modal
  //     onClose(); // Close the modal after check-out
  //   } catch (error) {
  //     console.error("Error checking out the booking:", error);
  //   }
  // };

  const handleCancel = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return console.error("No authentication token found!");
    }
    try {
      const data = {
        "booking-id": bookingId,
        remark: "User canceled the booking.",
        charges: 0,
      };
      await axios.post(cancelBookingRoute, data, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      console.log("Successfully canceled booking with ID:", bookingId);
      // Optionally, you can add logic to refresh the booking data or close the modal
      onClose(); // Close the modal after cancellation
      if (onCancel) {
        onCancel(bookingId); // Call the onCancel callback to refresh the bookings list
      }
    } catch (error) {
      console.error("Error canceling the booking:", error);
    }
    window.location.reload();
  };

  const isCheckInEnabled = () => {
    const currentDateTime = new Date();
    const bookingDateTime = new Date(`${formData.bookingFrom}T00:00:00`);
    return (
      currentDateTime >= bookingDateTime && bookingf.status !== "CheckedIn"
    );
  };

  const isCheckOutEnabled = () => {
    return bookingf.status === "CheckedIn";
  };

  const [updateModalOpened, setUpdateModalOpened] = useState(false);

  const handleUpdateButtonClick = () => {
    setUpdateModalOpened(true); // Open the UpdateBookingForm modal
  };

  const handleUpdateCloseModal = () => {
    setUpdateModalOpened(false); // Close the UpdateBookingForm modal
  };

  const [checkoutModalOpened, setCheckoutModalOpened] = useState(false);

  const handleCheckoutButtonClick = () => {
    setCheckoutModalOpened(true); // Open the CheckoutForm modal
  };

  const handleCheckoutCloseModal = () => {
    setCheckoutModalOpened(false); // Close the CheckoutForm modal
  };

  return (
    <MantineProvider theme={{ fontFamily: "Arial, sans-serif" }}>
      <Modal
        opened={modalOpened}
        onClose={onClose}
        title="IIITDMJ Visitors Hostel"
        size="xl"
        overlayOpacity={0.55}
        overlayBlur={3}
        transition="fade"
        transitionDuration={500}
      >
        <LoadingOverlay overlayBlur={2} />
        <div
          ref={printRef}
          className="print-content"
          style={{ border: "2px solid #000", padding: "20px", margin: "20px" }}
        >
          <div>
            <Text align="center" weight={900} size="xl" mb="xs">
              <b>Visitors Hostel</b>
            </Text>
            <Text align="center" weight={700} size="md" mb="md">
              <b>PDPM IIITDM Jabalpur</b>
            </Text>
            <Text align="center" weight={800} size="lg" mb="md">
              <b>Booking for {formData.visitorName}</b>
            </Text>
          </div>
          <form>
            <Grid>
              <Grid.Col span={12}>
                <div
                  style={{
                    backgroundColor:
                      bookingf.status === "Pending"
                        ? "#E0E0E0"
                        : bookingf.status === "Confirmed"
                          ? "#dffbe0"
                          : bookingf.status === "Forward"
                            ? "#fff3cd"
                            : bookingf.status === "CheckedIn"
                              ? "#cce5ff"
                              : bookingf.status === "Complete"
                                ? "#d4edda"
                                : "#f8d7da",
                    color:
                      bookingf.status === "Pending"
                        ? "#757575"
                        : bookingf.status === "Confirmed"
                          ? "#84b28c"
                          : bookingf.status === "Forward"
                            ? "#856404"
                            : bookingf.status === "CheckedIn"
                              ? "#004085"
                              : bookingf.status === "Complete"
                                ? "#155724"
                                : "#721c24",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    display: "inline-block",
                  }}
                >
                  {bookingf.status}
                </div>
              </Grid.Col>
              <Grid.Col span={12}>
                <TextInput
                  label="Username"
                  value={formData.intenderUsername}
                  readOnly
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="Email"
                  value={formData.intenderEmail}
                  readOnly
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="From"
                  type="date"
                  value={formData.bookingFrom}
                  readOnly
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="To"
                  type="date"
                  value={formData.bookingTo}
                  readOnly
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="Category"
                  value={formData.visitorCategory}
                  readOnly
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label="Modified Category"
                  value={formData.modifiedVisitorCategory}
                  readOnly
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <NumberInput
                  label="Number Of People"
                  value={formData.personCount}
                  readOnly
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <NumberInput
                  label="Rooms Required"
                  value={formData.numberOfRooms}
                  readOnly
                />
              </Grid.Col>
              {/* <Grid.Col span={12}>
                <MultiSelect
                  label="Rooms"
                  value={formData.rooms}
                  data={availableRooms.map((room) => ({
                    value: room,
                    label: room,
                  }))}
                  readOnly
                />
              </Grid.Col> */}

              <Grid.Col span={12}>
                <MultiSelect
                  label="Rooms"
                  value={formData.rooms}
                  data={availableRooms.map((room) => ({
                    value: room,
                    label: room,
                  }))}
                  readOnly
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="Purpose Of Visit"
                  value={formData.purpose}
                  readOnly
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="Bill to be settled by"
                  value={formData.billToBeSettledBy}
                  readOnly
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Textarea label="Remarks" value={formData.remarks} readOnly />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="Visitor Email"
                  value={formData.visitorEmail}
                  readOnly
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="Visitor Phone"
                  value={formData.visitorPhone}
                  readOnly
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="Visitor Organization"
                  value={formData.visitorOrganization}
                  readOnly
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <TextInput
                  label="Visitor Address"
                  value={formData.visitorAddress}
                  readOnly
                />
              </Grid.Col>
            </Grid>
          </form>
        </div>
        <Group position="apart" mt="md">
          <Button onClick={handlePrint} variant="outline" color="blue">
            Print
          </Button>
          <Button onClick={handleSaveToPDF} variant="outline" color="green">
            Save to PDF
          </Button>
          {(role === "VhCaretaker" || role === "VhIncharge") && (
            <>
              <Button
                onClick={handleCheckIn}
                variant="outline"
                color="teal"
                disabled={!isCheckInEnabled()}
                style={{
                  backgroundColor: isCheckInEnabled() ? "#20c997" : "#d3d3d3",
                  color: isCheckInEnabled() ? "#fff" : "#757575",
                }}
              >
                CheckIn
              </Button>
              <Button
                onClick={handleCheckoutButtonClick} // Open the modal
                variant="outline"
                color="orange"
                disabled={!isCheckOutEnabled()}
                style={{
                  backgroundColor: isCheckOutEnabled() ? "#fd7e14" : "#d3d3d3",
                  color: isCheckOutEnabled() ? "#fff" : "#757575",
                }}
              >
                CheckOut
              </Button>
              {checkoutModalOpened && (
                <CheckoutForm
                  modalOpened={checkoutModalOpened}
                  onClose={handleCheckoutCloseModal}
                  bookingId={bookingId}
                  bookingDetails={formData} // Pass the booking details
                />
              )}
            </>
          )}
          {/* <Button onClick={() => handleForwardButtonClick(formData.id)}>
            Update Details
          </Button>
          {forwardModalOpened === formData.id && (
            <ForwardBookingForm
              forwardmodalOpened={forwardModalOpened === formData.id}
              onClose={handleForwardCloseModal}
              onBookingForward={} // Pass the function down
              bookingId={formData.id}
            />
          )} */}
          {role === "VhIncharge" && (
            <>
              <Button
                onClick={() => setConfirmModalOpened(true)} // Open ConfirmBookingIn modal
                disabled={bookingf.status !== "Forward"}
                style={{
                  backgroundColor:
                    bookingf.status === "Forward" ? "#28a745" : "#d3d3d3",
                  color: bookingf.status === "Forward" ? "#fff" : "#757575",
                  cursor:
                    bookingf.status === "Forward" ? "pointer" : "not-allowed",
                }}
              >
                Confirm
              </Button>
              {confirmModalOpened && (
                <ConfirmBookingIn
                  forwardmodalOpened={confirmModalOpened}
                  onClose={() => setConfirmModalOpened(false)} // Close ConfirmBookingIn modal
                  bookingId={bookingId}
                />
              )}
            </>
          )}
          {(role === "VhCaretaker" || role === "VhIncharge") && (
            <>
              <Button onClick={handleUpdateButtonClick}>Update Booking</Button>
              {updateModalOpened && (
                <UpdateBookingForm
                  forwardmodalOpened={updateModalOpened}
                  onClose={handleUpdateCloseModal}
                  bookingId={bookingId}
                />
              )}
            </>
          )}
          <Button onClick={handleCancel} variant="outline" color="red">
            Cancel
          </Button>
        </Group>
      </Modal>
      <style>{`
        @media print {
          .print-only {
            display: block;
          }
          .no-print {
            display: none;
          }
          .print-content {
            border: 2px solid #000;
            padding: 20px;
            margin: 20px;
            page-break-inside: avoid;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
    </MantineProvider>
  );
}

ViewBooking.propTypes = {
  modalOpened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookingId: PropTypes.string.isRequired,
  bookingf: PropTypes.shape({
    intender: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    bookingFrom: PropTypes.string.isRequired,
    bookingTo: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    // modifiedCategory: PropTypes.string,
    modifiedVisitorCategory: PropTypes.string,
    rooms: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.string.isRequired,
  }).isRequired,
  onCancel: PropTypes.func, // Add this prop type
};

export default ViewBooking;

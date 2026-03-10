import React, { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import {
  PaperPlaneRight,
  CheckCircle,
  User,
  Tag,
  IdentificationCard,
  Calendar,
  ClipboardText,
  CurrencyDollar,
  FileText,
} from "@phosphor-icons/react";
import { useDispatch, useSelector } from "react-redux";
import { updateForm, resetForm } from "../../../../redux/formSlice";
import {
  search_employee,
  get_my_details,
  submit_cpda_adv_form,
} from "../../../../routes/hr";
import "./CPDA_ADVANCEForm.css";

const CPDA_ADVANCEForm = () => {
  const formData = useSelector((state) => state.form);
  const dispatch = useDispatch();
  const [verifiedReceiver, setVerifiedReceiver] = useState(false);

  // set formData to initial state
  useEffect(() => {
    const fetchMyDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No authentication token found!");
          return;
        }

        const response = await fetch(get_my_details, {
          headers: { Authorization: `Token ${token}` },
        });

        if (!response.ok) {
          alert("Failed to fetch user details. Please try again later.");
          throw new Error("Network response was not ok");
        }

        const fetchedData = await response.json();
        dispatch(updateForm({ name: "name", value: fetchedData.username }));
        dispatch(
          updateForm({ name: "designation", value: fetchedData.designation }),
        );
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };
    fetchMyDetails();
  }, []);
  const handleCheck = async (username_reciever) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found!");
        return;
      }

      const response = await fetch(
        `${search_employee}?search=${formData.username_reciever}`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );

      if (!response.ok) {
        alert("Receiver not found. Please check the username and try again.");
        throw new Error("Network response was not ok");
      }

      const fetchedReceiverData = await response.json();

      dispatch(
        updateForm({
          name: "username_reciever",
          value: formData.username_reciever,
        }),
      );
      dispatch(
        updateForm({
          name: "designation_reciever",
          value: fetchedReceiverData.designation,
        }),
      );
      setVerifiedReceiver(true);
      alert("Receiver verified successfully!");
    } catch (error) {
      console.error("Failed to fetch receiver data:", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    dispatch(updateForm({ name, value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Ensure receiver is verified
    if (!verifiedReceiver) {
      alert("Please verify the receiver's designation before submitting.");
      return;
    }

    // Check required fields and alert if any are blank
    const requiredFields = [
      { name: "name", label: "Name" },
      { name: "designation", label: "Designation" },
      { name: "pfNo", label: "PF Number" },
      { name: "purpose", label: "Purpose" },
      { name: "amountRequired", label: "Amount Required" },
      { name: "submissionDate", label: "Submission Date" },
    ];

    for (let field of requiredFields) {
      if (!formData[field.name] || formData[field.name] === "") {
        alert(`${field.label} is required.`);
        return;
      }
    }

    // Convert string fields to numbers if necessary and create processed data
    const processedData = {
      name: formData.name,
      designation: formData.designation,
      pfNo: parseInt(formData.pfNo, 10),
      purpose: formData.purpose,
      amountRequired: parseInt(formData.amountRequired, 10),
      submissionDate: formData.submissionDate,
      advanceDueAdjustment: formData.advanceDueAdjustment
        ? parseFloat(formData.advanceDueAdjustment)
        : null,
      balanceAvailable: formData.balanceAvailable
        ? parseFloat(formData.balanceAvailable)
        : null,
      advanceAmountPDA: formData.advanceAmountPDA
        ? parseFloat(formData.advanceAmountPDA)
        : null,
      amountCheckedInPDA: formData.amountCheckedInPDA
        ? parseFloat(formData.amountCheckedInPDA)
        : null,
    };

    console.log(processedData);

    // Submit form data
    const submitForm = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No authentication token found!");
          return;
        }

        const response = await fetch(
          `${submit_cpda_adv_form}/?username_reciever=${formData.username_reciever}`,
          {
            // Note the trailing slash
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify(processedData),
          },
        );

        if (!response.ok) {
          alert("Failed to submit form. Please try again later.");
          throw new Error("Network response was not ok");
        }

        alert("CPDA Advance form submitted successfully!");
        dispatch(resetForm());
      } catch (error) {
        console.error("Failed to submit CPDA Advance form:", error);
      }
    };
    submitForm();
    dispatch(resetForm());
  };

  return (
    <div className="CPDA_ADVANCEForm_container">
      <form onSubmit={handleSubmit}>
        {/* Row 1: Name and Designation */}
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="name">
              Name
            </label>
            <div className="input-wrapper">
              <User size={20} />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name} // Auto-fetched from backend
                className="input"
                disabled
              />
            </div>
          </div>

          <div className="grid-col">
            <label className="input-label" htmlFor="designation">
              Designation
            </label>
            <div className="input-wrapper">
              <Tag size={20} />
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                className="input"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Row 2: Amount Required and Date */}
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="amountRequired">
              Amount Required
            </label>
            <div className="input-wrapper">
              <CurrencyDollar size={20} />
              <input
                type="number"
                id="amountRequired"
                name="amountRequired"
                placeholder="Amount Required"
                value={formData.amountRequired}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid-col">
            <label className="input-label" htmlFor="submissionDate">
              Date
            </label>
            <div className="input-wrapper">
              <Calendar size={20} />
              <input
                type="date"
                id="submissionDate"
                name="submissionDate"
                value={formData.submissionDate}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>
        </div>

        {/* Row 3: Purpose and PF Number */}
        <div className="grid-row">
          <div className="grid-col" style={{ flexGrow: 2 }}>
            <label className="input-label" htmlFor="purpose">
              Purpose
            </label>
            <div className="input-wrapper">
              <ClipboardText size={20} />
              <input
                type="text"
                id="purpose"
                name="purpose"
                placeholder="Purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid-col">
            <label className="input-label" htmlFor="pfNo">
              PF Number
            </label>
            <div className="input-wrapper">
              <IdentificationCard size={20} />
              <input
                type="text"
                id="pfNo"
                name="pfNo"
                placeholder="XXXXXXXXXXXX"
                value={formData.pfNo}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="advanceDueAdjustment">
              Advance (PDA) due for adjustment (if any)
            </label>
            <div className="input-wrapper">
              <CurrencyDollar size={20} />
              <input
                type="text"
                id="advanceDueAdjustment"
                name="advanceDueAdjustment"
                placeholder="Advance Due"
                value={formData.advanceDueAdjustment}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Row 4: Estt. Section */}
        <div className="section-divider">
          <hr className="divider-line" />
          <h3 className="section-heading">Estt. Section</h3>
        </div>
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="balanceAvailable">
              Balance available as on date
            </label>
            <div className="input-wrapper">
              <CurrencyDollar size={20} />
              <input
                type="number"
                id="balanceAvailable"
                name="balanceAvailable"
                value={formData.balanceAvailable}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="advanceAmountPDA">
              Advance amount entered in PDA Register page no.
            </label>
            <div className="input-wrapper">
              <FileText size={20} />
              <input
                type="number"
                id="advanceAmountPDA"
                name="advanceAmountPDA"
                placeholder="Enter amount"
                value={formData.advanceAmountPDA}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Row 5: Internal Audit */}
        <div className="section-divider">
          <hr className="divider-line" />
          <h3 className="section-heading">Internal Audit</h3>
        </div>
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="amountCheckedInPDA">
              Entry checked in PDA Register for Rs.
            </label>
            <div className="input-wrapper">
              <FileText size={20} />
              <input
                type="number"
                id="amountCheckedInPDA"
                name="amountCheckedInPDA"
                placeholder="PDA Register Entry"
                value={formData.amountCheckedInPDA}
                onChange={handleChange}
                className="input"
                style={{ maxWidth: "50%" }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer-section">
          <div className="input-wrapper">
            <User size={20} />
            <input
              type="text"
              name="username_reciever"
              placeholder="Receiver's Username"
              value={formData.username_reciever}
              onChange={handleChange}
              className="username-input"
              required
            />
          </div>
          <div className="input-wrapper">
            <Tag size={20} />
            <input
              type="text"
              name="designation_reciever"
              placeholder="Designation"
              value={formData.designation_reciever}
              className="designation-input"
              required
              disabled
            />
          </div>
          <Button
            leftIcon={<CheckCircle size={25} />}
            style={{ marginLeft: "50px", paddingRight: "15px" }}
            className="button"
            onClick={handleCheck}
          >
            <CheckCircle size={18} /> &nbsp; Check
          </Button>
          <Button
            type="submit"
            rightIcon={<PaperPlaneRight size={20} />}
            style={{
              marginLeft: "350px",
              width: "150px",
              paddingRight: "15px",
              borderRadius: "5px",
            }}
            className="button"
            disabled={!verifiedReceiver}
          >
            <PaperPlaneRight size={20} /> &nbsp; Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CPDA_ADVANCEForm;

import { useState } from "react";
import { Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import LeaveForm from "../pages/Otheracademic/Leave/LeaveForm";
import LeaveStatus from "./LeaveStatus";
// import ApproveLeave from "./ApproveLeave";
function LeaveCombined() {
  const [tab, setTab] = useState(0);
  const isAboveXs = useMediaQuery("(min-width: 530px)");
  const isAboveXXs = useMediaQuery("(min-width: 420px)");
  return (
    <>
      <div
        style={{
          margin: isAboveXs ? "20px 0 0 40px" : "0px",
          width: isAboveXXs ? "300px" : "",
          display: isAboveXXs ? "flex" : "block",
          paddingRight: isAboveXXs ? "" : "120px",
          justifyContent: "space-evenly",
        }}
      >
        <Button
          variant={tab === 0 ? "filled" : "outline"}
          onClick={() => setTab(0)}
          style={{ marginBottom: isAboveXXs ? "" : "10px" }}
        >
          Leave Form
        </Button>
        <Button
          variant={tab === 1 ? "filled" : "outline"}
          onClick={() => setTab(1)}
        >
          Leave Status
        </Button>
        {/* <Button
          variant={tab === 2 ? "filled" : "outline"}
          onClick={() => setTab(2)}
        >
          Approve
        </Button> */}
      </div>

      {tab === 0 ? (
        <div
          style={{
            margin: isAboveXs ? "45px 60px 0 60px" : "45px 0px 0px 0px",
            backgroundColor: "#ffffff",
            borderRadius: "20px",
          }}
        >
          <LeaveForm setTab={setTab} />
        </div>
      ) : (
        <LeaveStatus />
      )}
    </>
  );
}

export default LeaveCombined;

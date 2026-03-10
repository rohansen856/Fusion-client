import { useState } from "react";
import { Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import LeaveFormPG from "./LeaveFormPG";
import LeavePGstatus from "./LeavePGstatus";

function LeavePGCombined() {
  const [tab, setTab] = useState(0);
  const isAboveXs = useMediaQuery("(min-width: 530px)");
  const isAboveXXs = useMediaQuery("(min-width: 420px)");
  const isAboveMd = useMediaQuery("(min-width: 992px)");
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
            margin: isAboveMd ? "45px 60px 0 60px" : "30xp 0px 0px 0px",
            backgroundColor: isAboveMd ? "#f0f2f5" : "",
            borderRadius: isAboveMd ? "20px" : "",
          }}
        >
          <LeaveFormPG setTab={setTab} />
        </div>
      ) : (
        <LeavePGstatus />
      )}
    </>
  );
}

export default LeavePGCombined;

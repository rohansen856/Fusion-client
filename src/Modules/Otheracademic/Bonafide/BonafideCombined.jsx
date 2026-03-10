import { useState } from "react";
import { Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import BonafideForm from "./Bonafideform";
import BonafideFormStatus from "./BonafideFormStatus";

function BonafideCombined() {
  const [tab, setTab] = useState(0);
  const isAboveXs = useMediaQuery("(min-width: 530px)");
  const isAboveXXs = useMediaQuery("(min-width: 420px)");

  return (
    <>
      <div
        style={{
          margin: isAboveXs ? "20px 0 0 40px" : "0px",
          width: isAboveXXs ? "350px" : "",
          display: isAboveXXs ? "flex" : "block",
          paddingRight: isAboveXXs ? "" : "50px",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant={tab === 0 ? "filled" : "outline"}
          onClick={() => setTab(0)}
          style={{
            marginRight: "10px",
            flexGrow: 1,
            marginBottom: isAboveXXs ? "" : "10px",
          }}
        >
          Bonafide Form
        </Button>
        <Button
          variant={tab === 1 ? "filled" : "outline"}
          onClick={() => setTab(1)}
          style={{ flexGrow: 1 }}
        >
          Bonafide Form Status
        </Button>
      </div>
      {tab === 0 ? <BonafideForm setTab={setTab} /> : <BonafideFormStatus />}
    </>
  );
}

export default BonafideCombined;

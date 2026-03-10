import { Breadcrumbs } from "@mantine/core";
import { CaretRight } from "@phosphor-icons/react";
// import { useSelector } from "react-redux";
// import classes from "../Modules/Dashboard/Dashboard.module.css";
import classes from "../../Dashboard/Dashboard.module.css";

// eslint-disable-next-line react/prop-types
export default function CustomBread({ breadCrumbs }) {
  const items = breadCrumbs;
  console.log(items);

  return (
    <Breadcrumbs
      separator={
        <CaretRight className={classes.fusionCaretIcon} weight="bold" />
      }
      mt="xs"
      ml={{ md: "lg" }}
    >
      {items}
    </Breadcrumbs>
  );
}

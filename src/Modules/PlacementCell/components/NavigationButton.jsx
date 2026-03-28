/* eslint-disable react/prop-types */
import { Button } from "@mantine/core";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import classes from "../PlacementCell.module.css";

export default function NavigationButton({ direction, onClick }) {
  return (
    <Button
      onClick={onClick}
      variant="default"
      p={0}
      style={{ border: "none" }}
    >
      {direction === "prev" ? (
        <CaretCircleLeft
          className={classes.fusionCaretCircleIcon}
          weight="light"
        />
      ) : (
        <CaretCircleRight
          className={classes.fusionCaretCircleIcon}
          weight="light"
        />
      )}
    </Button>
  );
}
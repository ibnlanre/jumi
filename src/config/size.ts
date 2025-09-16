import { ratio } from "./theme/ratio";
import { spacing } from "./spacing";

export const size = {
  px: "1px",
  full: "100%",
  auto: "auto",
  min: "min-content",
  max: "max-content",
  fit: "fit-content",
  svh: "100svh",
  lvh: "100lvh",
  dvh: "100dvh",
  svw: "100svw",
  lvw: "100lvw",
  dvw: "100dvw",
  lh: "1lh",
  ...spacing,
  ...ratio,
};

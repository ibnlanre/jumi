import { ratio } from "./ratio";
import { size } from "./size";

export const width = {
  screen: "100vw",
  ...ratio,
  ...size,
};
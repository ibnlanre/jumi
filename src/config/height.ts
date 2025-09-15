import { ratio } from "./ratio";
import { size } from "./size";

export const height = {
  screen: "100vh",
  ...ratio,
  ...size,
};

import { Details } from "./details";

export type Data = {
  id: string;
  event: string;
  time: number;
  details: Details;
  properties: Record<string, any>;
  version: string;
  screenshot?: {
    data: string;
    format: string;
  };
};

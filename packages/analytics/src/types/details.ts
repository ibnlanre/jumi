import { Person } from "./config";

export type Details = {
  person?: Person;
  location?: {
    latitude: number;
    longitude: number;
  };
  device?: {
    id?: string;
    type?: string;
    platform?: string;
    os?: string;
    browser: {
      name?: string;
      version?: string;
    };
  };
  viewport?: {
    height: number;
    width: number;
  };
  page?: {
    title: string;
    domain: string;
    path: string;
    protocol: string;
    href: string;
    search: string;
  };
  referral?: {
    name: string;
    domain: string;
  };
  marketing?: {
    [keyword in string]: string;
  };
};

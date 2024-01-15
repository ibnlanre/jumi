export type UserAgentData = {
  brands: Array<{
    brand: string;
    version: string;
  }>;
  mobile: boolean;
  platform: string;
};

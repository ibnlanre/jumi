export type DateFormat = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
  millisecond: string;
  timezone: string;
  timestamp: number;
};

export type BaseDateFormat = {
  year: "1970";
  month: "01";
  day: "01";
  hour: "00";
  minute: "00";
  second: "00";
  millisecond: "000";
  timezone: "+00:00";
  timestamp: 0;
};

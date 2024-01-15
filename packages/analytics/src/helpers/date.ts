const isDate = (obj) => obj instanceof Date;

const timestamp = Date.now;

const formatDate = (date: Date) => {
  const pad = (n) => (n < 10 ? `0${n}` : n);
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const encodeDates = (obj) => {
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Date) {
      obj[key] = formatDate(value);
    } else if (typeof value === "object" && value !== null) {
      obj[key] = encodeDates(value);
    }
  }
  return obj;
};

export const date = {
  timestamp,
  formatDate,
  encodeDates,
  isDate,
};
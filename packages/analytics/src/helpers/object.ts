const isObject = (item: any): item is object => {
  if (Array.isArray(item)) return false;
  return item && typeof item === "object";
};

type Value<T> = string | number | T;
type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
const stripEmptyProperties = <T extends PartialRecord<keyof T, any>>(obj: T) => {
  const ret: T = {} as T;

  for (const [key, value] of Object.entries<Value<T>>(obj)) {
    if (typeof value !== "undefined") {
      ret[key] = isObject(value)
        ? stripEmptyProperties<typeof value>(value)
        : value;
    }
  }

  return ret;
};

function utf8Encode(string) {
  const encodedCharacters: string[] = [];

  for (let i = 0; i < string.length; i++) {
    const charCode = string.charCodeAt(i);

    if (charCode < 128) {
      encodedCharacters.push(String.fromCharCode(charCode));
    } else if (charCode < 2048) {
      encodedCharacters.push(
        String.fromCharCode((charCode >> 6) | 192, (charCode & 63) | 128)
      );
    } else {
      encodedCharacters.push(
        String.fromCharCode(
          (charCode >> 12) | 224,
          ((charCode >> 6) & 63) | 128,
          (charCode & 63) | 128
        )
      );
    }
  }

  return encodedCharacters.join("");
}

function base64Encode(input) {
  const utf8Bytes = new TextEncoder().encode(input);
  const base64String = btoa(String.fromCharCode(...utf8Bytes));
  return base64String;
}

const generateUUID = () => {
  const generateTimeComponent = () => {
    const time = new Date().getTime();
    let ticks = 0;
    if (performance && performance.now) {
      ticks = performance.now();
    } else {
      while (time === new Date().getTime()) {
        ticks++;
      }
    }
    return time.toString(16) + Math.floor(ticks).toString(16);
  };

  const generateRandomComponent = () => {
    return Math.random().toString(16).replace(".", "");
  };

  const generateUAComponent = () => {
    const ua = window.navigator.userAgent;
    let buffer: number[] = [];
    let ret = 0;

    function xor(result, byte_array) {
      let tmp = 0;
      for (let j = 0; j < byte_array.length; j++) {
        tmp |= buffer[j] << (j * 8);
      }
      return result ^ tmp;
    }

    for (let i = 0; i < ua.length; i++) {
      const ch = ua.charCodeAt(i);
      buffer.unshift(ch & 255);
      if (buffer.length >= 4) {
        ret = xor(ret, buffer);
        buffer = [];
      }
    }

    if (buffer.length > 0) {
      ret = xor(ret, buffer);
    }

    return ret.toString(16);
  };

  const screenArea = (screen.height * screen.width).toString(16);

  return [
    generateTimeComponent(),
    generateRandomComponent(),
    generateUAComponent(),
    screenArea,
    generateTimeComponent(),
  ].join("-");
};

const truncate = (obj, length) => {
  if (typeof obj === "string") return obj.slice(0, length);
  else if (Array.isArray(obj)) {
    return obj.map((val) => truncate(val, length));
  } else if (typeof obj === "object" && obj !== null) {
    return Object.entries(obj).reduce((acc, [key, val]) => {
      acc[key] = truncate(val, length);
      return acc;
    }, {});
  }

  return obj;
};

const extendObject = (
  target: Record<string, any>,
  ...sources: Record<string, any>[]
): Record<string, any> => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        extendObject(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return extendObject(target, ...sources);
};

const generateGUID = (maxLength = 8) => {
  const randomPart = () => Math.random().toString(36).substring(2, 10);
  const guid = randomPart() + randomPart();
  return maxLength ? guid.substring(0, maxLength) : guid;
};

export const object = {
  isObject,
  extendObject,
  base64Encode,
  stripEmptyProperties,
  utf8Encode,
  generateGUID,
  generateUUID,
  truncate,
};

import { UAParser } from "ua-parser-js";

export interface ParsedUserAgent {
  browser?: {
    name?: string;
    version?: string;
  };
  os?: {
    name?: string;
    version?: string;
  };
  device?: {
    type?: string;
    vendor?: string;
    model?: string;
  };
}

// Parse user agent string to extract browser, OS, and device information

export const parseUserAgent = (userAgent?: string): ParsedUserAgent => {
  if (!userAgent) {
    return {};
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: {
      name: result.browser.name || "Unknown",
      version: result.browser.version || undefined,
    },
    os: {
      name: result.os.name || "Unknown",
      version: result.os.version || undefined,
    },
    device: {
      type: result.device.type || "desktop",
      vendor: result.device.vendor || undefined,
      model: result.device.model || undefined,
    },
  };
};

// Get a human-readable description of the session

export const getSessionDescription = (parsedUA: ParsedUserAgent): string => {
  const browserInfo = parsedUA.browser?.name
    ? `${parsedUA.browser.name}${
        parsedUA.browser.version ? ` ${parsedUA.browser.version}` : ""
      }`
    : "Unknown Browser";

  const osInfo = parsedUA.os?.name
    ? `${parsedUA.os.name}${
        parsedUA.os.version ? ` ${parsedUA.os.version}` : ""
      }`
    : "Unknown OS";

  const deviceType = parsedUA.device?.type
    ? parsedUA.device.type.charAt(0).toUpperCase() +
      parsedUA.device.type.slice(1)
    : "Desktop";

  return `${browserInfo} on ${osInfo} (${deviceType})`;
};

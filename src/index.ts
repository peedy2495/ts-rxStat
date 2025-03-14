import { serve } from "@hono/node-server";
import { readFileSync } from "fs";
import { join } from "path";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono();

// Read bearer token from environment variable or use default fallback value
const token = process.env.APP_BEARER || "a4382ae3-a1d4-4fb7-b966-3ea5cb1f0889";

let gnss = {
  position: { latitude: 0, longitude: 0, altitude: 0, speed: 0, course: 0 },
  spoofing: "none",
  gps: [{ seen: 0, used: 0, PRN: 0, elevation: 0, azimuth: 0, SNR: 0 }],
  glonass: [{ seen: 0, used: 0, PRN: 0, elevation: 0, azimuth: 0, SNR: 0 }],
  beidou: [{ seen: 0, used: 0, PRN: 0, elevation: 0, azimuth: 0, SNR: 0 }],
  galileo: [{ seen: 0, used: 0, PRN: 0, elevation: 0, azimuth: 0, SNR: 0 }],
};

let time = {
  stratum: 0,
  latency: 0,
  offset: 0,
  synced: true,
};

let system = {
  stream: "alive",
  receiver: "available",
  statusLEDs: "on",
  upTime: "0d 0h 0m 0s",
};

// Routing WEB Endpoints
app.get("/", (c) => {
  const htmlPath = join(new URL('.', import.meta.url).pathname, "index.html");
  const html = readFileSync(htmlPath, "utf-8");
  return c.html(html);
});

app.get("/system", (c) => {
  const htmlPath = join(new URL('.', import.meta.url).pathname, "system.html");
  const html = readFileSync(htmlPath, "utf-8");
  return c.html(html);
});

// Routing API Endpoints
app.get("/api/gnss", prettyJSON(), (c) => {
  return c.json(gnss);
});

app.get("/api/time", prettyJSON(), (c) => {
  return c.json(time);
});

app.get("/api/system", prettyJSON(), (c) => {
  return c.json(system);
});

app.put(
  "/api/system/statusLEDs",
  bearerAuth({ token }),
  prettyJSON(),
  async (c) => {
    const { statusLEDs } = await c.req.json();
    if (statusLEDs === "on" || statusLEDs === "off") {
      system.statusLEDs = statusLEDs;
      return c.json({ message: "statusLEDs updated successfully" });
    } else {
      return c.text(
        `Invalid statusLEDs value: ${statusLEDs}. Valid values: 'on'|'off'`,
        400
      );
    }
  }
);

// status code
app.post("/api/posts", (c) => c.json({ message: "Created!" }, 201));
// default route
app.get("/api/*", (c) => c.text("API endpoint is not found", 404));

// Throw Error
app.get("/error", () => {
  throw Error("Error has occurred");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

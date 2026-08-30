import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Next.js 16 blocks dev-server requests from origins other than localhost
  // by default (security hardening). Add LAN IPs here when testing the dev
  // server from another device (phone, tablet) on the same network — update
  // if your machine's LAN IP changes.
  allowedDevOrigins: ["192.168.100.4"],
};

export default nextConfig;

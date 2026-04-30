import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: true,
  },
};

export default nextConfig;

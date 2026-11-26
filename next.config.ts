import type { NextConfig } from "next";

const apiUrl = new URL(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: apiUrl.protocol.slice(0, -1) as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;

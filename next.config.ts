import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  // Redirect /uploads/* ke route handler /api/uploads/*
  // agar gambar yang diupload runtime bisa di-serve tanpa rebuild
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ]
  },
};

export default nextConfig;

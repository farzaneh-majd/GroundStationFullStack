/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@grafana/ui", "@grafana/data"],
};

export default nextConfig;

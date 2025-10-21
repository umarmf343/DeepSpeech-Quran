/** @type {import('next').NextConfig} */
const WINDOWS_SYSTEM_PATHS = [
  "C:/DumpStack.log.tmp",
  "C:/System Volume Information",
  "C:/hiberfil.sys",
  "C:/pagefile.sys",
  "C:/swapfile.sys",
];

const shouldIgnoreWindowsSystemPath = (path) => {
  if (typeof path !== "string") return false;

  const normalized = path.replace(/\\/g, "/");
  return WINDOWS_SYSTEM_PATHS.some(
    (systemPath) =>
      normalized === systemPath || normalized.startsWith(`${systemPath}/`)
  );
};

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "standalone",
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...(config.watchOptions ?? {}),
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          "**/.git/**",
          "**/build/**",
          "**/dist/**",
          "**/public/static/**",
          shouldIgnoreWindowsSystemPath,
        ],
      };
    }

    return config;
  },
};

export default nextConfig;

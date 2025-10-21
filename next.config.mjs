/** @type {import('next').NextConfig} */
const WINDOWS_SYSTEM_PATHS = [
  "C:/DumpStack.log.tmp",
  "C:/System Volume Information",
  "C:/hiberfil.sys",
  "C:/pagefile.sys",
  "C:/swapfile.sys",
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const WINDOWS_SYSTEM_REGEXES = WINDOWS_SYSTEM_PATHS.map((systemPath) => {
  const withoutDrive = systemPath.replace(/^([a-zA-Z]):[\\/]/, "");
  const escapedPath = escapeRegex(withoutDrive).replace(/\\\\/g, "[\\\\/]");

  return new RegExp(`(?:^|[\\\\/])${escapedPath}(?:$|[\\\\/])`, "i");
});

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
          ...WINDOWS_SYSTEM_REGEXES,
        ],
      };
    }

    return config;
  },
};

export default nextConfig;

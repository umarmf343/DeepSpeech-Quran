/** @type {import('next').NextConfig} */
const WINDOWS_SYSTEM_PATHS = [
  "C:/DumpStack.log.tmp",
  "C:/System Volume Information",
  "C:/hiberfil.sys",
  "C:/pagefile.sys",
  "C:/swapfile.sys",
];

const WINDOWS_SYSTEM_GLOBS = WINDOWS_SYSTEM_PATHS.map((systemPath) => {
  const withoutDrive = systemPath.replace(/^([a-zA-Z]):[\\/]/, "");
  const normalizedPath = withoutDrive
    .replace(/^[\\/]+/, "")
    .replace(/[\\/]+/g, "/");
  const globSafePath = normalizedPath
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => segment.replace(/\s/g, "\\ "))
    .join("/");

  if (!globSafePath) {
    return null;
  }

  return `**/${globSafePath}`;
}).filter(Boolean);

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
      const existingIgnored = config.watchOptions?.ignored ?? [];
      const ignoredArray = Array.isArray(existingIgnored)
        ? existingIgnored
        : [existingIgnored];
      const ignored = [
        ...ignoredArray,
        "**/node_modules/**",
        "**/.next/**",
        "**/.git/**",
        "**/build/**",
        "**/dist/**",
        "**/public/static/**",
        ...WINDOWS_SYSTEM_GLOBS,
      ].filter((pattern) => {
        if (typeof pattern === "string") {
          return pattern.trim().length > 0;
        }

        return pattern instanceof RegExp;
      });

      config.watchOptions = {
        ...(config.watchOptions ?? {}),
        ignored,
      };
    }

    return config;
  },
};

export default nextConfig;

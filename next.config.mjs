/** @type {import('next').NextConfig} */
const WINDOWS_SYSTEM_PATHS = [
  "C:/DumpStack.log.tmp",
  "C:/System Volume Information",
  "C:/hiberfil.sys",
  "C:/pagefile.sys",
  "C:/swapfile.sys",
];

const WINDOWS_SYSTEM_GLOBS = WINDOWS_SYSTEM_PATHS.flatMap((systemPath) => {
  const normalized = systemPath.replace(/\\/g, "/");
  const withoutDrive = normalized.replace(/^([a-zA-Z]):\//, "");

  return [
    normalized,
    `${normalized}/**`,
    `**/${withoutDrive}`,
    `**/${withoutDrive}/**`,
  ];
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
          ...WINDOWS_SYSTEM_GLOBS,
        ],
      };
    }

    return config;
  },
};

export default nextConfig;

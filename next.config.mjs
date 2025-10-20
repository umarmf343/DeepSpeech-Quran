const WINDOWS_PROTECTED_GLOBS = [
  "**/DumpStack.log.tmp",
  "**/System Volume Information/**",
  "**/hiberfil.sys",
  "**/pagefile.sys",
  "**/swapfile.sys",
];

const mergeIgnored = (existing = [], additions = []) => {
  const normalized = Array.isArray(existing)
    ? existing
    : existing
    ? [existing]
    : [];
  return [...normalized, ...additions];
};

const withWindowsWatchIgnores = (watchOptions = {}) => {
  if (process.platform !== "win32") return watchOptions;

  return {
    ...watchOptions,
    ignored: mergeIgnored(watchOptions.ignored, WINDOWS_PROTECTED_GLOBS),
  };
};

/** @type {import('next').NextConfig} */
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
      config.watchOptions = withWindowsWatchIgnores(config.watchOptions);
    }

    return config;
  },
};

export default nextConfig;

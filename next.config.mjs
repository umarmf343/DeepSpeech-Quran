const WINDOWS_PROTECTED_GLOBS = [
  "**/DumpStack.log.tmp",
  "**/System Volume Information/**",
  "**/hiberfil.sys",
  "**/pagefile.sys",
  "**/swapfile.sys",
];

const normalizeIgnoredGlobs = (ignored) => {
  if (!ignored) return [];

  if (Array.isArray(ignored)) {
    return ignored.filter(
      (item) => typeof item === "string" && item.trim().length > 0,
    );
  }

  if (typeof ignored === "string") {
    return ignored.trim().length > 0 ? [ignored] : [];
  }

  return [];
};

const withWindowsWatchIgnores = (watchOptions = {}) => {
  if (process.platform !== "win32") return watchOptions;

  const existing = normalizeIgnoredGlobs(watchOptions.ignored);
  const merged = Array.from(
    new Set([...existing, ...WINDOWS_PROTECTED_GLOBS]),
  );

  return {
    ...watchOptions,
    ignored: merged,
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

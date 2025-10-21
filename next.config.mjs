const WINDOWS_PROTECTED_PATTERNS = [
  /(?:^|[\\/])DumpStack\.log\.tmp$/i,
  /(?:^|[\\/])System Volume Information(?:[\\/]|$)/i,
  /(?:^|[\\/])hiberfil\.sys$/i,
  /(?:^|[\\/])pagefile\.sys$/i,
  /(?:^|[\\/])swapfile\.sys$/i,
];

const normalizeIgnoredEntries = (ignored) => {
  if (!ignored) return [];

  if (Array.isArray(ignored)) {
    return ignored.filter((item) => typeof item === "string" || item instanceof RegExp);
  }

  if (typeof ignored === "string" || ignored instanceof RegExp) {
    return [ignored];
  }

  return [];
};

const containsPattern = (collection, candidate) => {
  return collection.some((item) => {
    if (item === candidate) return true;

    if (item instanceof RegExp && candidate instanceof RegExp) {
      return item.toString() === candidate.toString();
    }

    return false;
  });
};

const DEFAULT_WATCH_IGNORED_PATTERNS = [
  "**/node_modules/**",
  "**/.next/**",
  "**/.git/**",
  "**/build/**",
];

const mergeIgnoredPatterns = (existing) => {
  const normalized = normalizeIgnoredEntries(existing);
  const merged = [...DEFAULT_WATCH_IGNORED_PATTERNS];

  normalized.forEach((pattern) => {
    if (!containsPattern(merged, pattern)) {
      merged.push(pattern);
    }
  });

  return merged;
};

const withWindowsWatchIgnores = (watchOptions = {}) => {
  if (process.platform !== "win32") return watchOptions;

  const existing = normalizeIgnoredEntries(watchOptions.ignored);
  const merged = [...existing];

  WINDOWS_PROTECTED_PATTERNS.forEach((pattern) => {
    if (!containsPattern(merged, pattern)) {
      merged.push(pattern);
    }
  });

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
      const baseWatchOptions = {
        ...(config.watchOptions ?? {}),
        ignored: mergeIgnoredPatterns(config.watchOptions?.ignored),
      };

      config.watchOptions = withWindowsWatchIgnores(baseWatchOptions);
    }

    return config;
  },
};

export default nextConfig;

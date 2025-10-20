const WINDOWS_PROTECTED_GLOBS = [
  "**/DumpStack.log.tmp",
  "**/System Volume Information/**",
  "**/hiberfil.sys",
  "**/pagefile.sys",
  "**/swapfile.sys",
];

const WINDOWS_PROTECTED_REGEXES = [
  /(?:^|[\\/])DumpStack\.log\.tmp$/,
  /(?:^|[\\/])System Volume Information(?:$|[\\/])/, 
  /(?:^|[\\/])hiberfil\.sys$/,
  /(?:^|[\\/])pagefile\.sys$/,
  /(?:^|[\\/])swapfile\.sys$/,
];

const ensureArray = (value) => {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
};

const filterInvalidIgnored = (items) =>
  items.filter((item) => {
    if (item == null) return false;
    if (typeof item === "string") return item.trim().length > 0;
    if (item instanceof RegExp) return true;
    if (typeof item === "function") return true;
    return false;
  });

const mergeIgnored = (existing, additions) => {
  if (typeof existing === "function") {
    const windowsIgnoreFn = (path) =>
      WINDOWS_PROTECTED_REGEXES.some((regex) => regex.test(path));

    return (path, ...rest) =>
      existing(path, ...rest) || windowsIgnoreFn(path, ...rest);
  }

  const normalized = filterInvalidIgnored(ensureArray(existing));

  if (normalized.length === 0) {
    return [...additions.regex];
  }

  if (normalized.every((item) => item instanceof RegExp)) {
    return [...normalized, ...additions.regex];
  }

  if (normalized.every((item) => typeof item === "string")) {
    return [...normalized, ...additions.globs];
  }

  if (normalized.every((item) => typeof item === "function")) {
    const windowsIgnoreFn = (path) =>
      WINDOWS_PROTECTED_REGEXES.some((regex) => regex.test(path));

    return [...normalized, windowsIgnoreFn];
  }

  return normalized;
};

const withWindowsWatchIgnores = (watchOptions = {}) => {
  if (process.platform !== "win32") return watchOptions;

  const additions = {
    globs: WINDOWS_PROTECTED_GLOBS,
    regex: WINDOWS_PROTECTED_REGEXES,
  };

  return {
    ...watchOptions,
    ignored: mergeIgnored(watchOptions.ignored, additions),
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

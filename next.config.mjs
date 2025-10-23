/** @type {import('next').NextConfig} */
process.env.NEXT_FONT_GOOGLE_FETCH_TIMEOUT ||= "60000";

const WINDOWS_SYSTEM_PATHS = [
  "C:/DumpStack.log.tmp",
  "C:/System Volume Information",
  "C:/hiberfil.sys",
];

const WINDOWS_SYSTEM_GLOBS = WINDOWS_SYSTEM_PATHS.map((systemPath) => {
  const withoutDrive = systemPath.replace(/^([a-zA-Z]):[\\/]/, "");
  const normalizedPath = withoutDrive
    .replace(/^[\\/]+/, "")
    .replace(/[\\/]+/g, "/");
  const globSafePath = normalizedPath
    .split("/")
    .filter((segment) => segment.length > 0)
    .join("/");

  if (!globSafePath) {
    return null;
  }

  return globSafePath;
}).filter(Boolean);

const ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g;
const escapeRegExp = (value) => value.replace(ESCAPE_REGEX, "\\$&");

const CUSTOM_WATCH_IGNORE_PATTERNS = [
  "node_modules",
  ".next",
  ".git",
  "build",
  "dist",
  "public/static",
  ...WINDOWS_SYSTEM_GLOBS,
];

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
      const existingIgnored = config.watchOptions?.ignored;
      const customStrings = CUSTOM_WATCH_IGNORE_PATTERNS.filter(
        (pattern) => typeof pattern === "string" && pattern.trim().length > 0
      );

      const customRegexSource = customStrings
        .map((pattern) =>
          `(?:^|[\\\\/])${escapeRegExp(
            pattern.replace(/\\\\/g, "/")
          )}(?:$|[\\\\/])`
        )
        .join("|");

      let ignoredValue;

      if (existingIgnored instanceof RegExp) {
        const combinedSource = [existingIgnored.source, customRegexSource]
          .filter((source) => source && source.length > 0)
          .join("|");
        const combinedFlags = Array.from(
          new Set(`${existingIgnored.flags}i`.split(""))
        )
          .sort()
          .join("");

        ignoredValue = new RegExp(combinedSource, combinedFlags);
      } else if (Array.isArray(existingIgnored)) {
        ignoredValue = [
          ...existingIgnored.filter(
            (value) => typeof value === "string" && value.trim().length > 0
          ),
          ...customStrings,
        ];
      } else if (typeof existingIgnored === "string") {
        ignoredValue = [existingIgnored, ...customStrings];
      } else if (customStrings.length > 0) {
        ignoredValue = customStrings;
      }

      const watchOptions = {
        ...(config.watchOptions ?? {}),
      };

      if (ignoredValue) {
        watchOptions.ignored = ignoredValue;
      }

      config.watchOptions = watchOptions;
    }

    return config;
  },
};

export default nextConfig;

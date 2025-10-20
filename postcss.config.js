const loadTailwindPlugin = () => {
  try {
    // Tailwind CSS v4 exposes its PostCSS plugin via @tailwindcss/postcss
    return require("@tailwindcss/postcss")
  } catch (errorV4) {
    if (errorV4?.code !== "MODULE_NOT_FOUND") {
      throw errorV4
    }

    // Fall back to the classic Tailwind CSS v3 plugin entry point
    return require("tailwindcss")
  }
}

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [loadTailwindPlugin(), require("autoprefixer")],
}

module.exports = config

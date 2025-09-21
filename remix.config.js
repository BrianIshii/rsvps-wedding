/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "esm",
  serverPlatform: "node",
  serverDependenciesToBundle: [
    /^@remix-run\/cloudflare/,
  ],
  serverConditions: ["workerd", "worker"],
  serverMainFields: ["browser", "module"],
  serverMinify: true,
  serverExternalPackages: [],
};


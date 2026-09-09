import { cp, mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { build } from "../node_modules/esbuild/lib/main.js";

const root = process.cwd();
const out = join(root, ".vercel/output");
const nodeRuntime = "nodejs22.x";
const modulePackageJson = JSON.stringify({ type: "module" }, null, 2);
const firehacksHost = "firehacks.codestarters.org";
const firehacksHostRoutes = [
  {
    src: "/",
    status: 302,
    headers: { Location: "https://codestarters.org/events" },
    has: [{ type: "host", value: firehacksHost }],
  },
  { src: "/member", dest: "/firehacks/member", has: [{ type: "host", value: firehacksHost }] },
  {
    src: "/member/(.*)",
    dest: "/firehacks/member/$1",
    has: [{ type: "host", value: firehacksHost }],
  },
  { src: "/portal", dest: "/firehacks/portal", has: [{ type: "host", value: firehacksHost }] },
  {
    src: "/portal/(.*)",
    dest: "/firehacks/portal/$1",
    has: [{ type: "host", value: firehacksHost }],
  },
];

await rm(out, { recursive: true, force: true });
await mkdir(join(out, "static"), { recursive: true });
await mkdir(join(out, "functions/index.func"), { recursive: true });

const standaloneFunctions = [
  {
    route: "/api/summer-signups",
    name: "api/summer-signups",
    entry: "src/vercel-functions/summer-signups.ts",
  },
  {
    route: "/api/admin/summer-signups",
    name: "api/admin/summer-signups",
    entry: "src/vercel-functions/admin-summer-signups.ts",
  },
  {
    route: "/api/admin/dashboard-stats",
    name: "api/admin/dashboard-stats",
    entry: "src/vercel-functions/admin-dashboard-stats.ts",
  },
  {
    route: "/api/admin/volunteers",
    name: "api/admin/volunteers",
    entry: "src/vercel-functions/admin-volunteers.ts",
  },
  {
    route: "/api/admin/website-requests",
    name: "api/admin/website-requests",
    entry: "src/vercel-functions/admin-website-requests.ts",
  },
];

// Static assets served by Vercel CDN
await cp(join(root, "dist/client"), join(out, "static"), { recursive: true });

// Bundle the TanStack Start server + all npm deps into a single Node.js file.
// The server exports { default: { fetch(req, env, ctx) } } (Web Fetch API handler).
// We wrap it with a Node.js HTTP adapter for Vercel serverless functions.
const adapterSrc = `
import server from ${JSON.stringify(join(root, "dist/server/server.js"))};

export default async function handler(req, res) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  const url = new URL(req.url, \`\${proto}://\${host}\`);

  if (url.hostname === ${JSON.stringify(firehacksHost)}) {
    if (url.pathname === "/") {
      res.statusCode = 302;
      res.setHeader("Location", "https://codestarters.org/events");
      res.end();
      return;
    }
    if (url.pathname === "/member" || url.pathname.startsWith("/member/")) {
      url.pathname = "/firehacks" + url.pathname;
    } else if (url.pathname === "/portal" || url.pathname.startsWith("/portal/")) {
      url.pathname = "/firehacks" + url.pathname;
    }
  }

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v == null) continue;
    if (Array.isArray(v)) v.forEach((s) => headers.append(k, s));
    else headers.set(k, v);
  }

  let body = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    if (chunks.length) body = Buffer.concat(chunks);
  }

  const webReq = new Request(url.toString(), { method: req.method, headers, body });
  const webRes = await server.fetch(webReq, {}, {});

  res.statusCode = webRes.status;
  for (const [k, v] of webRes.headers.entries()) res.setHeader(k, v);
  res.end(Buffer.from(await webRes.arrayBuffer()));
}
`;

// Write a temp entry file
const tmpEntry = join(root, ".vercel-adapter-tmp.mjs");
await writeFile(tmpEntry, adapterSrc);

await build({
  entryPoints: [tmpEntry],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: join(out, "functions/index.func/index.js"),
  splitting: false,
  packages: "bundle",
  external: [],
  minify: false,
  logLevel: "warning",
  // CJS packages bundled into ESM call require() for Node built-ins (e.g. react-dom/server).
  // Inject a createRequire shim at the top so those calls resolve correctly.
  banner: {
    js: `import { createRequire } from "module";\nconst require = createRequire(import.meta.url);`,
  },
});

for (const fn of standaloneFunctions) {
  const fnDir = join(out, "functions", `${fn.name}.func`);
  await mkdir(fnDir, { recursive: true });
  await build({
    entryPoints: [join(root, fn.entry)],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    outfile: join(fnDir, "index.js"),
    splitting: false,
    packages: "bundle",
    external: [],
    minify: false,
    logLevel: "warning",
    banner: {
      js: `import { createRequire } from "module";\nconst require = createRequire(import.meta.url);`,
    },
  });
  await writeFile(
    join(fnDir, ".vc-config.json"),
    JSON.stringify({ runtime: nodeRuntime, handler: "index.js" }, null, 2),
  );
  await writeFile(join(fnDir, "package.json"), modulePackageJson);
}

// Clean up temp file
await rm(tmpEntry, { force: true });

// Tell Vercel this is a Node.js 20 serverless function
await writeFile(
  join(out, "functions/index.func/.vc-config.json"),
  JSON.stringify({ runtime: nodeRuntime, handler: "index.js", launchTarget: "server" }, null, 2),
);
await writeFile(join(out, "functions/index.func/package.json"), modulePackageJson);

// Vercel Build Output API v3: host rewrites before filesystem so the FireHacks
// subdomain does not get served the root CodeStarters static entry first.
await writeFile(
  join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        ...firehacksHostRoutes,
        { src: "/", dest: "/index" },
        ...standaloneFunctions.map((fn) => ({ src: fn.route, dest: fn.route })),
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/index" },
      ],
    },
    null,
    2,
  ),
);

console.log("✓ .vercel/output/ created (Node.js serverless, fully bundled)");

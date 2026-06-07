const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    outfile: "dist/bundle.js"
});
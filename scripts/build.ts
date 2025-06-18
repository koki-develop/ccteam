import { $ } from "bun";

await $`rm -rf dist`;

await Bun.build({
  banner: "#!/usr/bin/env node",
  entrypoints: ["./src/main.ts"],
  outdir: "./dist",
  target: "node",
  packages: "external",
});

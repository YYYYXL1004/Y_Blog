import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
	plugins: [svelte(), svelteTesting()],
	resolve: {
		alias: {
			"@": src,
			"@components": `${src}/components`,
			"@assets": `${src}/assets`,
			"@constants": `${src}/constants`,
			"@utils": `${src}/utils`,
			"@i18n": `${src}/i18n`,
			"@layouts": `${src}/layouts`,
		},
	},
	test: {
		environment: "jsdom",
		setupFiles: ["./tests/setup.ts"],
		include: ["tests/**/*.test.{js,mjs,ts}"],
	},
});

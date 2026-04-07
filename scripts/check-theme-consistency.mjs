import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);

/**
 * @typedef {{
 *   file: string;
 *   description: string;
 *   mustMatch?: RegExp[];
 *   mustNotMatch?: RegExp[];
 * }} Check
 */

/** @type {Check[]} */
const checks = [
	{
		file: "src/components/widget/Profile.astro",
		description:
			"Profile uses shared text tokens instead of hardcoded neutral text colors",
		mustNotMatch: [/text-neutral-/],
	},
	{
		file: "src/components/widget/WidgetLayout.astro",
		description:
			"WidgetLayout uses shared text tokens instead of hardcoded neutral text colors",
		mustNotMatch: [/text-neutral-/],
	},
	{
		file: "src/components/control/Pagination.astro",
		description:
			"Pagination avoids hardcoded neutral and inverted current-page text colors",
		mustNotMatch: [/text-neutral-/, /text-white/, /dark:text-black/],
	},
	{
		file: "src/components/control/ButtonLink.astro",
		description: "ButtonLink avoids hardcoded neutral text colors",
		mustNotMatch: [/text-neutral-/],
	},
	{
		file: "src/components/Navbar.astro",
		description:
			"Floating navbar routes visual styling through dedicated home-nav classes",
		mustMatch: [/home-nav-brand/, /home-nav-link/, /home-nav-icon-btn/],
		mustNotMatch: [/text-white/, /border-white/, /bg-black\//],
	},
	{
		file: "src/components/home/HomeHero.astro",
		description:
			"HomeHero uses dedicated theme-aware overlay classes instead of fixed dark layers",
		mustMatch: [/home-hero-overlay/, /home-hero-gradient/, /home-hero-quote/],
		mustNotMatch: [/bg-black\//, /rgba\(4,9,18/, /text-white/],
	},
	{
		file: "src/components/Search.svelte",
		description:
			"Mobile search input no longer expands to a fixed width on focus",
		mustNotMatch: [/bind:value=\{keywordMobile\}[\s\S]{0,220}focus:w-60/],
	},
];

const failures = [];

for (const check of checks) {
	const filePath = path.join(rootDir, check.file);
	const content = readFileSync(filePath, "utf8");

	for (const pattern of check.mustMatch ?? []) {
		if (!pattern.test(content)) {
			failures.push(`${check.file}: ${check.description} (missing ${pattern})`);
		}
	}

	for (const pattern of check.mustNotMatch ?? []) {
		const match = content.match(pattern);
		if (match) {
			failures.push(
				`${check.file}: ${check.description} (found ${JSON.stringify(match[0])})`,
			);
		}
	}
}

if (failures.length > 0) {
	console.error("Theme consistency checks failed:");
	for (const failure of failures) {
		console.error(`- ${failure}`);
	}
	process.exit(1);
}

console.log("Theme consistency checks passed.");

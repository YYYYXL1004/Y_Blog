import { resolve } from "node:path";
import {
	extractUsernameFromArgv,
	syncBangumiDataset,
} from "./lib/bangumi-sync.mjs";

const username = extractUsernameFromArgv(process.argv);

if (!username) {
	throw new Error(
		"Usage: corepack pnpm bangumi:sync <username> or corepack pnpm run bangumi:sync -- <username>",
	);
}

const outputPath = resolve("src/data/bangumi/anime-collections.json");
const dataset = await syncBangumiDataset(username, outputPath);

console.log(
	`Bangumi sync complete: wish=${dataset.counts.wish} doing=${dataset.counts.doing} collect=${dataset.counts.collect}`,
);

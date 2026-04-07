import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const DEFAULT_IMAGE = "https://lain.bgm.tv/img/no_icon_subject.png";
const API_ROOT = "https://api.bgm.tv/v0/users";
const PAGE_SIZE = 30;
const STATUS_TO_TYPE = {
	wish: 1,
	collect: 2,
	doing: 3,
};

export function extractUsernameFromArgv(argv = process.argv) {
	const candidate = argv.slice(2).find((arg) => arg && arg !== "--");
	if (!candidate) {
		return "";
	}

	return candidate.startsWith("@") ? candidate.slice(1) : candidate;
}

export function normalizeCollectionItem(item, status) {
	const subject = item.subject ?? {};
	const collection = subject.collection ?? {};
	const id = subject.id ?? item.subject_id ?? 0;

	return {
		id,
		url: `https://bgm.tv/subject/${id}`,
		name: subject.name ?? "",
		nameCn: subject.name_cn ?? "",
		displayName: subject.name_cn || subject.name || "",
		image: subject.images?.medium ?? subject.images?.common ?? DEFAULT_IMAGE,
		eps: subject.eps ?? 0,
		score: subject.score ?? 0,
		rank: subject.rank ?? 0,
		collectionTotal: subject.collection_total ?? 0,
		wishCount: collection.wish ?? 0,
		doingCount: collection.doing ?? 0,
		collectCount: collection.collect ?? 0,
		summary: subject.short_summary ?? "",
		airDate: subject.date ?? "",
		status,
	};
}

export function buildBangumiDataset(username, groups) {
	return {
		username,
		updatedAt: new Date().toISOString(),
		counts: {
			wish: groups.wish.length,
			doing: groups.doing.length,
			collect: groups.collect.length,
		},
		groups: {
			wish: groups.wish.map((item) => normalizeCollectionItem(item, "wish")),
			doing: groups.doing.map((item) => normalizeCollectionItem(item, "doing")),
			collect: groups.collect.map((item) =>
				normalizeCollectionItem(item, "collect"),
			),
		},
	};
}

export async function fetchCollectionGroup(
	username,
	status,
	fetchImpl = globalThis.fetch,
) {
	const type = STATUS_TO_TYPE[status];
	if (!type) {
		throw new Error(`Unsupported Bangumi status: ${status}`);
	}

	const items = [];
	let offset = 0;
	let total = Number.POSITIVE_INFINITY;

	while (offset < total) {
		const url =
			`${API_ROOT}/${encodeURIComponent(username)}/collections` +
			`?subject_type=2&type=${type}&limit=${PAGE_SIZE}&offset=${offset}`;
		const response = await fetchImpl(url, {
			headers: {
				Accept: "application/json",
				"User-Agent": "yyxl-bangumi-sync/0.1 (https://github.com/yyyyxl/Y_Blog)",
			},
		});

		if (!response.ok) {
			throw new Error(
				`Bangumi request failed: ${response.status} ${response.statusText}`,
			);
		}

		const payload = await response.json();
		const page = payload.data ?? [];
		total = payload.total ?? page.length;
		items.push(...page);
		offset += page.length;

		if (page.length === 0) {
			break;
		}
	}

	return items;
}

export async function writeBangumiDataset(filePath, dataset) {
	await mkdir(dirname(filePath), { recursive: true });
	await writeFile(filePath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
}

export async function syncBangumiDataset(
	username,
	outputPath,
	fetchImpl = globalThis.fetch,
) {
	const groups = {
		wish: await fetchCollectionGroup(username, "wish", fetchImpl),
		doing: await fetchCollectionGroup(username, "doing", fetchImpl),
		collect: await fetchCollectionGroup(username, "collect", fetchImpl),
	};

	const dataset = buildBangumiDataset(username, groups);
	await writeBangumiDataset(outputPath, dataset);
	return dataset;
}

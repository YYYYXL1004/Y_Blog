import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	buildBangumiDataset,
	extractUsernameFromArgv,
	fetchCollectionGroup,
	normalizeCollectionItem,
	syncBangumiDataset,
	writeBangumiDataset,
} from "../../scripts/lib/bangumi-sync.mjs";

const apiItem = {
	subject_id: 1,
	type: 3,
	subject_type: 2,
	subject: {
		id: 1,
		name: "Kimi to Boku",
		name_cn: "反正与你和我",
		short_summary: "summary text",
		eps: 12,
		score: 7.6,
		rank: 100,
		collection_total: 12010,
		images: { medium: "https://img.test/1.jpg" },
		collection: {
			wish: 2213,
			doing: 9063,
			collect: 410,
			on_hold: 0,
			dropped: 0,
		},
	},
};

describe("normalizeCollectionItem", () => {
	it("maps a Bangumi API item into the page record shape", () => {
		expect(normalizeCollectionItem(apiItem, "doing")).toEqual({
			id: 1,
			url: "https://bgm.tv/subject/1",
			name: "Kimi to Boku",
			nameCn: "反正与你和我",
			displayName: "反正与你和我",
			image: "https://img.test/1.jpg",
			eps: 12,
			score: 7.6,
			rank: 100,
			collectionTotal: 12010,
			wishCount: 2213,
			doingCount: 9063,
			collectCount: 410,
			summary: "summary text",
			airDate: "",
			status: "doing",
		});
	});

	it("falls back to original name and zero values when fields are missing", () => {
		expect(
			normalizeCollectionItem(
				{
					subject_id: 2,
					type: 1,
					subject_type: 2,
					subject: { id: 2, name: "Only Name" },
				},
				"wish",
			),
		).toMatchObject({
			displayName: "Only Name",
			eps: 0,
			score: 0,
			rank: 0,
			collectionTotal: 0,
			wishCount: 0,
			doingCount: 0,
			collectCount: 0,
			summary: "",
			status: "wish",
		});
	});
});

describe("buildBangumiDataset", () => {
	it("groups records and computes counts", () => {
		const dataset = buildBangumiDataset("yyxl", {
			wish: [apiItem],
			doing: [apiItem],
			collect: [],
		});

		expect(dataset.username).toBe("yyxl");
		expect(dataset.counts).toEqual({ wish: 1, doing: 1, collect: 0 });
		expect(dataset.groups.doing[0].status).toBe("doing");
	});
});

describe("extractUsernameFromArgv", () => {
	it("skips pnpm's -- separator", () => {
		expect(extractUsernameFromArgv(["node", "script", "--", "1162847"])).toBe(
			"1162847",
		);
	});

	it("strips a leading @ from the username", () => {
		expect(extractUsernameFromArgv(["node", "script", "@1162847"])).toBe(
			"1162847",
		);
	});
});

describe("fetchCollectionGroup", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"fetch",
			vi.fn()
				.mockResolvedValueOnce(
					new Response(JSON.stringify({ data: [{ id: 1 }], total: 2 }), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					}),
				)
				.mockResolvedValueOnce(
					new Response(JSON.stringify({ data: [{ id: 2 }], total: 2 }), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					}),
				),
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("walks Bangumi pagination until all items are fetched", async () => {
		const items = await fetchCollectionGroup("yyxl", "doing");

		expect(items).toEqual([{ id: 1 }, { id: 2 }]);
		expect(fetch).toHaveBeenCalledTimes(2);
		expect(fetch.mock.calls[0][0]).toContain("subject_type=2");
		expect(fetch.mock.calls[0][0]).toContain("type=3");
	});
});

describe("writeBangumiDataset", () => {
	it("writes formatted json to disk", async () => {
		const dir = await mkdtemp(join(tmpdir(), "bangumi-"));
		const file = join(dir, "anime-collections.json");

		await writeBangumiDataset(file, {
			username: "yyxl",
			counts: { wish: 0, doing: 0, collect: 0 },
			groups: { wish: [], doing: [], collect: [] },
		});

		expect(JSON.parse(await readFile(file, "utf8")).username).toBe("yyxl");
	});
});

describe("syncBangumiDataset", () => {
	it("fetches all three groups and writes the combined dataset", async () => {
		const dir = await mkdtemp(join(tmpdir(), "bangumi-sync-"));
		const file = join(dir, "anime-collections.json");
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ data: [apiItem], total: 1 }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ data: [], total: 0 }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ data: [apiItem], total: 1 }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			);

		const dataset = await syncBangumiDataset("yyxl", file, fetchMock);

		expect(fetchMock).toHaveBeenCalledTimes(3);
		expect(dataset.counts).toEqual({ wish: 1, doing: 0, collect: 1 });
		expect(JSON.parse(await readFile(file, "utf8")).counts.collect).toBe(1);
	});
});

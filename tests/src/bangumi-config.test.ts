import { describe, expect, it } from "vitest";
import bangumiData from "../../src/data/bangumi/anime-collections.json";
import I18nKey from "../../src/i18n/i18nKey";
import { LinkPresets } from "../../src/constants/link-presets";
import { LinkPreset } from "../../src/types/config";

describe("Bangumi route wiring", () => {
	it("registers a Bangumi navbar preset", () => {
		expect(LinkPresets[LinkPreset.Bangumi].url).toBe("/bangumi/");
		expect(LinkPresets[LinkPreset.Bangumi].name).toBeTruthy();
		expect(I18nKey.bangumi).toBe("bangumi");
	});

	it("provides a generated Bangumi dataset file", () => {
		expect(bangumiData.counts.wish).toBeGreaterThanOrEqual(0);
		expect(bangumiData.counts.doing).toBeGreaterThanOrEqual(0);
		expect(bangumiData.counts.collect).toBeGreaterThanOrEqual(0);
		expect(Array.isArray(bangumiData.groups.doing)).toBe(true);
	});
});

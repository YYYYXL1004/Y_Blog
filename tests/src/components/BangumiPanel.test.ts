import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import BangumiPanel from "../../../src/components/BangumiPanel.svelte";

function createEntry(id: number, displayName: string, status: "wish" | "doing" | "collect") {
	return {
		id,
		url: `https://bgm.tv/subject/${id}`,
		name: displayName,
		nameCn: displayName,
		displayName,
		image: `/entry-${id}.jpg`,
		eps: 12,
		score: 7.1,
		rank: id,
		collectionTotal: 100 + id,
		wishCount: 10,
		doingCount: 20,
		collectCount: 30,
		summary: `${displayName} summary`,
		airDate: "",
		status,
	};
}

const dataset = {
	username: "yyxl",
	updatedAt: "2026-04-07T00:00:00.000Z",
	counts: {
		wish: 11,
		doing: 11,
		collect: 12,
	},
	groups: {
		wish: Array.from({ length: 11 }, (_, index) =>
			createEntry(index + 1, `想看作品 ${index + 1}`, "wish"),
		),
		doing: Array.from({ length: 11 }, (_, index) =>
			createEntry(index + 101, `在看作品 ${index + 1}`, "doing"),
		),
		collect: Array.from({ length: 12 }, (_, index) =>
			createEntry(index + 201, `看过作品 ${index + 1}`, "collect"),
		),
	},
};

describe("BangumiPanel", () => {
	it("shows doing items by default", () => {
		render(BangumiPanel, { props: { dataset } });

		expect(screen.getByText("在看作品 1")).toBeInTheDocument();
		expect(screen.queryByText("想看作品 1")).not.toBeInTheDocument();
	});

	it("switches visible groups when tabs are clicked", async () => {
		render(BangumiPanel, { props: { dataset } });

		await fireEvent.click(screen.getByRole("button", { name: "想看 (11)" }));

		expect(screen.getByText("想看作品 1")).toBeInTheDocument();
		expect(screen.queryByText("在看作品 1")).not.toBeInTheDocument();
	});

	it("shows an empty state when the active group has no items", async () => {
		render(BangumiPanel, {
			props: {
				dataset: {
					...dataset,
					counts: { ...dataset.counts, collect: 0 },
					groups: { ...dataset.groups, collect: [] },
				},
			},
		});

		await fireEvent.click(screen.getByRole("button", { name: "看过 (0)" }));

		expect(screen.getByText("这个分组还没有条目。")).toBeInTheDocument();
	});

	it("shows 10 items per page and supports page switching", async () => {
		render(BangumiPanel, { props: { dataset } });

		expect(screen.getByText("在看作品 10")).toBeInTheDocument();
		expect(screen.queryByText("在看作品 11")).not.toBeInTheDocument();

		await fireEvent.click(screen.getByRole("button", { name: "第 2 页" }));

		expect(screen.getByText("在看作品 11")).toBeInTheDocument();
		expect(screen.queryByText("在看作品 1")).not.toBeInTheDocument();
	});

	it("resets to page 1 when switching groups", async () => {
		render(BangumiPanel, { props: { dataset } });

		await fireEvent.click(screen.getByRole("button", { name: "第 2 页" }));
		expect(screen.getByText("在看作品 11")).toBeInTheDocument();

		await fireEvent.click(screen.getByRole("button", { name: "看过 (12)" }));

		expect(screen.getByText("看过作品 1")).toBeInTheDocument();
		expect(screen.queryByText("看过作品 11")).not.toBeInTheDocument();
	});

	it("does not show wish doing collect metrics inside an entry card", () => {
		render(BangumiPanel, { props: { dataset } });

		expect(screen.queryByText("想看 10")).not.toBeInTheDocument();
		expect(screen.queryByText("在看 20")).not.toBeInTheDocument();
		expect(screen.queryByText("看过 30")).not.toBeInTheDocument();
		expect(screen.getByText("总收藏 201")).toBeInTheDocument();
	});
});

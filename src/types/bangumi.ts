export type BangumiStatus = "wish" | "doing" | "collect";

export type BangumiEntry = {
	id: number;
	url: string;
	name: string;
	nameCn: string;
	displayName: string;
	image: string;
	eps: number;
	score: number;
	rank: number;
	collectionTotal: number;
	wishCount: number;
	doingCount: number;
	collectCount: number;
	summary: string;
	airDate: string;
	status: BangumiStatus;
};

export type BangumiDataset = {
	username: string;
	updatedAt: string;
	counts: Record<BangumiStatus, number>;
	groups: Record<BangumiStatus, BangumiEntry[]>;
};

<script lang="ts">
	import type { BangumiDataset, BangumiStatus } from "@/types/bangumi";

	export let dataset: BangumiDataset;

	const tabs: Array<{ key: BangumiStatus; label: string }> = [
		{ key: "wish", label: "想看" },
		{ key: "doing", label: "在看" },
		{ key: "collect", label: "看过" },
	];
	const pageSize = 10;

	let activeTab: BangumiStatus = "doing";
	let currentPage = 1;

	$: items = dataset.groups[activeTab] ?? [];
	$: counts = dataset.counts;
	$: totalPages = Math.max(1, Math.ceil(items.length / pageSize));
	$: currentPage = Math.min(currentPage, totalPages);
	$: pagedItems = items.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);
	$: pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

	function formatMetric(value: number) {
		return value > 0 ? value : "-";
	}

	function switchTab(tab: BangumiStatus) {
		activeTab = tab;
		currentPage = 1;
	}

	function switchPage(page: number) {
		currentPage = page;
	}
</script>

<div class="card-base px-6 py-6 md:px-8 md:py-8">
	<div class="border-l-4 border-[var(--primary)] bg-[var(--btn-plain-bg-hover)] px-5 py-4">
		<p class="text-2xl font-semibold text-[var(--shell-text)]">生命不息，追番不止！</p>
	</div>

	<div class="mt-8 flex flex-wrap gap-3">
		{#each tabs as tab}
			<button
				type="button"
				class:list={[
					"rounded-full px-4 py-2 text-sm font-semibold transition",
					activeTab === tab.key
						? "bg-[var(--primary)] text-white"
						: "bg-[var(--btn-plain-bg)] text-[var(--shell-text-soft)]",
				]}
				aria-label={`${tab.label} (${counts[tab.key] ?? 0})`}
				on:click={() => switchTab(tab.key)}
			>
				{tab.label} ({counts[tab.key] ?? 0})
			</button>
		{/each}
	</div>

	{#if items.length === 0}
		<p class="mt-8 text-sm text-[var(--shell-text-soft)]">这个分组还没有条目。</p>
	{:else}
		<div class="mt-8 divide-y divide-[var(--line-divider)]">
			{#each pagedItems as item}
				<article class="grid gap-5 py-6 md:grid-cols-[10rem_minmax(0,1fr)]">
					<img
						src={item.image}
						alt={item.displayName}
						class="h-56 w-40 rounded-2xl object-cover"
						loading="lazy"
					/>
					<div class="min-w-0">
						<a
							href={item.url}
							target="_blank"
							rel="noreferrer"
							class="text-2xl font-semibold text-[var(--primary)] hover:underline"
						>
							{item.displayName}
						</a>
						<div class="mt-4 grid gap-3 text-sm text-[var(--shell-text-soft)] sm:grid-cols-2 xl:grid-cols-4">
							<div>话数 {formatMetric(item.eps)}</div>
							<div>评分 {formatMetric(item.score)}</div>
							<div>排名 {formatMetric(item.rank)}</div>
							<div>总收藏 {item.collectionTotal ?? 0}</div>
						</div>
						<p class="mt-4 text-base leading-8 text-[var(--shell-text)]">
							{item.summary || "暂无简介"}
						</p>
					</div>
				</article>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="mt-8 flex flex-wrap items-center justify-center gap-2">
				<button
					type="button"
					class="rounded-full bg-[var(--btn-plain-bg)] px-4 py-2 text-sm font-semibold text-[var(--shell-text-soft)] transition disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="上一页"
					disabled={currentPage === 1}
					on:click={() => switchPage(currentPage - 1)}
				>
					上一页
				</button>

				{#each pageNumbers as page}
					<button
						type="button"
						class:list={[
							"rounded-full px-3 py-2 text-sm font-semibold transition",
							page === currentPage
								? "bg-[var(--primary)] text-white"
								: "bg-[var(--btn-plain-bg)] text-[var(--shell-text-soft)]",
						]}
						aria-label={`第 ${page} 页`}
						on:click={() => switchPage(page)}
					>
						{page}
					</button>
				{/each}

				<button
					type="button"
					class="rounded-full bg-[var(--btn-plain-bg)] px-4 py-2 text-sm font-semibold text-[var(--shell-text-soft)] transition disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="下一页"
					disabled={currentPage === totalPages}
					on:click={() => switchPage(currentPage + 1)}
				>
					下一页
				</button>
			</div>
		{/if}
	{/if}
</div>

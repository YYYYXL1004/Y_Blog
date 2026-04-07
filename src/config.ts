import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Y. 的博客",
	subtitle: "记录技术、学习与想法",
	lang: "zh_CN",
	themeColor: {
		hue: 205,
		fixed: true,
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [],
};

export const navBarConfig: NavBarConfig = {
	links: [LinkPreset.Home, LinkPreset.Archive, LinkPreset.About],
};

export const profileConfig: ProfileConfig = {
	avatar: "/images/avatar-qingning.jpg",
	name: "Y.",
	bio: "记录技术、学习与想法。",
	links: [],
};

export const homePageConfig = {
	heroImage: "/images/home-hero.png",
	avatar: "/images/avatar-qingning.jpg",
	title: "Y.",
	subtitle: "记录技术、学习与想法",
	label: "yyyyxl.com",
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};

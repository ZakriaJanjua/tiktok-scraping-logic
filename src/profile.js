const cheerio = require("cheerio");
const axios = require("axios");

var data = "";

var config = {
	method: "get",
	url: "https://www.tiktok.com/@jannatmirza",
	headers: {
		"User-Agent":
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36",
	},
	data: data,
};

async function getProfileData() {
	try {
		let response = await axios(config);
		const $ = cheerio.load(response.data);

		const displayPicture = $(".tiktok-1zpj2q-ImgAvatar.e1e9er4e1").attr(
			"src"
		);
		const userTitle = $("[data-e2e=user-title]").text();
		const userSubtitle = $("[data-e2e=user-subtitle]").text();

		const following = $("[data-e2e=following-count]").text();
		const followers = $("[data-e2e=followers-count]").text();
		const likes = $("[data-e2e=likes-count]").text();

		const userBio = $("[data-e2e=user-bio]").text();
		const userSocial = $("[data-e2e=user-link]").attr("href");

		const userVideos = $("[data-e2e=user-post-item-list]");

		let videos = [];
		let desc = [];
		let videoList = {};

		const videoDesc = $(".tiktok-1itcwxg-ImgPoster.e1yey0rl1");
		for (let i = 0; i < videoDesc.length; i++) {
			if (videoDesc[i].attribs.alt === "") {
				desc.push("");
			} else {
				if (
					videoDesc[i].attribs.alt !== videoDesc[i + 1]?.attribs?.alt
				) {
					desc.push(videoDesc[i].attribs.alt);
				} else if (
					videoDesc[i].attribs.alt === videoDesc[i + 1]?.attribs?.alt
				) {
					desc.push(videoDesc[i].attribs.alt);
					i++;
				}
			}
		}

		userVideos.find("div > div > div > div > div > a").each((_, item) => {
			videos.push($(item).attr("href"));
		});

		for (let i = 0; i < videos.length; i++) {
			videoList[i] = {
				videoLink: videos[i],
				videoDescription: desc[i],
			};
		}

		let result = {
			displayPictureUrl: displayPicture,
			userTitle,
			userSubtitle,
			followers,
			following,
			likes,
			userBio,
			userSocial: userSocial !== undefined ? userSocial : "N/A",
			previewVideos: videoList,
		};
		console.log(result);
	} catch (err) {
		console.error(err);
	}
}

getProfileData();

const cheerio = require("cheerio");
const axios = require("axios");



exports.handler = async (event, context) => {
    let data = "";

    let config = {
	method: "get",
	url: `https://www.tiktok.com/${event.toker}`,
	headers: {
		Cookie: event.cookie,
		"User-Agent":
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36"
	},
	data: data
};
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
		//Still in progress
		userVideos
			.find("div > div > div > div > div > a")
			.each((index, item) => {
				videos.push($(item).attr("href"));
			});
		userVideos.find("div > div > div > div > a").each((index, item) => {
			if ($(item).attr("title") !== undefined) {
				desc.push($(item).attr("title"));
			}
		});
		for (let i = 0; i < videos.length; i++) {
			videoList[i] = { videoLink: videos[i], videoDescription: desc[i] };
		}
		
		let result = {
			displayPictureUrl: displayPicture,
			userTitle,
			userSubtitle,
			followers,
			following,
			likes,
			userBio,
			userSocial: userSocial !== undefined ? userSocial : 'N/A',
			previewVideos: videoList
		}
		return result
	} catch (err) {
		console.error(err);
	}

}
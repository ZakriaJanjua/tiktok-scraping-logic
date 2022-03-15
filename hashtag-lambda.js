const cheerio = require("cheerio");
const axios = require("axios");



exports.handler = async (event, context) => {
    let data = "";

    let config = {
	method: "get",
	url: `https://www.tiktok.com/tag/${event.toker}`,
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

		const title = $("[data-e2e=challenge-title]").text();
		const views = $("[data-e2e=challenge-vvcount]").text();

		const videos = $("[data-e2e=challenge-item-list]");

		let tempLinkAndAuth = [];
		let tempDes = [];
		let videoDes = [];
		let videosLink = [];
		let videoAuthor = [];
		let videoList = {};

		videos
			.find("div > div > div > div > div > div > div > a")
			.each((index, item) => {
				tempLinkAndAuth.push($(item).attr("href"));
			});

		videos.find("div > div > div > a").each((index, item) => {
			if ($(item).attr("title") !== undefined) {
				tempDes.push($(item).attr("title"));
			}
		});

		videosLink = tempLinkAndAuth.filter((_, index) => index % 3 === 0);

		videoAuthor = tempLinkAndAuth.filter(
			(_, index) => index % 2 === 0 && index % 3 !== 0
		);

		videoDes = tempDes.filter((_, index) => (index + 1) % 3 === 0);

		for (let i = 0; i < videosLink.length; i++) {
			videoList[i] = {
				videoLink: videosLink[i],
				videoAuthor: videoAuthor[i],
				videoDescription: videoDes[i],
			};
		}

		let result = {
            tagTitle: title,
            tagViews: views,
            previewVideos: videoList
        }
        return result
	} catch (err) {
		console.error(err);
	}

}
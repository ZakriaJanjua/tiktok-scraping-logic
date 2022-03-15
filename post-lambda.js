const cheerio = require("cheerio");
const axios = require("axios");

// LAMBDA FUNCTION TEST FOR POSTS  
exports.handler = async (event, context) => {
	let data = "";

	let config = {
		method: "get",
		url: `https://www.tiktok.com/${event.toker}/video/${event.id}`,
		headers: {
			Cookie: event.cookie,
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36",
		},
		data: data,
	};
	try {
		let response = await axios(config);
		const $ = cheerio.load(response.data);

		const authorImage = $(".avatar-anchor");
		const imgSrc = authorImage.find("img").attr("src");
		const profileIdTag = authorImage.attr("href");

		const authorDetails = $(".tiktok-12dba99-StyledAuthorAnchor.e10yw27c1");
		const profileIdName = authorDetails.find("h3").text();
		const profileNickName = authorDetails.find("h4").text();

		const postDes = $(".tiktok-1ejylhp-DivContainer.e11995xo0").text();

		const music = $(".tiktok-9y3z7x-H4Link.e1wg6xq70").find("a");
		const musicLink = music.attr("href");
		const musicText = music.text();

		const video = $(".tiktok-yf3ohr-DivContainer.e1yey0rl0");
		const videoCaptionImage = video.children("img").attr("src");

		//NEED TO FIND A WAY TO SCRAPE VIDEO LINK
		/* const videoLink = video.html() */

		const likes = $("[data-e2e=like-count]").text();
		const comments = $("[data-e2e=comment-count]").text();
		const shares = $("[data-e2e=share-count]").text();

		const result = {
			authorImage: {
				imageUrl: imgSrc,
				authorId: "https://www.tiktok.com" + profileIdTag,
			},
			authorDetails: {
				authorName: profileIdName,
				authorNickName: profileNickName,
			},
			postDetails: {
				musicLink: "https://www.tiktok.com" + musicLink,
				musicText,
				videoLink: "",
				videoCaptionImageLink: videoCaptionImage,
				likes,
				comments,
				shares,
			},
		};
		return result;
	} catch (err) {
		return err;
	}
};

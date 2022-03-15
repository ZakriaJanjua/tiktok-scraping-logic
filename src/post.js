import cheerio from "cheerio";
import fetch from "node-fetch";

const cookie =
	"passport_csrf_token=20083c06e4bf7df03e7e92233f27d7d8; passport_csrf_token_default=20083c06e4bf7df03e7e92233f27d7d8; passport_auth_status=800c4a87adfe5007b130c78aa4c5f618%2C22bb3fd6e59b9037e242187974688788; passport_auth_status_ss=800c4a87adfe5007b130c78aa4c5f618%2C22bb3fd6e59b9037e242187974688788; odin_tt=680e1c13f39c70dd46b3ae972ff1664a41ac49cba38833a65bdf8b7f62d172f02b2341270d9d3bb044e8c2a42c597d92b286a6d1054044e189c054d2251f757b1602924feac92f439bd3675044d608f4; msToken=rqFw6D1u9h0NfC3q5BDA35P4IE1jZbiN_pkjCkzD5KByui6-FX7nPwUit43wn6UGFSEba7RSxuYynlAfpjrYbdY0uOUuWUs49ZmK9dCEAGaUgs5fL2UX1nrt6jsk5DRNfhpEncI=; tt_csrf_token=eBG5fFFj9fDlm0mtc4jrZDKw; _abck=F6552DFC487A454B212F3C045D446549~-1~YAAQBHEyZecoAw1/AQAAcICzKgegiv0XTcf3jiPSy5AjwPIU3sPjokfytzL9RUSL5scVN6TqSS1RczPYmW9Yj8U/HvgMXe/s/m0tu3/334xoQ/sKfGHeVX6nAHfB8CDapXPJo5GwqBVeY9SLEws0G2Gz8w0jEDQXlxL9v4FgEVKem4b0mKl6WmOR4P1mcLwMI+6gbNDiKGyefS2A1xuGEjwo1QEQTsWXbNSGedt5thfiPdABUipsfGl+xsbUhoO3bVOQf25sCESXxB4UiCfNxIhoAmH+mGjFk2zNqbVsCt/b9cgQ5uLDsGK69dBOlLv0h8iMN+hW2RdrS7upf0Q1UGF4ZvbCTnTVNutyZf3Ou0ZGLFvwEWFTRHLjYvP1SbQRjbyWVrekrXJ0yA==~-1~-1~-1; ak_bmsc=A4415925CD471BC0226F9195FA6490CE~000000000000000000000000000000~YAAQBHEyZegoAw1/AQAAcICzKg7bVbyyku+P2TgznXpGyPEHgSt2K2kAdkr8ugKpB0nNf2gkTYugW9BK1uy/xO5Wera3MiNQ1A2x/k2uhxzMkc9OHI2y0bFU8v9CP+QB9Wleeg/rMgRZyOjPt7cNyMKbXf5biYD05jflUQivfD9+2U90ubRo+yiAEqfGOsCgYLYKqCBh5ZfIIJ+wFk50rtSR3NaCEaPuzOZZV0EZ25JiJ7B2X2Cm4jotkGbTvAW9VHLLNI9KkFBP9azLRpQPlccSnc8SRzJxolaKlAXyRdnO5+wiKoMeVcoHWDLg5/vJgNEAwzrEatoh7SR2mbih3mLteKQdeQReK0vGXm+Hcf3sQzw+rN9CBsXej2mLIMgzb1qMAECOg58C1Q==; bm_sz=82764130E89E7E6A556F88C848ADA1C1~YAAQBHEyZekoAw1/AQAAcICzKg5zdb12p+xqAmU8WMkTkYbyhWXA02Q5qXZLUABU2Mgss82mXptvKY8gYHJ+pOBi6vuVDAWE+eOsVvZdOcCzFG5KQVl9OGlRKwV92vX+TFDkOJzR+uxlXTZG74q3hVwgsamFEbGY/vZWhaWlEZZxXpRk0A5ZGU4qEx12X//dNNezNMyoLRaQmUxHst6W2rzw/ta//E5OpKNCxoaTyqabe6O28xPL3voBGi/Bx++9r6ekrfDA5dRR/IjBwNn4Wg6WRJ5a5xPoJotkG/gEiDLdyzE=~4273720~3421253; bm_mi=60AE4F361753A201B2E8EAC5271CD7D7~PWC/tlLqFdrOFyeqW2YnkIqIQTvwOLTqAZgwUjs4p1FrzziJhRx7zwOBCIlCc0PUwBH+aR2pKhqbR+btpI9zWLESQdGZeP8tQq1jHyBww74XTUnV+v+xxce8aESpbJPzm8eb0lQkZYxTaJe1M3QhFU1854SCFsp3mHuEyEs493IZRyXSHLiTeWx1d7s7LZcnKzQs14L5uWGRfTd9LQlKZIDOa7VqD2F3BUq9lNUsJ7c=; ttwid=1%7CK7_OKLOFJmUpwaGxdZ8HEPXwvL2kA0Upw7Cg5oc6B0U%7C1645688883%7C1c8c6bbfe82bbce8563a3193d25bea4fa46870d134915742b1a1a103464ef262; bm_sv=40699A918F6148781FBEE07D87B24E6B~cbduTv5apRq5LBLzbfd6Mvdmxdw7yG5I7g83l80yKuUFsN2IMdfv9NMjJHm3P/P0IjaQTg2tY5fQDtu6NcM4+3wUUi+7PFpiKYzQRxEDaYAwNgBuivp5+l3LRiQdHUONpVe9As9AR+PlK2UDDUr93BQJrnfpJkaIMSQGLRwPnkc=; msToken=0tdQ7CUcvZtDfSJ8tTWGTdVkgMRLPm9TQROWj9STf9GbsXgPK8qYJMb9tUZZZqBGpohvGTlFdJGL_cvIYNH56LoKrS42HwtztZvtcxJQCBi_QFnJ9R0get459ZWnPtVTuuAbcgpnW8eSUKs=";

function fetchWithTimeout(msecs, promise) {
	const timeout = new Promise((resolve, reject) => {
		setTimeout(() => {
			reject(
				new Error(
					"Timed out in " +
						msecs +
						" msecs. Check your cookie or network."
				)
			);
		}, msecs);
	});
	return Promise.race([timeout, promise]);
}

async function getPostData({ postId }, cookie) {
	try {
		const fetchResponse = await fetchWithTimeout(
			5000,
			fetch(`https://www.tiktok.com/@tiktoker/video/${postId}`, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36",
					Cookie: cookie,
				},
			})
		);
		const fetchData = await fetchResponse.text();

		const $ = cheerio.load(fetchData);

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
				postDescription: postDes,
				musicLink: "https://www.tiktok.com" + musicLink,
				musicText,
				videoLink: "",
				videoCaptionImageLink: videoCaptionImage,
				likes,
				comments,
				shares,
			},
		};
		console.log(result);
		return result;
	} catch (err) {
		console.error(err);
		return err;
	}
}

getPostData({ postId: "7064808680054623514" }, cookie);

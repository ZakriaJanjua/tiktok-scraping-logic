const { HttpsProxyAgent } = require('https-proxy-agent');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const originalEmitWarning = process.emitWarning;

let suppressed = false;

/**
 * Don't emit the NODE_TLS_REJECT_UNAUTHORIZED warning while
 * we work on proper SSL verification.
 * https://github.com/cypress-io/cypress/issues/5248
 */
function suppress() {
	if (suppressed) {
		return;
	}

	suppressed = true;

	process.emitWarning = (warning, ...args) => {
		if (
			typeof warning === 'string' &&
			warning.includes('NODE_TLS_REJECT_UNAUTHORIZED')
		) {
			// node will only emit the warning once
			// https://github.com/nodejs/node/blob/82f89ec8c1554964f5029fab1cf0f4fad1fa55a8/lib/_tls_wrap.js#L1378-L1384
			process.emitWarning = originalEmitWarning;

			return;
		}

		return originalEmitWarning.call(process, warning, ...args);
	};
}

function fetchWithTimeout(msecs, promise) {
	const timeout = new Promise((resolve, reject) => {
		setTimeout(() => {
			reject(
				new Error(
					`Timed out in ${
						msecs / 1000
					} seconds. Check your Cookie or network connection.`
				)
			);
		}, msecs);
	});
	return Promise.race([timeout, promise]);
}

function createError(statusCode, message, stack) {
	return {
		statusCode,
		data: { errorMessage: message, message, stack },
	};
}

exports.handler = async (event, context) => {
	console.log('POST FUNCTION');
	// read cookies from env
	// Suppress nodejs tls issues due to proxy ssl issues
	suppress();

	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
	if (!event.postId) {
		throw createError(400, 'Missing postId');
	}
	if (!event.cookie_tiktok) {
		throw createError(400, 'Missing Cookie');
	}
	try {
		const brightConfig = (process.env.BRIGHT_DATA_CREDENTIALS || '').split(':');
		const brightCredentials = {
			user: brightConfig[0],
			password: brightConfig[1],
		};
		const proxy = `https://${brightCredentials.user}-country-de:${brightCredentials.password}@zproxy.lum-superproxy.io:22225`;
		console.log(proxy);
		const fetchResponse = await fetchWithTimeout(
			10000,
			fetch(`https://www.tiktok.com/@tiktoker/video/${event.postId}`, {
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36',
					Cookie: event.cookie_tiktok,
					Connection: 'keep-alive',
					Accept: '*/*',
					'Accept-Encoding': 'gzip, deflate, br',
				},
				agent: new HttpsProxyAgent(proxy),
			})
		);
		const fetchData = await fetchResponse.text();

		const $ = cheerio.load(fetchData);

		const authorImage = $('.avatar-anchor');
		const imgSrc = authorImage.find('img').attr('src');
		const profileIdTag = authorImage.attr('href');

		const authorDetails = $('.tiktok-12dba99-StyledAuthorAnchor.e10yw27c1');
		const profileIdName = authorDetails.find('h3').text();
		const profileNickName = authorDetails.find('h4').text();

		const postDes = $('.tiktok-1ejylhp-DivContainer.e11995xo0').text();

		const music = $('.tiktok-9y3z7x-H4Link.e1wg6xq70').find('a');
		const musicLink = music.attr('href');
		const musicText = music.text();

		const video = $('.tiktok-yf3ohr-DivContainer.e1yey0rl0');
		const videoCaptionImage = video.children('img').attr('src');

		// NEED TO FIND A WAY TO SCRAPE VIDEO LINK
		/* const videoLink = video.html() */

		const likes = $('[data-e2e=like-count]').text();
		const comments = $('[data-e2e=comment-count]').text();
		const shares = $('[data-e2e=share-count]').text();

		const result = {
			authorImage: {
				imageUrl: imgSrc,
				authorId: 'https://www.tiktok.com' + profileIdTag,
			},
			authorDetails: {
				authorName: profileIdName,
				authorNickName: profileNickName,
			},
			postDetails: {
				postDescripton: postDes,
				musicLink: 'https://www.tiktok.com' + musicLink,
				musicText,
				videoLink: '',
				videoCaptionImageLink: videoCaptionImage,
				likes,
				comments,
				shares,
			},
		};
		return {
			statusCode: fetchResponse.status,
			data: result,
		};
	} catch (err) {
		throw createError(err.response.status, err.message, err.stack);
	}
};

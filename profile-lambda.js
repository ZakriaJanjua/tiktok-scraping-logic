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
	console.log('PROFILE FUNCTION');
	// read cookies from env
	// Suppress nodejs tls issues due to proxy ssl issues
	suppress();

	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
	if (!event.username) {
		throw createError(400, 'Missing username');
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
			5000,
			fetch(`https://www.tiktok.com/@${event.username}`, {
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36',
				},
				agent: new HttpsProxyAgent(proxy),
			})
		);
		const fetchData = await fetchResponse.text();

		const $ = cheerio.load(fetchData);

		const displayPicture = $('.tiktok-1zpj2q-ImgAvatar.e1e9er4e1').attr('src');
		const userTitle = $('[data-e2e=user-title]').text();
		const userSubtitle = $('[data-e2e=user-subtitle]').text();

		const following = $('[data-e2e=following-count]').text();
		const followers = $('[data-e2e=followers-count]').text();
		const likes = $('[data-e2e=likes-count]').text();

		const userBio = $('[data-e2e=user-bio]').text();
		const userSocial = $('[data-e2e=user-link]').attr('href');

		const image = $('.tiktok-1itcwxg-ImgPoster.e1yey0rl1');
		const videos = $('.tiktok-yz6ijl-DivWrapper.e1u9v4ua1');

		let videoList = {};

		for (let i = 0; i < videos.length; i++) {
			videoList[i] = {
				videoLink: videos[i].children[0].attribs.href,
				videoDescription: image[i].attribs.alt,
				videoCaptionImage: image[i].attribs.src,
			};
		}

		const result = {
			displayPictureUrl: displayPicture,
			userTitle,
			userSubtitle,
			followers,
			following,
			likes,
			userBio,

			// not every profile provides social media links
			userSocial: userSocial !== undefined ? userSocial : 'N/A',

			previewVideos: videoList,
		};

		return {
			statusCode: fetchResponse.status,
			data: result,
		};
	} catch (err) {
		throw createError(err.response.status, err.message, err.stack);
	}
};

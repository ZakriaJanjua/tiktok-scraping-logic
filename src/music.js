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

async function getTiktokMusic(musicId) {
	suppress();

	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

	if (!musicId) {
		throw createError(400, 'Music ID is required');
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
			fetch(`https://www.tiktok.com/music/original-sound-${musicId}`, {
				headers: {
					'User-Agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36',
				},
				agent: new HttpsProxyAgent(proxy),
			})
		);
		const response = await fetchResponse.text();
		const $ = cheerio.load(response);
		let videos = {};

		const musicTitle = $('[data-e2e=music-title]').text();

		const musicCreator = $('[data-e2e=music-creator]');
		const creatorProfile =
			musicCreator[0].children[0].attribs['href'].split('/')[1];

		const creatorName = musicCreator.text();

		const musicVideoCount = $('[data-e2e=music-video-count]').text();

		const videoLinks = $('.tiktok-yz6ijl-DivWrapper.e1u9v4ua1');
		const videoDescription = $('.tiktok-1itcwxg-ImgPoster.e1yey0rl1');

		for (let i = 0; i < videoLinks.length; i++) {
			const videoLink = videoLinks[i].children[0].attribs['href'];
			const videoDesc = videoDescription[i].attribs['alt'];
			const videoCaptionImage = videoDescription[i].attribs['src'];
			videos[i] = {
				videoLink,
				videoDesc,
				videoCaptionImage,
			};
		}
		const result = {
			musicTitle,
			creatorName,
			creatorProfile,
			creatorName,
			musicVideoCount,
			videos,
		};
		console.log(result);
		return result;
	} catch (err) {
		throw new Error(err);
	}
}

getTiktokMusic('6988529397800258331');

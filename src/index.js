const fs = require('fs');
const R = require('ramda');
const url = require('url');
const $ = require('cheerio');
const axios = require('axios');
const request = require('request');

const entery = 'http://www.baidu.com';

// run(entery);

run2();

async function run2() {
	const result = await getLoader(entery);
	console.log(result);
}

async function getLoader(src) {
	const urlObj = url.parse(src);
	const base = `${urlObj.protocol}//${urlObj.host}`;

	return await R.pipeP(
		load,
		parseUrl1,
		R.map(
			R.pipe(
				R.partial(url.resolve, [base]),
				R.pipeP(
					load,
					parseUrl2,
					R.map(
						loadImage,
					),
				),
			)
		),
	)(src);
}

async function run(src) {
	const urlObj = url.parse(src);
	const base = `${urlObj.protocol}//${urlObj.host}`;

	const content = await load(src);
	const urls = parseUrl1(content);

	const content2 = await load(url.resolve(base, urls[0]));
	const urls2 = parseUrl2(content2);

	const imgSrc = urls2[0];
	loadImage(imgSrc);
}

function loadImage(imgSrc) {
	const fileName = 'imgs/' + imgSrc.replace(/[-.:\/]+/g, '_').replace(/_([^_]*?)$/, '.$1');
	fs.exists(fileName, exists => {
		if (!exists) {
			request(imgSrc).pipe(fs.createWriteStream(fileName));
		}
	});
}

function parseUrl2(content) {
	return $('div.contentList>div.content>p>img', content)
		.map((i, a) => $(a).attr('src'))
		.get();
}
function parseUrl1(content) {
	return $('div.classList>ul>li>a', content)
		.map((i, a) => $(a).attr('href'))
		.get();
}

async function load(url) {
	const { data: content } = await axios.get(url);
	return content;
}


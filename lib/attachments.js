const Promise = require('bluebird');

const fs = require('fs');
Promise.promisifyAll(fs);

const mkdirp = require('mkdirp');
Promise.promisifyAll(mkdirp);

const url = require('url');
const path = require('path');
const last = require('lodash/last');

const performRequest = require('./api');

function extractIdFromUrl(fullUrl) {
	if (!fullUrl) {
		return;
	}

	const path = url.parse(fullUrl).pathname.split('/');

	return last(path);
}

function downloadAttachment(attachment) {
	return performRequest(attachment.url, {
		responseType: 'arraybuffer'
	}).then(res => res.data);
}

module.exports = function downloadAttachmentsForMessage(message, basePath) {
	if (!message.attachments || !message.attachments.length) {
		return Promise.resolve(message);
	}

	const messageId = extractIdFromUrl(message.url);

	if (!messageId) {
		return Promise.resolve(message);
	}

	const dir = path.join(basePath || '', messageId);

	return mkdirp.mkdirpAsync(dir).then(() => {
		return Promise.all(
			message.attachments.map(a => {
				return downloadAttachment(a)
					.then(data => {
						return fs.writeFileAsync(path.join(dir, a.name), data);
					})
			})
		);
	});
};

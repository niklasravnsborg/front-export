const Promise = require('bluebird');

const fs = require('fs');
Promise.promisifyAll(fs);

const mkdirp = require('mkdirp');
Promise.promisifyAll(mkdirp);

const path = require('path');

const performRequest = require('./api');

function downloadAttachment(attachment) {
	return performRequest(attachment.url, {
		responseType: 'arraybuffer'
	}).then(res => res.data);
}

module.exports = function downloadAttachmentsForMessage(message, basePath) {
	if (!message.attachments || !message.attachments.length) {
		return Promise.resolve(message);
	}

	const messageId = message.id;

	// directory in which the attachments are downloaded into
	const attachmentDir = path.join(basePath || '', messageId);

	return mkdirp.mkdirpAsync(attachmentDir).then(() => {
		return Promise.all(
			message.attachments.map(a => {
				return downloadAttachment(a)
					.then(data => {
						const attachmentPath = path.join(attachmentDir, a.filename);
						return fs.writeFileAsync(attachmentPath, data);
					})
			})
		);
	});
};

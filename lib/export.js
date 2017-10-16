const Promise = require('bluebird');

const fs = require('fs');
Promise.promisifyAll(fs);

const mkdirp = require('mkdirp');
Promise.promisifyAll(mkdirp);

const nodemailer = require('nodemailer');
const path = require('path');

const emlTransporter = nodemailer.createTransport({
	streamTransport: true,
	newline: 'unix',
	buffer: true
});

/**
 * Converts a message object from the Front API V2
 * to a message object for Nodemailer.
 * Requires that a subject is set on the Front message.
 *
 * @param  {Object} message Front message object with subject set
 * @return {Object} Nodemailer message
 */
function parseMailerMessage(message, basePath) {
	const to = message.recipients.find(r =>
		r.role == 'to'
	).handle;

	const from = message.recipients.find(r =>
		r.role == 'from'
	).handle;

	const subject = message.subject;
	const text = message.text;
	const html = message.body;

	// attach the downloaded attachments
	const attachments = [];
	message.attachments.forEach((attachment) => {
		const attachmentPath = path.join(basePath, `${message.id}/${attachment.filename}`);
		attachments.push({ path: attachmentPath });
	});

	return {
		from, to, subject, text, html, attachments
	};
}

/**
 * Exports a given Front message to eml.
 *
 * @param  {Object} message
 */
module.exports = function exportMessage(message, basePath) {

	mailerMessage = parseMailerMessage(message, basePath);

	// this generates the standard RFC822 email
	emlTransporter.sendMail(mailerMessage, (err, info) => {

		const id = info.messageId;
		const eml = info.message.toString();
		const exportTo = path.join(basePath, 'export');

		mkdirp.mkdirpAsync(exportTo).then(() => {
			fs.writeFileAsync(path.join(exportTo, `${id}.eml`), eml);
		});

	});

};

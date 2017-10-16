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

function getRecipients(message, role) {
	recipients = message.recipients.find(r =>
		r.role == role
	);

	// handle refers to the email of the recipient
	return recipients ? recipients.handle : '';
}

/**
 * Converts a message object from the Front API V2
 * to a message object for Nodemailer.
 * Requires that a subject is set on the Front message.
 *
 * @param  {Object} message Front message object with subject set
 * @param  {String} attachmentsPath Folder in which attachments for this message are stored
 * @return {Object} Nodemailer message
 */
function parseMailerMessage(message, attachmentsPath) {
	const to = getRecipients(message, 'to');
	const from = getRecipients(message, 'from');
	const subject = message.subject;
	const text = message.text;
	const html = message.body;
	const date = new Date(message.created_at * 1000);

	// attach the downloaded attachments
	const attachments = [];
	message.attachments.forEach((attachment) => {
		const attachmentPath = path.join(attachmentsPath, attachment.filename);
		attachments.push({ path: attachmentPath });
	});

	return {
		from, to, subject, text, html, date, attachments
	};
}

/**
 * Exports a given Front message to eml.
 *
 * @param  {Object} message
 */
module.exports = function exportMessage(message, basePath) {

	const attachmentPath = path.join(basePath, message.id);
	mailerMessage = parseMailerMessage(message, attachmentPath);

	// put the message either in the sent/ or recieved/ -folder
	const exportPath = path.join(basePath, message.direction);

	// this generates the standard RFC822 email
	emlTransporter.sendMail(mailerMessage, (err, info) => {

		const id = info.messageId;
		const eml = info.message.toString();

		mkdirp.mkdirpAsync(exportPath).then(() => {
			fs.writeFileAsync(path.join(exportPath, `${id}.eml`), eml);
		});

	});

};

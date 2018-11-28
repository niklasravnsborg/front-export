const Promise = require('bluebird');

const fs = require('fs');
Promise.promisifyAll(fs);

const mkdirp = require('mkdirp');
Promise.promisifyAll(mkdirp);

const path = require('path');

const getConversationsForInbox = require('./conversations');
const getMessagesForConversation = require('./messages');
const downloadAttachmentsForMessage = require('./attachments');
const exportMessage = require('./export');
const performRequest = require('./api');

const limit = require('promise-limit')(1);

/**
 * Will export all conversations for a given inbox and download all attachments.
 *
 * Will create `conversations.json` in the given base directory and will create
 * a directory for every message containing its attachments.
 *
 * @param  {String} inboxId
 * @param  {String} inboxName
 * @return {Promise}
 */
module.exports = function exportInbox(inboxId, inboxName) {

	const basePath = inboxName;

	// Retrieve all conversations
	return getConversationsForInbox(inboxId)
		.then(conversations =>
			Promise.all(conversations.map(conversation =>
				// Enrich messages in conversations
				limit(_ => getMessagesForConversation(conversation).then(messages => {

					// Save subject and message direction for later use
					messages.map(message => {
						message.subject = conversation.subject;

						const from = message.recipients.find(r =>
							r.role == 'from'
						).handle;

						// save weather the message was sent or received
						// from this inbox
						message.direction = from === inboxName ? 'sent' : 'received';

						return message;
					});

					conversation.messages = messages;
					return conversation;
				}))
			))
		)
		.then(conversations =>
			// Create the base directory if it doesn't exist yet
			mkdirp.mkdirpAsync(basePath)
				.then(() =>
					// Write the `conversations.json` file to it
					fs.writeFileAsync(path.join(basePath, 'conversations.json'), JSON.stringify(conversations, null, 2))
				)
				.then(() => conversations)
		)
		.then(conversations =>
			Promise.all(conversations.map(c => c.messages)
				.map(messages =>
					Promise.all(
						messages.map(m =>
							downloadAttachmentsForMessage(m, basePath)
						)
					)
				)
			).then(() => conversations)
		)
		.then(conversations => {

			// flatten conversations to array with all messages
			const converstationArrays = conversations.map(c => c.messages)
			const messages = [].concat(...converstationArrays);

			messages.forEach(message => {
				exportMessage(message, basePath);
			});

		});
};

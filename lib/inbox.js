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

/**
 * Will export all conversations for a given inbox and download all attachments.
 *
 * Will create `conversations.json` in the given base directory and will create
 * a directory for every message containing its attachments.
 *
 * @param  {String} inboxId
 * @param  {String} basePath
 * @return {Promise}
 */
module.exports = function exportInbox(inboxId, basePath) {
	// Retrieve all conversations
	return getConversationsForInbox(inboxId)
		.then(conversations =>
			Promise.all(conversations.map(conversation =>
				// Enrich messages in conversations
				getMessagesForConversation(conversation).then(messages => {

					// Save subject into message for later use
					messages.map(message => {
						message.subject = conversation.subject;
						return message;
					});

					conversation.messages = messages;
					return conversation;
				})
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

const Promise = require('bluebird');

const performRequest = require('./api');

/**
 * Retrieves all data for a given message.
 * http://docs.frontapp.com/docs/get-message
 *
 * @param  {Object} message
 * @return {Promise}
 */
function getMessage(message) {
	if (!message.url) {
		return Promise.resolve(message);
	}

	return performRequest(message.url).then(res => res.data);
}

/**
 * Retrieves all messages for a given conversation.
 *
 * @param  {Object} conversation
 * @return {Promise}
 */
module.exports = function getMessagesForConversation(conversation) {
	if (!conversation.messages) {
		return Promise.resolve(conversation);
	}

	return Promise.all(conversation.messages.map(getMessage));
};

const Promise = require('bluebird');

const performRequest = require('./api');

/**
 * Retrieves all messages for a given conversation.
 * https://dev.frontapp.com/#get-message
 *
 * @param  {Object} conversation
 * @return {Promise}
 */
module.exports = function getMessagesForConversation(conversation) {

	// FIXME: This only handles up to 100 messages per conversation
	console.log('Downloading messages for conversation ' + conversation.id)
	const messagesRequest = performRequest(`/conversations/${conversation.id}/messages`);
	const messages = messagesRequest.then(res => res.data._results);

	return messages;

};

'use strict';

const Promise = require('bluebird');

const performRequest = require('./api');

/**
 * Retrieves all data for a given conversation.
 * http://docs.frontapp.com/docs/get-conversation
 *
 * Please note that the messages are paginated. We set the default pageSize to
 * 1000 (maximum allowed). If you have conversations with more than 1000 messages,
 * you need to adapt this script for message pagination.
 *
 * This endpoint doesn't have a `pages` object with pagination information, so
 * you'd have to figure it out yourself by checking the length of the `messages`
 * array and making additional requests (with the `page=n` param) if necessary.
 *
 * @param  {Object} conversation
 * @return {Promise}
 */
function getConversation(conversation) {
	return performRequest(conversation.url).then(res => res.data);
}

/**
 * Retrieves all conversations for a given inbox.
 * http://docs.frontapp.com/docs/inbox-conversations
 *
 * @param  {String} inboxId
 * @return {Promise}
 */
module.exports = function getConversationsForInbox(inboxId) {
	// http://docs.frontapp.com/v1.0/docs/pagination
	const url = `/inboxes/${inboxId}/conversations/all`;

	let conversations = [];

	function handleResponse(res) {
		if (res.data.conversations) {
			conversations = conversations.concat(res.data.conversations);
		}
		if (res.data.pages.next_url) {
			return performRequest(res.data.pages.next_url).then(handleResponse);
		}
	}

	return performRequest(url)
		.then(handleResponse)
		.then(() => conversations)
		.then(conversations => Promise.all(conversations.map(getConversation)));
};

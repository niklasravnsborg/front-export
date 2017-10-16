'use strict';

const Promise = require('bluebird');

const performRequest = require('./api');

/**
 * Retrieves all data for a given conversation.
 * http://docs.frontapp.com/docs/get-conversation
 *
 * Please note that the messages are paginated. We set the default pageSize to
 * 100 (maximum allowed). If you have conversations with more than 100 messages,
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
	return performRequest(conversation._links.self).then(res => res.data);
}

/**
 * Retrieves all conversations for a given inbox.
 * https://dev.frontapp.com/#list-inbox-conversations
 *
 * @param  {String} inboxId
 * @return {Promise}
 */
module.exports = function getConversationsForInbox(inboxId) {
	const url = `/inboxes/${inboxId}/conversations`;

	let conversations = [];

	function handleResponse(res) {
		if (res.data._results) {
			conversations = conversations.concat(res.data._results);
		}
		if (res.data._pagination.next) {
			return performRequest(res.data._pagination.next).then(handleResponse);
		}
	}

	return performRequest(url)
		.then(handleResponse)
		.then(() => conversations)
		.then(conversations => Promise.all(conversations.map(getConversation)));
};

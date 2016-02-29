'use strict';

const Promise = require('bluebird');
const exportInbox = require('./lib/inbox');

const inboxId = process.env.FRONT_INBOX_ID || '';
const basePath = inboxId || '';

new Promise((resolve, reject) => {
	if (!inboxId) {
		reject(new Error('No FRONT_INBOX_ID found.'));
	}
	resolve(inboxId);
})
.then(inboxId => exportInbox(inboxId, basePath))
.catch(err => console.error(err.stack ? err.stack : err));

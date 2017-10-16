#!/usr/bin/env node
'use strict';

// Load .env for later use in lib/api.js
require('dotenv').config();

const api = require('../lib/api');
const exportInbox = require('../lib/inbox');
const performRequest = require('../lib/api');
const Promise = require('bluebird');

const argv = require('yargs')
	.usage('Usage: $0 [options] <inbox-id>')
	.demand(1)
	.help('help')
	.argv;

const inboxName = argv._[0];

function getInboxId(inboxName) {
	return performRequest('inboxes').then(res => res.data)
		.then(inboxes => {
			const inbox = inboxes._results.find(inbox =>
				inbox.send_as === inboxName ? inbox : ''
			);

			const inboxId = inbox ? inbox.id : '';
			return inboxId;
		});
}

new Promise((resolve, reject) => {
	if (!inboxName) {
		reject(new Error('Provide an inbox name e.g. hello@mymail.com.'));
	}

	getInboxId(inboxName).then(inboxId => {
		if (!inboxId) {
			reject(new Error('No Front inbox with this address was found.'));
		}
		resolve(inboxId);
	});
})
.then(inboxId => exportInbox(inboxId, inboxName))
.catch(err => console.error(err.stack ? err.stack : err));

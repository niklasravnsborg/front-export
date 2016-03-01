#!/usr/bin/env node
'use strict';

const Promise = require('bluebird');
const exportInbox = require('../lib/inbox');

const argv = require('yargs')
	.usage('Usage: $0 [options] <inbox-id>')
	.demand(1)
	.help('help')
	.argv;

const inboxId = argv._[0];
const basePath = inboxId || '';

new Promise((resolve, reject) => {
	if (!inboxId) {
		reject(new Error('No Front Inbox ID found.'));
	}
	resolve(inboxId);
})
.then(inboxId => exportInbox(inboxId, basePath))
.catch(err => console.error(err.stack ? err.stack : err));

const Promise = require('bluebird');
const axios = require('axios');
const debug = require('debug')('front');
const delay = require('delay');

const FRONT_APP_ID = process.env.FRONT_APP_ID || '';
const FRONT_API_SECRET = process.env.FRONT_API_SECRET || '';

// Log all requests to the console if debug is enabled
axios.interceptors.request.use(config => {
	debug(`Request: ${config.url}`);
	return config;
});

/**
 * Account for API rate limiting.
 * http://docs.frontapp.com/docs/public-api#rate-limiting
 *
 * Will delay based on the Retry-After header and then retry. Unfortunately,
 * this won't cancel any subsequent/parallel requests.
 */
axios.interceptors.response.use(null, err => {
	if (err.status === 429 && err.headers['retry-after']) {
		const ms = err.headers['retry-after'] * 1000;

		debug(`Delaying because of rate limiting: ${err.headers['retry-after']} seconds`);

		return delay(ms).then(() => {
			return axios(err.config);
		});
	}

	throw err;
});

/**
 * Performs a request to the Front API.
 *
 * @param  {String} url Relative or absolute URL. If relative, the base URL will be prepended
 * @return {Promise}
 */
module.exports = function performRequest(url, options) {
	if (!FRONT_APP_ID || !FRONT_API_SECRET) {
		Promise.reject(new Error('No FRONT_APP_ID or FRONT_API_SECRET found'));
	}

	const config = Object.assign({}, {
		// http://docs.frontapp.com/docs/public-api#target
		baseURL: `https://api.frontapp.com/companies/${FRONT_APP_ID}`,
		// http://docs.frontapp.com/docs/public-api#authentication
		auth: {
			username: FRONT_APP_ID,
			password: FRONT_API_SECRET
		},
		params: {
			pageSize: 1000
		}
	}, options);

	return axios
		.get(url, config);
};

const Promise = require('bluebird');
const axios = require('axios');
const debug = require('debug')('front');
const delay = require('delay');

// Log all requests to the console if debug is enabled
axios.interceptors.request.use(config => {
	debug(`Request: ${config.url}`);
	return config;
});

/**
 * Account for API rate limiting.
 * https://dev.frontapp.com/#limitations
 *
 * Will delay based on the Retry-After header and then retry. Unfortunately,
 * this won't cancel any subsequent/parallel requests.
 */
axios.interceptors.response.use(null, err => {

	const response = err.response;

	if (response.status === 429 && response.headers['retry-after']) {
		const ms = response.headers['retry-after'] * 1000;

		console.log(`Delaying because of rate limiting: ${response.headers['retry-after']} seconds`);

		return delay(ms).then(() =>
			axios(response.config)
		);
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

	const FRONT_JSON_WEB_TOKEN = process.env.FRONT_JSON_WEB_TOKEN || '';
	if (!FRONT_JSON_WEB_TOKEN) {
		Promise.reject(new Error('No FRONT_JSON_WEB_TOKEN found'));
	}

	// https://dev.frontapp.com/#authentication
	axios.defaults.headers.common['Authorization'] = `Bearer ${FRONT_JSON_WEB_TOKEN}`;

	const config = Object.assign({}, {
		baseURL: 'https://api2.frontapp.com',
		params: {
			limit: 100
		}
	}, options);

	return axios.get(url, config).catch(e => {
		if (e.response) {
			frontError = e.response.data._error;
			console.log(`The API request failed with a ${frontError.status} ${frontError.title} error.`);
			console.log(frontError.message);
			if (frontError.status === 401) {
				console.log('Process will exit now.');
				process.exit();
			}
		}
	});
};

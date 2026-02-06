const https = require('https');

let maxApi;
try {
	maxApi = require('max-api');
} catch (error) {
	// Mock max-api for testing outside of Max environment
	maxApi = {
		addHandler: (name, callback) => {
			// Expose handler for testing
			if (!module.exports.handlers) module.exports.handlers = {};
			module.exports.handlers[name] = callback;
		},
		outlet: (...args) => console.log('OUTLET:', ...args),
		post: (...args) => console.log('POST:', ...args)
	};
	module.exports.maxApiMock = maxApi;
}

const USER = 'TheCathedralFCCLA';
const REPO = 'OW';
const API_URL = `https://api.github.com/repos/${USER}/${REPO}/contents/`;

const getLatestPDF = () => {
	const options = {
		headers: {
			'User-Agent': 'Node-for-Max-Script'
		}
	};

	https.get(API_URL, options, (res) => {
		let data = '';

		res.on('data', (chunk) => {
			data += chunk;
		});

		res.on('end', () => {
			try {
				if (res.statusCode !== 200) {
					maxApi.post(`Error fetching data: ${res.statusCode} ${res.statusMessage}`);
					return;
				}

				const files = JSON.parse(data);
				// Find the first file ending in .pdf
				const pdfFile = files.find(file => file.name.toLowerCase().endsWith('.pdf'));

				if (pdfFile) {
					// Construct the GitHub Pages URL
					const pdfUrl = `https://${USER}.github.io/${REPO}/${encodeURIComponent(pdfFile.name)}`;
					maxApi.outlet(pdfUrl);
				} else {
					maxApi.post('No PDF found');
				}
			} catch (e) {
				maxApi.post(`Error parsing JSON: ${e.message}`);
			}
		});

	}).on('error', (err) => {
		maxApi.post(`Error making request: ${err.message}`);
	});
};

// Add a handler for the 'bang' message
maxApi.addHandler('bang', () => {
	getLatestPDF();
});

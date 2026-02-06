const https = require('https');

const USER = 'TheCathedralFCCLA';
const REPO = 'OW';
const API_URL = `https://api.github.com/repos/${USER}/${REPO}/contents/`;

const getLatestPDF = () => {
	const options = {
		headers: {
			'User-Agent': 'Node-Script'
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
					console.error(`Error fetching data: ${res.statusCode} ${res.statusMessage}`);
					return;
				}

				const files = JSON.parse(data);
				// Find the first file ending in .pdf
				const pdfFile = files.find(file => file.name.toLowerCase().endsWith('.pdf'));

				if (pdfFile) {
					// Construct the GitHub Pages URL
					const pdfUrl = `https://${USER}.github.io/${REPO}/${encodeURIComponent(pdfFile.name)}`;
					console.log(pdfUrl);
				} else {
					console.error('No PDF found');
				}
			} catch (e) {
				console.error(`Error parsing JSON: ${e.message}`);
			}
		});

	}).on('error', (err) => {
		console.error(`Error making request: ${err.message}`);
	});
};

getLatestPDF();

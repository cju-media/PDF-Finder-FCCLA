const https = require('https');

const USER = 'TheCathedralFCCLA';
const REPO = 'OW';

const getJSON = (url) => {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Node-Script'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Request failed with status ${res.statusCode}: ${res.statusMessage}`));
                } else {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Error parsing JSON: ${e.message}`));
                    }
                }
            });
        }).on('error', (err) => reject(new Error(`Network error: ${err.message}`)));
    });
};

const getLatestPDF = async () => {
    try {
        // 1. Get list of commits
        const commitsUrl = `https://api.github.com/repos/${USER}/${REPO}/commits`;
        const commits = await getJSON(commitsUrl);

        if (!Array.isArray(commits) || commits.length === 0) {
            console.error('No commits found.');
            return;
        }

        // Get the SHA of the latest commit (index 0)
        const latestCommitSha = commits[0].sha;

        // 2. Get contents of the repo at that commit
        const contentsUrl = `https://api.github.com/repos/${USER}/${REPO}/contents/?ref=${latestCommitSha}`;
        const files = await getJSON(contentsUrl);

        // Find the first file ending in .pdf
        const pdfFile = files.find(file => file.name.toLowerCase().endsWith('.pdf'));

        if (pdfFile) {
            // Construct a raw.githubusercontent.com URL for the specific commit
            // Format: https://raw.githubusercontent.com/:user/:repo/:sha/:path
            const pdfUrl = `https://raw.githubusercontent.com/${USER}/${REPO}/${latestCommitSha}/${encodeURIComponent(pdfFile.name)}`;
            console.log(pdfUrl);
        } else {
            console.error('No PDF found in the latest commit.');
        }

    } catch (error) {
        console.error(error.message);
    }
};

getLatestPDF();

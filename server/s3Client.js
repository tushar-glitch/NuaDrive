const { S3Client } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config();

const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const B2_ENDPOINT = process.env.B2_ENDPOINT;

if (!B2_KEY_ID || !B2_APPLICATION_KEY || !B2_ENDPOINT) {
    console.warn('⚠️ Missing Backblaze B2 Credentials in .env');
}

const s3Client = new S3Client({
    region: 'eu-central-003', // Can be inferred or static, B2 is region-specific
    endpoint: B2_ENDPOINT,
    credentials: {
        accessKeyId: B2_KEY_ID,
        secretAccessKey: B2_APPLICATION_KEY,
    },
});

module.exports = s3Client;

/**
 * Change the namespace to the namespace on Pinecone you'd like to store your embeddings.
 */

if (!process.env.S3_BUCKET_NAME) {
  throw new Error('Missing S3 bucket name in .env file');
}
if (!process.env.S3_REGION) {
  throw new Error('Missing S3 Region in .env file');
}
if (!process.env.S3_ACCESS_KEY_ID) {
  throw new Error('Missing S3 Access Key Id in .env file');
}
if (!process.env.S3_SECRET_ACCESS_KEY) {
  throw new Error('Missing S3 Secret Access Key in .env file');
}

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME ?? '';
const S3_REGION = process.env.S3_REGION ?? '';
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID ?? '';
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY ?? '';

export { S3_BUCKET_NAME, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY };

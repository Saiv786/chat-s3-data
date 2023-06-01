import AWS from 'aws-sdk';
import fs from 'fs';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import {
  S3_BUCKET_NAME,
  S3_REGION,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
} from '@/config/s3';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

/* Name of the S3 bucket where your files are stored */
const bucketName = S3_BUCKET_NAME;

/* Local directory path to save the downloaded files */
const localDirPath = 'docs';

/* AWS configuration */
AWS.config.update({
  region: S3_REGION,
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const downloadFileFromS3 = async (key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  const response = await s3.getObject(params).promise();
  const filePath = `${localDirPath}/${key}`;
  fs.writeFileSync(filePath, response.Body);
  return filePath;
};

export const run = async () => {
  try {
    /* List files in the S3 bucket */
    const listParams = {
      Bucket: bucketName,
    };
    const fileList = await s3.listObjects(listParams).promise();
    /* Download files and load raw docs from all the files in the directory */
    const directoryLoader = new DirectoryLoader(localDirPath, {
      '.pdf': (path) => new PDFLoader(path),
    });
    
    const filePromises = fileList.Contents.map(async (file) => {
      const filePath = await downloadFileFromS3(file.Key);
      return filePath;
    });
    
    const filePaths = await Promise.all(filePromises);
    const rawDocs = await directoryLoader.load(filePaths);

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /* Create and store the embeddings in the vectorStore */
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); // Change to your own index name

    // Embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();

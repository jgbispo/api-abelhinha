import dotenv from 'dotenv';
dotenv.config()
import multer from 'multer';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import multerS3 from 'multer-s3';
import { S3Client, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";

const __filename = fileURLToPath(import.meta.url);

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});
console.log(process.env.AWS_DEFAULT_REGION)

const storage = multerS3({
  s3: s3,
  bucket: 'abelhinha-bucket',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  acl: 'public-read',
  key: (req, file, cb) => {
    const extensionFile = file.originalname.split('.')[1];
    crypto.randomBytes(16, (err, hash) => {
      if (err) cb(err);
      cb(null, `${hash.toString('hex')}.${extensionFile}`);
    });
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Apenas imagens são permitidas!'));
  }

  if (file.size > 5 * 1024 * 1024) {
    return cb(new Error('A imagem deve ter menos de 5MB!'));
  }

  cb(null, true);
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

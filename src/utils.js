import { fileURLToPath } from "url";
import { dirname } from "path";

const filename = fileURLToPath(import.meta.url);
const __dirname = dirname(filename);

export default __dirname;
import config from "./config/config.js";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: config.aws.ACCESS_KEY,
    secretAccessKey: config.aws.SECRET,
  },
});

// import AWS from "aws-sdk";

// AWS.config.update({
//   accessKeyId: config.aws.ACCESS_KEY,
//   secretAccessKey: config.aws.SECRET,
//   region: "us-east-1",
// });

// const s3 = new AWS.S3();

// export const uploader = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: "urbanoeccomercebucket",
//     acl: "public-read",
//     metadata: (req, file, cb) => {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//       cb(null, Date.now().toString() + file.originalname);
//     },
//   }),
// });

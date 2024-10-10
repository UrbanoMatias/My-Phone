import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import config from "../config/config.js";

import { S3 } from "@aws-sdk/client-s3";
const s3 = new S3({
  region: "us-east-1",
  credentials: {
    accessKeyId: config.aws.ACCESS_KEY,
    secretAccessKey: config.aws.SECRET,
  },
});
export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "urbanoeccomercebucket",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + file.originalname);
    },
  }),
});

// export const uploader = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: "urbanoeccomercebucket",
//     metadata: (req, file, cb) => {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//       cb(null, Date.now().toString() + file.originalname);
//     },
//   }),
// });

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
//     metadata: (req, file, cb) => {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//       cb(null, Date.now().toString() + file.originalname);
//     },
//   }),
// });

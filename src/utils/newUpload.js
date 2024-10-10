const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.aws.bucket_name,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      let folder = "";

      // Define la carpeta según el tipo de archivo
      if (file.mimetype.startsWith("image/")) {
        folder = "Profile picture/"; // Carpeta para imágenes de perfil
      } else if (file.mimetype.startsWith("video/")) {
        folder = "Videos/"; // Carpeta para videos
      } else {
        folder = "Posts/"; // Carpeta para posts u otros archivos
      }

      cb(null, folder + Date.now().toString() + "-" + file.originalname); // Genera un nombre único
    },
  }),
});
export default upload;

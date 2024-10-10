import express from "express";
import sessionControler from "../controllers/session.js";
import { passportCall } from "../utils/middlewares.js";
import { upload } from "../utils/uploader.js";
const router = express.Router();

router.get("/current", passportCall("jwt"), sessionControler.current);
router.post(
  "/register",
  upload.single("profile_picture"),
  passportCall("register"),
  (req, res) => {
    res.send("Archivo cargado con éxito");
  }
);
router.post('/auth/google', sessionControler.googleAuth);
router.post("/login", passportCall("login"), sessionControler.login);
router.get("/logout", sessionControler.logout);

export default router;

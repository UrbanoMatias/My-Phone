import config from "../config/config.js";
import jwt from "jsonwebtoken";
import { serialize } from "../utils/utils.js";
import axios from 'axios';

const authenticateGoogle = async (token) => {
  const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
  const { sub, email } = response.data;

  console.log(response.data)
  //let user = await userService.getBy({ email: email });
  // if (!user) {
  //   user = await User.create({ googleId: sub, email });
  // }

  // const jwtToken = jwt.sign({ id: user.id, email: user.email }, config.jwt.SECRET, { expiresIn: '1h' });
  // return jwtToken;
};

const googleAuth = async (req, res) => {
    const { token } = req.body;
    try {
      const jwtToken = await authenticateGoogle(token);
      res.json({ token: jwtToken });
    } catch (error) {
      res.status(400).json({ error: 'Invalid Google token' });
    }
};

const current = async (req, res) => {
  let user = serialize(req.user, [
    "first_name",
    "last_name",
    "role",
    "profile_picture",
    "cart",
  ]);
  res.send({ status: "success", payload: user });
};

const login = async (req, res) => {
  let user;
  if (req.user.role !== "superadmin") {
    user = serialize(req.user, ["first_name", "last_name"]);
  } else {
    user = req.user;
  }
  let token = jwt.sign(user, config.jwt.SECRET);
  res.cookie(config.jwt.COOKIE, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
  });
  res.cookie("sessionCookie", "boom", {
    maxAge: 60 * 60 * 1000,
  });
  res.send({ status: "success", payload: { user } });
};

const logout = async (req, res) => {
  res.clearCookie(config.jwt.COOKIE);
  res.send({ message: "Logged Out" });
};

export default {
  current,
  login,
  logout,
  googleAuth
};

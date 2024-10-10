import bcrypt from "bcrypt";
import config from "../config/config.js";

export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (user, password) =>
  bcrypt.compareSync(password, user.password);

export const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies[config.jwt.COOKIE];
  }
  return token;
};

export const serialize = (object, keys) => {
  let serializedObject = Object.fromEntries(
    Object.entries(object).filter((pair) => keys.includes(pair[0]))
  );
  serializedObject.id = object._id;
  return serializedObject;
};

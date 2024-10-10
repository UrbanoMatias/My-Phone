import dotenv from "dotenv";
dotenv.config();
export default {
  mongo: {
    url: process.env.MONGO_URL || "mongodb://localhost:27017/proyecto-final",
  },
  session: {
    SUPERADMIN: process.env.SUPERADMIN,
    SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD,
  },
  mercagoPago: {
    ACCESS_KEY: process.env.MERCADOPAGO_ACCESS_TOKEN,
  },
  aws: {
    ACCESS_KEY: process.env.AWS_ACCESS_KEY,
    SECRET: process.env.AWS_SECRET,
  },
  jwt: {
    SECRET: process.env.JWT_SECRET,
    COOKIE: process.env.JWT_COOKIE,
  },
  twilio: {
    PWD: process.env.APP_PWD,
    TWILIO: process.env.TWILIO_USER,
    SID: process.env.SID,
    TOKEN: process.env.TOKEN,
  },
};

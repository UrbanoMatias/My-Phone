// import axios from 'axios';
// import jwt from 'jsonwebtoken';
// import { User } from '../models/User';
// import config from '../config/config';

// const authenticateGoogle = async (token) => {
//   const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
//   const { sub, email } = response.data;

//   let user = await User.findOne({ where: { googleId: sub } });
//   if (!user) {
//     user = await User.create({ googleId: sub, email });
//   }

//   const jwtToken = jwt.sign({ id: user.id, email: user.email }, config.jwt.SECRET, { expiresIn: '1h' });
//   return jwtToken;
// };

// const googleAuth = async (req, res) => {
//     const { token } = req.body;
//     try {
//       const jwtToken = await authenticateGoogle(token);
//       res.json({ token: jwtToken });
//     } catch (error) {
//       res.status(400).json({ error: 'Invalid Google token' });
//     }
// };

// export default googleAuth
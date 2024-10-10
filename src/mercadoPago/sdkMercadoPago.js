// SDK de Mercado Pago
import mercadopago from "mercadopago";
import config from "../config/config";
// Agrega credenciales
mercadopago.configure({
  access_token: config.mercagoPago.ACCESS_KEY,
});

module.exports = {
  mercadopago,
};

// // Crea un objeto de preferencia
// let preference = {
//   items: [
//     {
//       title: "Mi producto",
//       unit_price: 100,
//       quantity: 1,
//     },
//   ],
// };

// mercadopago.preferences
//   .create(preference)
//   .then(function (response) {
//     res.json({
//       id: response.body.id,
//     });
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

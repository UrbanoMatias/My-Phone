import {
  cartService,
  productService,
  userService,
} from "../services/services.js";

import { createTransport } from "nodemailer";
import twilio from "twilio";
import config from "../config/config.js";
import Dao from "../model/Dao.js";
// Agrega credenciales
import { MercadoPagoConfig, Preference } from 'mercadopago';
const client = new MercadoPagoConfig({accessToken : config.mercagoPago.ACCESS_KEY})
//const clientTw = twilio(config.twilio.SID, config.twilio.TOKEN);

const transport = createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: config.twilio.TWILIO,
    pass: config.twilio.PWD,
  },
});

const getCartById = async (req, res) => {
  let id = req.params.cid;
  let cart = await cartService.getByWithPopulate({ _id: id });
  res.send({ status: "success", payload: cart });
};

const addProduct = async (req, res) => {
  let quantityChanged = false;
  let { cid, pid } = req.params;
  let { quantity } = req.body;
  let product = await productService.getBy({ _id: pid });
  if (!product)
    return res
      .status(404)
      .send({ status: "error", error: "Product not found" });
  let cart = await cartService.getBy({ _id: cid });
  if (!cart)
    return res.status(404).send({ status: "error", error: "Cart not found" });
  if (quantity > product.stock) {
    quantity = product.stock; //3  -> 1
    quantityChanged = true;
  }
  if (product.stock === 0) {
    return;
  } else {
    cart.products.push({ product: pid, quantity });
    await cartService.update(cid, cart);
    res.send({
      status: "success",
      quantityChanged,
      newQuantity: quantity,
      message: "Product added",
    });
  }
  // if(product.stock<quantity){
  //     quantity=product.stock
  //     quantityChanged=true;
  // }
  // product.stock = product.stock - quantity;
  // if(product.stock===0)
  //     product.status="unavailable"
  // await productService.update(pid,product);
};

const deleteProductsFromCart = async (req, res) => {
  let { cid } = req.params;
  let { products } = req.body;
  let cart = await cartService.getByWithPopulate({ _id: cid });
  if (!cart)
    return res.status(404).send({ status: "error", error: "Can't find cart" });
  products.forEach((productId) => {
    cart.products = cart.products.filter(
      (element) => element.product._id.toString() !== productId
    );
  });
  await cartService.update(cid, cart);
  res.send({ status: "success", message: "Product deleted" });
};

const deleteProductFromCart = async (req, res) => {
  let { pid, cid } = req.params;
  let cart = await cartService.getByWithPopulate({ _id: cid });
  if (!cart)
    return res.status(404).send({ status: "error", error: "Can't find cart" });
  if (
    cart.products.filter((element) => element.product._id.toString() === pid)
  ) {
    let product = await productService.getBy({ _id: pid });
    if (!product)
      return res
        .status(404)
        .send({ status: "error", error: "Product not found" });
    // let productInCart = cart.products.find(
    //   (element) => element.product._id.toString() === pid
    // );
    // // product.stock = product.stock + productInCart.quantity;
    // // await productService.update(pid,product);

    cart.products = cart.products.filter(
      (element) => element.product._id.toString() !== pid
    );
    await cartService.update(cid, cart);
    res.send({ status: "success", message: "Product deleted" });
  } else {
    res.status(400).send({ error: "Product not found in the cart" });
  }
};

const updateCart = async (req, res) => {
  //Iterate products array and check availability of each product
  let { cid } = req.params;
  let { products } = req.body;
  let stockLimitation = false;
  let productOutStock = false;
  let canBuy = false;
  let prodTitle = false;
  let prodID = false;
  //Check if cart exists
  let cart = await cartService.getBy({ _id: cid });
  console.log(cart.products);
  if (!cart)
    return res.status(404).send({ status: "error", error: "Can't find cart" });
  for (const element of cart.products) {
    let product = await productService.getBy({ _id: element.product });
    //Get the product in actual cart in order to make a comparison between current quantity and requested quantity
    let associatedProductInCart = cart.products.find(
      (element) => element.product.toString() === product._id.toString()
    );
    //Now get the product in the requested product to check out the quantity
    let associatedProductInInput = products.find(
      (element) => element.product.toString() === product._id.toString()
    );
    //I'm requesting to add more quantity of the product, we need to check the stock first
    // let difference =
    //   associatedProductInInput.quantity - associatedProductInCart.quantity;
    // console.log(difference);
    // if (product.stock >= difference) {
    //   //We can add it to the cart
    //   product.stock -= difference;
    //   associatedProductInCart.quantity = associatedProductInInput.quantity;
    // } else if (product.stock === 0) {
    //   //There's no sufficient stock to add to the cart
    //   productOutStock = product._id;
    //   associatedProductInCart.quantity += product.stock;
    // }
    console.log(
      associatedProductInCart.quantity,
      "associatedProductInCart.quantity"
    );
    console.log(product.stock, "product.stock");
    if (
      associatedProductInCart.quantity !== associatedProductInInput.quantity
    ) {
      //Ask if the requested quantity is less than the current quantity of the cart
      if (
        associatedProductInCart.quantity > associatedProductInInput.quantity
      ) {
        let difference =
          associatedProductInCart.quantity - associatedProductInInput.quantity;
        associatedProductInCart.quantity = associatedProductInInput.quantity;
        if (
          difference &&
          product.stock !== 0 &&
          product.stock > associatedProductInCart.quantity
        ) {
          canBuy = true;
        }
        if (
          difference &&
          product.stock > 0 &&
          product.stock <= associatedProductInCart.quantity
        ) {
          stockLimitation = true;
          prodTitle = product.title;
          associatedProductInCart.quantity = product.stock;
        }
        if (difference && product.stock === 0) {
          prodTitle = product.title;
          productOutStock = product._id;
          product.status = "unavailable";
          await productService.update(product._id, product);
        }
      } else {
        //I'm requesting to add more quantity of the product, we need to check the stock first
        let difference =
          associatedProductInInput.quantity - associatedProductInCart.quantity;
        if (
          product.stock > 0 &&
          product.stock >= difference &&
          product.stock > associatedProductInCart.quantity
        ) {
          //We can add it to the cart
          canBuy = true;
          associatedProductInCart.quantity = associatedProductInInput.quantity;
        }
        if (
          product.stock > 0 &&
          product.stock < associatedProductInCart.quantity
        ) {
          stockLimitation = true;
          prodTitle = product.title;
          associatedProductInCart.quantity = product.stock;
        }

        if (product.stock === 0) {
          productOutStock = product._id;
          prodTitle = product.title;
          associatedProductInCart.quantity += product.stock;
          product.status = "unavailable";
          await productService.update(product._id, product);
        }
        // if( difference > product.stock){
        //   stockLimitation = true;
        //   associatedProductInCart.quantity += product.stock;
        // }

        // else {
        //   //There's no sufficient stock to add to the cart
        //   productOutStock = product._id;
        //   associatedProductInCart.quantity += product.stock;
        // }
      }
    }
  }
  await cartService.update(cid, cart);
  res.send({
    status: "success",
    stockLimitation,
    productOutStock,
    canBuy,
    prodTitle,
  });
};

const verifyProductStock = async (req, res) => {
  const { cid } = req.params;
  let products = [];
  let cart = await cartService.getBy({ _id: cid });
  if (!cart)
    return res.status(404).send({ status: "error", error: "Can't find cart" });
  //console.log(cid);
  for (const element of cart.products) {
    let product = await productService.getBy({ _id: element.product._id });
    if (!product) {
      // Si el producto no existe, devolver un error 404
      return res.status(404).json({ error: "Product not found" });
    }
    let productQuantity = {
      stock: product.stock,
      productTitle: product.title,
      productId: product._id,
    };
    products.push(productQuantity);
  }
  res.send(products);
};

const confirm = async (req, res) => {
  let { cid } = req.params;
  let prodTitle = false;
  let stockLimitation = false;
  let prodOutStock = false;
  let canPurchase = false;
  let data = [];
  let cart = await cartService.getBy({ _id: cid });
  if (!cart)
    return res.status(404).send({ status: "error", error: "Can't find cart" });
  let user = await userService.getBy({ cart: cid });
  if (!user) res.status(404).send({ status: "error", error: "Not found" });
  let cartPopulate = await cartService.getByWithPopulate({ _id: cid });
  let productsInCart = await cartPopulate.products.map((prod) => prod.product);
  let prodOut = productsInCart.filter((element) => element.stock === 0);
  let prodPurchase = productsInCart.filter((element) => element.stock > 0);
  if (prodOut.length >= 1) {
    let titles = prodOut.map((element) => element.title);
    data.push(titles);
    prodOutStock = true;
  } else {
    for (const element of cart.products) {
      let product = await productService.getBy({ _id: element.product });
      let associatedProductInCart = cart.products.find(
        (element) => element.product.toString() === product._id.toString()
      );
      if (
        product.stock > 0 &&
        product.stock < associatedProductInCart.quantity
      ) {
        stockLimitation = true;
        prodTitle = product.title;
        associatedProductInCart.quantity = product.stock;
      }
      if (stockLimitation === false) {
        canPurchase = true;
        prodTitle = product.title;
        data.push(prodTitle);
        product.stock -= associatedProductInCart.quantity;
        await productService.update(product._id, product);
        // await productService.updateProductStock(
        //   product._id,
        //   associatedProductInCart.quantity
        // );
      }
    }
  }
  cart.products = [];
  await cartService.update(cid, cart);
  res.send({
    status: "success",
  });
};

const payWithMercadoPago = async (req, res) => {

  try {
     const {cartId, products} = req.body;
    //  const items = products.map((product) => ({
    //   id: product.product._id, // O el campo que contenga el ID del producto
    //   title: product.product.title, // O el campo que contenga el nombre del producto
    //   quantity: product.quantity,
    //   currency_id: "ARS",
    //   unit_price: product.product.price, // O el campo que contenga el precio del producto
    // }));

    // Crea una preferencia de pago con Mercado Pago
    const preference = new Preference(client);
    const body = {
      items : [
        {
          "id": "item-ID-1234",
          "title": "Meu produto",
          "quantity": 1,
          "unit_price": 75.76
        }
      ],
    }
    let preferences = {
      // el "purpose": "wallet_purchase" solo permite pagos registrados
      // para permitir pagos de guests puede omitir esta propiedad
      "purpose": "wallet_purchase",
      "items": [
        {
          "id": "item-ID-1234",
          "title": "Meu produto",
          "quantity": 1,
          "unit_price": 75.76
        }
      ]
    };
    const result = await preference.create({body})
    res.json({id:result.id})
    console.log(result)
    // const productsToBuy = {
    //   body: items,
    //   external_reference: cartId, // Asigna el cartId como referencia externa
    // };
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al procesar el pago con Mercado Pago" });
  }

};

const notificationOrder = async (req, res) => {
  const { query } = req;
  const topic = query.topic;
  let merchant_order = null;
  let statusPayment;
  switch (topic) {
    case "payment":
      const payment = await mercadopago.payment.get(query.id);
      merchant_order = await mercadopago.merchant_orders.get(
        payment.body.order.id
      );
      break;
    case "merchant_order":
      merchant_order = await mercadopago.merchant_orders.get(query.id);
      break;
  }
  if (merchant_order !== null) {
    let paid_amount = 0;
    for (const payment of merchant_order.body.payments) {
      if (payment.status === "approved") {
        paid_amount += payment.transaction_amount;
      }
    }

    if (paid_amount >= merchant_order.body.total_amount) {
      if (merchant_order.body.shipments.length > 0) {
        if (merchant_order.body.shipments[0].status === "ready_to_ship") {
          console.log("Pago Realizado");
          statusPayment = true;
        }
      } else {
        console.log("Pago Realizado");
        statusPayment = true;
      }
    } else {
      console.log("Pago NO Realizado");
    }
  }
  res.send({ status: 200, statusPayment });
};

export default {
  getCartById,
  addProduct,
  deleteProductFromCart,
  deleteProductsFromCart,
  updateCart,
  confirm,
  payWithMercadoPago,
  notificationOrder,
  verifyProductStock,
};

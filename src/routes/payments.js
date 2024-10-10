import express from "express";
import PaymentService from "../services/paymentsService.js";
import PaymentController from "../controllers/payments.js";
const router = express.Router();

const PaymentInstance = new PaymentController(new PaymentService());

router.get("/", function (req, res, next) {
  return res.json({
    "/payment": "generates a payment link",
    "/subscription": "generates a subscription link",
  });
});

router.get("/payment", function (req, res, next) {
  PaymentInstance.getPaymentLink(req, res);
});

export default router;

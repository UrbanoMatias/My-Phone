import express from "express";
import cartController from "../controllers/carts.js";

const router = express.Router();
router.post("/purchase/:cid", cartController.confirm);
router.post("/payment", cartController.payWithMercadoPago);
router.post("/notificationOrder", cartController.notificationOrder);
router.get("/:cid", cartController.getCartById);
router.get("/:cid/stock", cartController.verifyProductStock);
router.put("/:cid/", cartController.updateCart);
router.post("/:cid/products/:pid", cartController.addProduct);
router.delete("/:cid/products/:pid", cartController.deleteProductFromCart);
router.post("/:cid", cartController.deleteProductsFromCart);

export default router;

import express from "express";
import productsController from "../controllers/products.js";

import { upload } from "../utils/uploader.js";

const router = express.Router();

router.get("/", productsController.getAllProducts);
router.get("/:pid", productsController.getProductById);
router.get("/:cid/stock", productsController.verifyProductStock);
router.post("/", upload.array("thumbnail"), productsController.saveProduct);
router.put("/:pid", productsController.updateProduct);
router.delete("/:pid", productsController.deleteProduct);

export default router;

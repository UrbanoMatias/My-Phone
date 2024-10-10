import Products from "../model/Products.js";
import GenericQueries from "./genericQueries.js";
import { MongoClient } from "mongodb";

// Conexión a la base de datos de MongoDB
const uri =
  "mongodb+srv://matias:123@e-commerce.zcznv.mongodb.net/E-Commerce-Urbano";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
await client.connect();

export default class ProductService extends GenericQueries {
  constructor(dao) {
    super(dao, Products.model);
  }
  // updateProductStock = async (productId, quantity) => {
  //   try {
  //     await client.connect();

  //     const session = client.startSession();

  //     const transactionOptions = {
  //       readConcern: { level: 'snapshot' },
  //       writeConcern: { w: 'majority' },
  //       readPreference: 'primary',
  //       maxCommitTimeMS: 5000
  //     };

  //     const updatedProduct = await session.withTransaction(async () => {
  //       const productCollection = client.db().collection('products');
  //       const product = await productCollection.findOne({ _id: productId });

  //       if (!product) {
  //         throw new Error('Product not found');
  //       }

  //       if (product.stock < quantity) {
  //         throw new Error('Not enough stock available');
  //       }

  //       const updatedProduct = await productCollection.findOneAndUpdate(
  //         { _id: productId },
  //         { $inc: { stock: -quantity } },
  //         { returnOriginal: false }
  //       );

  //       return updatedProduct.value;
  //     }, transactionOptions);

  //     return updatedProduct;
  //   } finally {
  //     await client.close();
  //   }
  // }

  updateProductStock = async (productId, quantity) => {
    const session = client.startSession();

    try {
      const transactionOptions = {
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
        readPreference: "primary",
        maxCommitTimeMS: 5000,
      };
      const updatedProduct = await session.withTransaction(async () => {
        const productCollection = this.dao.models[Products.model];
        const product = await productCollection.findOne({ _id: productId });

        // if (product.lock) {
        //   throw new Error(
        //     "Product is currently being purchased by another user"
        //   );
        // }

        // await productCollection.findOneAndUpdate(
        //   { _id: productId },
        //   { $set: { lock: true } }
        // );

        if (!product) {
          throw new Error("Product not found");
        }

        if (product.stock < quantity) {
          throw new Error("Not enough stock available");
        }

        const updatedProduct = await productCollection.findOneAndUpdate(
          { _id: productId },
          { $inc: { stock: -quantity } },
          { returnOriginal: false, session, new: true }
        );

        return updatedProduct;
      }, transactionOptions);

      return updatedProduct;
    } finally {
      await session.endSession();
    }
  };
}

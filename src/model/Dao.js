import mongoose from "mongoose";
import Carts from "./Cart.js";
import Products from "./Products.js";
import User from "./User.js";
import Message from "./Message.js";

export default class Dao {
  constructor(config) {
    this.mongoose = mongoose
      .connect(config.url, { useNewUrlParser: true })
      .catch((error) => {
        console.log(error);
        process.exit();
      });

    const timestamp = {
      timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    };
    const userSchema = mongoose.Schema(User.schema, timestamp);
    const productsSchema = mongoose.Schema(Products.schema, timestamp);
    const cartSchema = mongoose.Schema(Carts.schema, timestamp);
    const messageSchema = mongoose.Schema(Message.schema, timestamp);

    this.models = {
      [User.model]: mongoose.model(User.model, userSchema),
      [Products.model]: mongoose.model(Products.model, productsSchema),
      [Carts.model]: mongoose.model(Carts.model, cartSchema),
      [Message.model]: mongoose.model(Message.model, messageSchema),
    };
  }
  findOne = async (options, entity) => {
    if (!this.models[entity])
      throw new Error(`Entity ${entity} not in dao schemas`);
    let result = await this.models[entity].findOne(options);
    return result ? result.toObject() : null;
  };
  getAll = async (options, entity) => {
    if (!this.models[entity])
      throw new Error(`Entity ${entity} not in dao schemas`);
    let results = await this.models[entity].find(options);
    return results.map((result) => result.toObject());
  };
  insert = async (document, entity) => {
    if (!this.models[entity])
      throw new Error(`Entity ${entity} not in dao schemas`);
    try {
      let instance = new this.models[entity](document);
      let result = await instance.save();
      return result ? result.toObject() : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  update = async (document, entity) => {
    if (!this.models[entity])
      throw new Error(`Entity ${entity} not in dao schemas`);
    let id = document._id;
    delete document._id;
    let result = await this.models[entity].findByIdAndUpdate(
      id,
      { $set: document },
      { new: true }
    );
    return result.toObject();
  };
  delete = async (id, entity) => {
    if (!this.models[entity])
      throw new Error(`Entity ${entity} not in dao schemas`);
    let result = await this.models[entity].findByIdAndDelete(id);
    return result ? result.toObject() : null;
  };
  exist = async (entity, options) => {
    if (!this.models[entity])
      throw new Error(`Entity ${entity} not in dao schemas`);
    return this.models[entity].exists(options);
  };
}

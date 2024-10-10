import mongoose from "mongoose";

let Schema = mongoose.Schema;

export default class User {
  constructor(data) {
    this.data = data;
  }
  static get model() {
    return "Users";
  }
  static get schema() {
    return {
      first_name: {
        type: String,
        required: true,
      },
      last_name: {
        type: String,
        required: true,
      },
      phone: {
        type: Number,
        required: true,
      },
      role: {
        type: String,
        required: true,
      },
      profile_picture: {
        type: String,
      },
      status: {
        type: Boolean,
        default: true,
      },
      cart: {
        type: Schema.Types.ObjectId,
        ref: "Carts",
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
    };
  }
}

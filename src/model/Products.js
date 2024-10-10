export default class Products {
  constructor(data) {
    this.data = data;
  }
  static get model() {
    return "Products";
  }
  static get schema() {
    return {
      title: {
        type: String,
        required: true,
      },
      filters: [],
      description: [],
      thumbnail: [],
      stock: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      code: {
        type: String,
        required: true,
        unique: true,
      },
      status: { type: String, default: "available" },
      lock: { type: Boolean, default: false },
    };
  }
}

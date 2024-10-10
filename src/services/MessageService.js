import GenericQueries from "./genericQueries.js";
import Message from "../model/Message.js";
export default class MessageService extends GenericQueries {
  constructor(dao) {
    super(dao, Message.model);
  }
  getAllAndPopulate = async (params) => {
    let result = await this.dao.models[Message.model]
      .find(params)
      .populate("author");
    return result;
  };
}

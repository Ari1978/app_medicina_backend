import Staff from "../models/staffUser.model";

export const StaffRepository = {
  async buscarPorUsername(username) {
    return await Staff.findOne({ username });
  },

  async listar() {
    return await Staff.find({}, "-password -__v").sort({ createdAt: -1 }).lean();
  },
};



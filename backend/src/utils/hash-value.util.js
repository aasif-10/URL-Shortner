import * as bcrypt from "bcrypt";

const hashValue = async (val) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(val, salt);

  return hash;
};

export { hashValue };

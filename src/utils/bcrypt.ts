import bcrypt from "bcrypt";

const hashValue = async function (val: string, saltRounds?: number) {
  return bcrypt.hash(val, saltRounds || 10);
};
const compareValue = async function (val: string, hashedValue: string) {
  return bcrypt.compare(val, hashedValue).catch(() => false);
};

export { hashValue, compareValue };

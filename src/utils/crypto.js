import bcrypt from "bcrypt";

/**
 * Hashear una contraseña en texto plano
 * @param {string} plain - Contraseña en texto plano
 * @returns {Promise<string>} - Hash de la contraseña
 */
export const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

/**
 * Comparar contraseña en texto plano con hash
 * @param {string} plain - Contraseña en texto plano
 * @param {string} hash - Hash a comparar
 * @returns {Promise<boolean>} - true si coinciden
 */
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

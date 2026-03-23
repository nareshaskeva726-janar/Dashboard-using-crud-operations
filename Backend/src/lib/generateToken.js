import jwt from "jsonwebtoken";


//TOKEN GENERATING USING SIGN
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },            // payload
    process.env.JWT_SECRET,    // secret key
    { expiresIn: "30d" }       // token expiration
  );
};

export default generateToken
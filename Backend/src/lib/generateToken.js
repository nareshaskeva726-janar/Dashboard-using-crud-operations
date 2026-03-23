import jwt from "jsonwebtoken";


//TOKEN GENERATING USING SIGN
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },            
    process.env.JWT_SECRET,    
    { expiresIn: "30d" }       
  );
};

export default generateToken
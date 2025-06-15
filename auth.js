import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export function authToken(req, res, next) {
  console.log("token: ", req.headers.authorization);
  const header = req?.headers.authorization;
  const token = header && header.split(" ")[1];

  if (token == null) return res.status(401).json("Please send token");

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Invalid token", error: err.message });
    req.user = user;

    // ✅ Forward user info to downstream service
    req.headers["x-user-id"] = user._id;
    req.headers["x-user-role"] = user.role;

    next();
  });
}

export function authRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json("Unauthorized");
    }
    next();
  };
}

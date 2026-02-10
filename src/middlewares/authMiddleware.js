import jwt from "jsonwebtoken";

export const jwtMiddleWare = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (_) {
    return res.status(401).json({ error: "Invalid Token" });
  }
};

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  //with get() easy to get header value
  const token = req.get("Authorization").split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "secretkey");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated!");
    error.statusCode = 500;
    throw error;
  }

  req.userId = decodedToken.userId;
  next();
};

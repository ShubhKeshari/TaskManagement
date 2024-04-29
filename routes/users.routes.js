
const express = require ("express");
const userRouter = express.Router();
const { userRegister,userLogin,userLogout,updateUser } = require("../controller/user.controller");
const {
  validateRegister,
  validateLogin,
  authenticateUser,
  authorizeUser,
} = require("../middleware/user.middleware");

userRouter.post("/register", validateRegister, userRegister);

userRouter.post("/login", validateLogin,userLogin );

userRouter.post("/logout",userLogout);

userRouter.patch("/update/:userId",authenticateUser,authorizeUser("admin"), updateUser);
userRouter.all("*", (req, res) => {
  return res.status(404).json({ message: "404 Invalid Route" });
});

module.exports = {
  userRouter,
};

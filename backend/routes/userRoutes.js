import express from 'express';
import  {registerUser, loginUser} from "../controllers/userController.js"


//using express for the routing where this routes functionality will be handled by the controllers

const  userRouter = express.Router();


//register route
userRouter.post('/signup', registerUser);

//login route
userRouter.post('/login', loginUser);

export default userRouter;

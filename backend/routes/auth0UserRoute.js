import express from 'express';
import { auth0Callback, auth0IsAuth, auth0UpdateProfile } from '../controllers/auth0UserController.js';
import authAuth0 from '../middlewares/authAuth0.js';

const auth0UserRouter = express.Router();

auth0UserRouter.post('/callback', auth0Callback);
auth0UserRouter.get('/is-auth', authAuth0, auth0IsAuth);
auth0UserRouter.post('/update-profile', authAuth0, auth0UpdateProfile);

export default auth0UserRouter;

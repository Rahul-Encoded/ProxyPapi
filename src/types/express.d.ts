import { IUser } from "../models/User.models";

declare global {
	namespace Express {
		interface Request {
			user?: IUser; // Add a `user` property to the Request object
		}
	}
}
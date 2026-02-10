import { Role } from "../../generated/prisma/enums";

interface IUserRequest {
    userId: string;
    role: Role;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            user : IUserRequest;
        }
    }
}


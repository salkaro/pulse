import { IUser } from '@/models/user';
import { DefaultSession, User as NextAuthUser } from 'next-auth';

interface UserSession extends NextAuthUser {
    id: string;
    email: string;
}

declare module "next-auth" {
    interface Session extends DefaultSession {
        id: string;
        email: string;
        user: IUser;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        user: IUser;
    }
}
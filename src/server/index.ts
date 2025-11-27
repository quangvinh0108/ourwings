import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export { authOptions };

export const getServerAuthSession = () => getServerSession(authOptions);

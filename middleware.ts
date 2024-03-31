import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

/*export default NextAuth(authConfig).auth(async (req: any) => {
  console.log(req.auth);
});*/
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

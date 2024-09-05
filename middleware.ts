import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  if (nextUrl.pathname.startsWith('/api')) {
    return;
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/session`,
    {
      method: 'GET',
      credentials: 'include', // This includes cookies in the request
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.cookies.toString(),
      },
    }
  );
  const user_session = await res.json();
  /*if (request.nextUrl.pathname.startsWith('/about')) {
    // This logic is only applied to /about
  }*/

  if (nextUrl.pathname.startsWith('/dashboard')) {
    // This logic is only applied to /dashboard
    //const user_session = await user();

    console.log({ user_session }, user_session?.user?.role);
    if (!user_session || user_session.user.role == 'USER') {
      return Response.redirect(new URL('/', nextUrl));
    }
    return;
  }
  if (nextUrl.pathname.startsWith('/login')) {
    if (user_session && user_session.user.role !== 'USER') {
      return Response.redirect(new URL('/dashboard', nextUrl));
    }
  }
  return;
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};

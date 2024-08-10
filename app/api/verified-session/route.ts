import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Create a response with a redirect
  console.log('GET VERIFIED-SESSION::');
  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_INTERNAL_URL}/dashboard` ||
      'http://localhost:3001/dashboard'
  );

  // Extract cookies from the request if needed
  const cookies = request.cookies.getAll();
  console.log('Cookies received:', cookies);

  cookies.forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      //sameSite: 'none', // Allows the cookie to be sent cross-origin
      //maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  });

  return response;
}

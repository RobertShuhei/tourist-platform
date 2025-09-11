import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Forward login request to backend
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch('http://tourism-api:8000/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Authentication failed', details: errorData },
        { status: response.status }
      );
    }

    const tokenData = await response.json();
    
    // Set http-only cookie with the access token
    const cookieStore = cookies();
    cookieStore.set('access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in, // Use token expiration from backend
      path: '/',
    });

    return NextResponse.json({ 
      success: true,
      message: 'Login successful',
      expires_in: tokenData.expires_in 
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
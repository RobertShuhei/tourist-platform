import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Forward request to backend with the token
    const response = await fetch('http://tourism-api:8000/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Token might be expired or invalid
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: response.status }
      );
    }

    const userData = await response.json();
    return NextResponse.json(userData);

  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
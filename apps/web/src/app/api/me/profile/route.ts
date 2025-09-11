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

    // Forward request to backend to get guide profile
    const response = await fetch('http://tourism-api:8000/profiles/guide/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      // Profile doesn't exist yet - return null
      return NextResponse.json({ profile: null });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: errorData },
        { status: response.status }
      );
    }

    const profileData = await response.json();
    return NextResponse.json({ profile: profileData });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const profileData = await request.json();

    // Forward request to backend to create guide profile
    const response = await fetch('http://tourism-api:8000/profiles/guide', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to create profile', details: errorData },
        { status: response.status }
      );
    }

    const createdProfile = await response.json();
    return NextResponse.json({ profile: createdProfile }, { status: 201 });

  } catch (error) {
    console.error('Profile creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const profileData = await request.json();

    // Forward request to backend to update guide profile
    const response = await fetch('http://tourism-api:8000/profiles/guide/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to update profile', details: errorData },
        { status: response.status }
      );
    }

    const updatedProfile = await response.json();
    return NextResponse.json({ profile: updatedProfile });

  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
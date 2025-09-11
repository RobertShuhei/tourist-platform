import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    const profileId = params.profileId;

    // Validate profileId is a number
    if (!profileId || isNaN(Number(profileId))) {
      return NextResponse.json(
        { error: 'Invalid profile ID' },
        { status: 400 }
      );
    }

    // Forward request to backend to get specific guide profile
    const response = await fetch(`http://tourism-api:8000/profiles/guide/profile/${profileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Guide profile not found' },
        { status: 404 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to fetch guide profile', details: errorData },
        { status: response.status }
      );
    }

    const guideData = await response.json();
    return NextResponse.json({ guide: guideData });

  } catch (error) {
    console.error('Guide profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
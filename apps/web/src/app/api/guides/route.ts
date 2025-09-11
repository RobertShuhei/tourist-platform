import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Forward request to backend to get all guide profiles
    const response = await fetch('http://tourism-api:8000/profiles/guides', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to fetch guides', details: errorData },
        { status: response.status }
      );
    }

    const guidesData = await response.json();
    return NextResponse.json({ guides: guidesData });

  } catch (error) {
    console.error('Guides API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
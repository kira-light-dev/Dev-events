import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Event, IEvent } from '@/database';

// Route segment config
export const dynamic = 'force-dynamic';

// Type for route params
interface RouteParams {
  params: Promise<{ slug: string }>;
}

// Standard API response types
interface SuccessResponse {
  success: true;
  data: IEvent;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

/**
 * GET /api/events/[slug]
 * Fetches a single event by its URL slug
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Sanitize slug - only allow alphanumeric, hyphens, underscores
    const sanitizedSlug = slug.trim().toLowerCase();
    if (!/^[\w-]+$/.test(sanitizedSlug)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slug format' },
        { status: 400 }
      );
    }

    await connectDB();

    const event = await Event.findOne({ slug: sanitizedSlug }).lean<IEvent>();

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: event }, { status: 200 });
  } catch (error) {
    console.error('Error fetching event:', error);

    // Handle specific Mongoose errors
    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid slug format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

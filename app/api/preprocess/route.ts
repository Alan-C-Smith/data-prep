import { NextRequest, NextResponse } from 'next/server';
import { applyPreprocessing } from '@/lib/server/data-processor';
import type { PreprocessingAction } from '@/lib/schema';

export const config = {
  maxDuration: 300, // 5 minutes for large dataset processing
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, columnOrder, action } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'No action specified' },
        { status: 400 }
      );
    }

    // Apply the preprocessing action
    const result = applyPreprocessing(data, columnOrder || [], action as PreprocessingAction);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Preprocessing error:', error);
    return NextResponse.json(
      { error: 'Failed to process data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

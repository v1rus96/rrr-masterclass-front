import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data: statusCounts, error } = await supabase
      .from('users')
      .select('status')
      .not('status', 'is', null);

    if (error) throw error;

    // Count occurrences of each status
    const counts = statusCounts.reduce((acc: Record<string, number>, row) => {
      const status = row.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching status counts:', error);
    return NextResponse.json({ error: 'Failed to fetch status counts' }, { status: 500 });
  }
}

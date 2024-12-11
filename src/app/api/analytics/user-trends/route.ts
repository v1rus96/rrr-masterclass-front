import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    // Get users created in the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: users, error } = await supabase
      .from('users')
      .select('createdat, onboarding, status, type')
      .gte('createdat', sixMonthsAgo.toISOString())
      .order('createdat', { ascending: true });

    if (error) throw error;

    // Group users by month
    const monthlyData = users.reduce((acc: Record<string, any>, user) => {
      const month = new Date(user.createdat).toLocaleString('default', { month: 'short' });
      
      if (!acc[month]) {
        acc[month] = {
          total: 0,
          onboarded: 0,
          pending: 0,
          qualified: 0,
          unqualified: 0
        };
      }

      acc[month].total += 1;
      if (user.onboarding) acc[month].onboarded += 1;
      if (user.status === 'pending') acc[month].pending += 1;
      if (user.type === 'qualified') acc[month].qualified += 1;
      if (user.type === 'unqualified') acc[month].unqualified += 1;

      return acc;
    }, {});

    // Convert to array format for charts
    const trends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Error fetching user trends:', error);
    return NextResponse.json({ error: 'Failed to fetch user trends' }, { status: 500 });
  }
}

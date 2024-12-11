import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('onboarding, type, phonenumber')
      .not('type', 'is', null);

    if (error) throw error;

    const stats = {
      totalUsers: users.length,
      onboardingStats: {
        completed: users.filter(u => u.onboarding).length,
        pending: users.filter(u => !u.onboarding).length
      },
      qualificationStats: {
        qualified: users.filter(u => u.type === 'qualified').length,
        unqualified: users.filter(u => u.type === 'unqualified').length,
        pending: users.filter(u => u.type === 'pending').length
      },
      phoneNumberStats: {
        withPhone: users.filter(u => u.phonenumber).length,
        withoutPhone: users.filter(u => !u.phonenumber).length
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching onboarding stats:', error);
    return NextResponse.json({ error: 'Failed to fetch onboarding stats' }, { status: 500 });
  }
}

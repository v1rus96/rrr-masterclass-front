import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Define interfaces for daily stats and attendance counts
interface DailyStats {
    invalid: number;
    qualified: number;
    unqualified: number;
    new: number;
    attended: number;
    notAttended: number;
    date: string;
}

interface AttendanceCounts {
    attended: number;
    notAttended: number;
}

interface OnboardingCounts {
    onboarded: number;
    notOnboarded: number;
}

interface TypeDistribution {
    [key: string]: number;
}

interface StatusCounts {
    [key: string]: number;
}

interface DailyStatsResponse {
    day: string;
    invalid: number;
    qualified: number;
    unqualified: number;
    new: number;
    attended: number;
    notAttended: number;
    date: string;
}

interface WeeklyMetricsResponse {
    dailyStats: DailyStatsResponse[];
    statusCounts: StatusCounts;
    onboardingCounts: OnboardingCounts;
    attendanceCounts: AttendanceCounts;
    typeDistribution: TypeDistribution;
    dateRange: {
        startDate: string;
        endDate: string;
    };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();

    console.log('API received dates:', { startDate, endDate });

    // Get data for the selected date range
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .gte('createdat', startDate)
      .lte('createdat', endDate)
      .order('createdat', { ascending: true });

    if (error) throw error;

    console.log('Found users:', users.length);

    // Process users by day
    const dailyStats: Record<string, DailyStats> = {};
    users.forEach(user => {
      const date = new Date(user.createdat);
      const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      if (!dailyStats[day]) {
        dailyStats[day] = {
          new: 0,
          qualified: 0,
          unqualified: 0,
          invalid: 0,
          attended: 0,
          notAttended: 0,
          date: date.toISOString() // Store the full date for sorting
        };
      }

      // Count by status
      if (user.status === 'invalid') {
        dailyStats[day].invalid += 1;
      } else if (user.status === 'qualified') {
        dailyStats[day].qualified += 1;
      } else if (user.status === 'unqualified') {
        dailyStats[day].unqualified += 1;
      } else if (user.status === 'new') {
        dailyStats[day].new += 1;
      }
      
      // Count attended vs not attended
      if (user.attended === true) {
        dailyStats[day].attended += 1;
      } else if (user.attended === false) {
        dailyStats[day].notAttended += 1;
      }
    });

    // Convert dailyStats to sorted array
    const sortedDailyStats = Object.entries(dailyStats)
      .sort(([, a], [, b]) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(([day, stats]) => ({
        day,
        ...stats
      }));

    console.log('Processed daily stats:', sortedDailyStats);

    // Get status counts
    const statusCounts: StatusCounts = users.reduce((acc, user) => {
      const status = user.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Get onboarding counts for qualified users within date range
    const qualifiedUsers = users.filter(user => user.status === 'qualified');
    
    const onboardingCounts: OnboardingCounts = qualifiedUsers.reduce((acc, user) => {
      if (user.onboarding) {
        acc.onboarded = (acc.onboarded || 0) + 1;
      } else {
        acc.notOnboarded = (acc.notOnboarded || 0) + 1;
      }
      return acc;
    }, { onboarded: 0, notOnboarded: 0 });

    // Get attendance counts for qualified users within date range
    const attendanceCounts: AttendanceCounts = { attended: 0, notAttended: 0 };
    qualifiedUsers.forEach(user => {
      // Handle both boolean and string values
      const isAttended = user.attended === true || user.attended === 'true';
      
      if (isAttended) {
        attendanceCounts.attended += 1;
      } else {
        attendanceCounts.notAttended += 1;
      }
    });

    // Log for debugging
    console.log('Attendance data:', {
      qualifiedUsers: qualifiedUsers.length,
      attendanceCounts,
      qualifiedUsersDetails: qualifiedUsers.map(user => ({
        id: user.id,
        attended: user.attended,
        type: typeof user.attended
      }))
    });

    // Get type distribution for qualified users within date range
    const typeDistribution: TypeDistribution = qualifiedUsers.reduce((acc, user) => {
      const type = user.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const response: WeeklyMetricsResponse = {
      dailyStats: sortedDailyStats,
      statusCounts,
      onboardingCounts,
      attendanceCounts,
      typeDistribution,
      dateRange: {
        startDate,
        endDate
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching weekly metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch weekly metrics' }, { status: 500 });
  }
}

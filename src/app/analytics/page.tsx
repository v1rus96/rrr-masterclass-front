"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/datepicker"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

// Define the Metrics interface
interface Metrics {
    dailyStats: DailyStatsResponse[];
    statusCounts: StatusCounts;
    onboardingCounts: OnboardingCounts;
    attendanceCounts: AttendanceCounts;
    typeDistribution: TypeDistribution;
}

interface DailyStatsResponse {
    day: string;
    invalid: number;
    qualified: number;
    unqualified: number;
    new: number;
}

interface StatusCounts {
    invalid: number;
    qualified: number;
    unqualified: number;
    new: number;
}

interface OnboardingCounts {
    onboarded: number;
    notOnboarded: number;
}

interface AttendanceCounts {
    attended: number;
    notAttended: number;
}

interface TypeDistribution {
    [key: string]: number;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString()
        })
        console.log('Fetching with dates:', dateRange.startDate, dateRange.endDate);
        const res = await fetch(`/api/analytics/weekly-metrics?${params}`)
        const data = await res.json()
        console.log('Received data:', data);
        setMetrics(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching weekly metrics:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  const COLORS = {
    qualified: "#22c55e",
    unqualified: "#ef4444",
    invalid: "#f59e0b",
    new: "#3b82f6",
    attended: "#8b5cf6",
    notAttended: "#94a3b8",
    onboarded: "#06b6d4",
    notOnboarded: "#ec4899"
  }

  const handleDateChange = (type: 'start' | 'end', date: Date | undefined) => {
    if (date) { 
        setDateRange(prev => {
            // Ensure end date is not before start date
            if (type === 'end' && date < prev.startDate) {
                return prev;
            }
            // Ensure start date is not after end date
            if (type === 'start' && date > prev.endDate) {
                return prev;
            }
            return {
                ...prev,
                [type === 'start' ? 'startDate' : 'endDate']: date
            };
        });
    } else {
        console.error('Date variable is undefined');
    }
  };

  if (loading || !metrics) {
    return <div className="p-8">Loading analytics data...</div>
  }

  // Log the data being used for charts
  console.log('Daily stats for charts:', metrics.dailyStats);

  // Prepare data for the onboarding pie chart
  const onboardingData = Object.entries(metrics.onboardingCounts).map(([name, value]) => ({
    name: name === 'onboarded' ? 'Online' : 'Offline',
    value
  }))

  // Log the metrics data for debugging
  console.log('Metrics data:', {
    attendanceCounts: metrics.attendanceCounts,
    attendanceData: Object.entries(metrics.attendanceCounts || {}).map(([name, value]) => ({
      name: name === 'attended' ? 'Attended' : 'Not Attended',
      value: value || 0
    }))
  });

  // Prepare data for the attendance pie chart
  const attendanceData = Object.entries(metrics.attendanceCounts || {}).map(([name, value]) => ({
    name: name === 'attended' ? 'Attended' : 'Not Attended',
    value: value || 0
  }))

  // Prepare data for the type distribution pie chart
  const typeData = Object.entries(metrics.typeDistribution)
    .filter(([type]) => type !== 'unknown')
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              value={dateRange.startDate}
              onChange={(date) => handleDateChange('start', date)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DatePicker
              value={dateRange.endDate}
              onChange={(date) => handleDateChange('end', date)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Stacked Bar Chart - User Types */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly User Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={metrics.dailyStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                />
                <Legend />
                <Bar 
                  dataKey="invalid" 
                  stackId="a" 
                  fill={COLORS.invalid} 
                  name="Invalid"
                  isAnimationActive={false}
                />
                <Bar 
                  dataKey="qualified" 
                  stackId="a" 
                  fill={COLORS.qualified} 
                  name="Qualified"
                  isAnimationActive={false}
                />
                <Bar 
                  dataKey="unqualified" 
                  stackId="a" 
                  fill={COLORS.unqualified} 
                  name="Unqualified"
                  isAnimationActive={false}
                />
                <Bar 
                  dataKey="new" 
                  stackId="a" 
                  fill={COLORS.new} 
                  name="Pending"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Onboarding Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Qualified Users Onboarding Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <Pie
                  data={onboardingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {onboardingData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Online' ? COLORS.onboarded : COLORS.notOnboarded} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Users']} contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Attendance Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Qualified Users Attendance</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {attendanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Attended' ? COLORS.attended : COLORS.notAttended} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Users']} contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Type Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Qualified Users Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {typeData.map((entry, index) => {
                    const type = entry.name.toLowerCase();
                    const value = COLORS[type as keyof typeof COLORS] || '#999999';
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={value} 
                      />
                    );
                  })}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Users']} contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

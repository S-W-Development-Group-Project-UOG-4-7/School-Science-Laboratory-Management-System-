import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to format time ago - define it at the module level
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}

export async function GET() {
  try {
    // Get real data from your seeded database
    const activeRequests = await prisma.inventoryRequest.count({
      where: { status: 'Pending' }
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const labSessionsToday = await prisma.labSchedule.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        },
        status: 'Scheduled'
      }
    })

    const inventoryItems = await prisma.inventoryItem.count()

    // Get recent activity (last 5 activities)
    const recentActivity = await prisma.activityLog.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    // Format the response to match your UI
    return NextResponse.json({
      stats: {
        activeRequests,
        labSessionsToday,
        inventoryItems,
        fundingRequests: 8 // You can make this dynamic later
      },
      recentActivity: recentActivity.map(activity => ({
        action: activity.action,
        details: activity.details,
        timestamp: formatTimeAgo(activity.timestamp), // CORRECTED: Remove "this."
        user: activity.user.name
      })),
      quickActions: [
        { id: 1, title: 'Review Requests', icon: '📋', link: '/inventory-requests' },
        { id: 2, title: 'View Schedule', icon: '📅', link: '/schedule' },
        { id: 3, title: 'Inventory Overview', icon: '📦', link: '/inventory' }
      ]
    })
    
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
// CORRECTED: Removed "this." from formatTimeAgo function call
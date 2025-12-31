import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const requests = await prisma.inventoryRequest.findMany({
      where: status ? { status } : {},
      include: {
        user: {
          select: { name: true, role: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get counts for the stats cards
    const pendingCount = await prisma.inventoryRequest.count({
      where: { status: 'Pending' }
    })
    
    const approvedCount = await prisma.inventoryRequest.count({
      where: { status: 'Approved' }
    })
    
    const rejectedCount = await prisma.inventoryRequest.count({
      where: { status: 'Rejected' }
    })

    return NextResponse.json({
      requests: requests.map(request => ({
        id: request.id,
        itemName: request.itemName,
        quantity: request.quantity,
        priority: request.priority,
        status: request.status,
        reason: request.reason,
        response: request.response,
        requestedBy: request.user.name,
        userRole: request.user.role,
        createdAt: request.createdAt
      })),
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      }
    })
    
  } catch (error) {
    console.error('Requests API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}

// PUT to approve/reject a request
export async function PUT(request: NextRequest) {
  try {
    const { id, action, response } = await request.json()
    
    const updatedRequest = await prisma.inventoryRequest.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'Approved' : 'Rejected',
        response,
        updatedAt: new Date()
      },
      include: { user: true }
    })

    // Log this activity
    await prisma.activityLog.create({
      data: {
        userId: updatedRequest.requestedBy,
        action: `Request ${action}d`,
        details: `${action}d inventory request for ${updatedRequest.itemName}`,
        timestamp: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      request: updatedRequest
    })
    
  } catch (error) {
    console.error('Update request error:', error)
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    )
  }
}
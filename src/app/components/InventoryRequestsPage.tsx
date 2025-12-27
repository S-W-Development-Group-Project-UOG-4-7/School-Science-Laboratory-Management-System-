'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import useSWR from 'swr';
import { 
  PackagePlus, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail,
  AlertCircle 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { toast } from 'sonner';

interface InventoryRequest {
  id: string;
  requesterName: string;
  requesterRole: string;
  requesterId: string;
  itemName: string;
  quantity: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  responseDate?: string;
  responseNote?: string;
}

interface InventoryRequestsPageProps {
  userRole: string;
  userId: string;
  userName: string;
}

// Mock data
const mockRequests: InventoryRequest[] = [
  {
    id: 'req-001',
    requesterName: 'Mr. Perera',
    requesterRole: 'Teacher',
    requesterId: 'teacher-001',
    itemName: 'Beakers (250ml)',
    quantity: 20,
    reason: 'Chemistry practical session for Grade 10 students scheduled next week',
    urgency: 'high',
    status: 'pending',
    requestDate: '2025-11-26',
  },
  {
    id: 'req-002',
    requesterName: 'Lab Assistant Kumar',
    requesterRole: 'Lab Assistant',
    requesterId: 'lab-001',
    itemName: 'Microscope Slides',
    quantity: 50,
    reason: 'Current stock running low, needed for Biology practicals',
    urgency: 'medium',
    status: 'approved',
    requestDate: '2025-11-25',
    responseDate: '2025-11-25',
    responseNote: 'Approved. Purchase order initiated.',
  },
  {
    id: 'req-003',
    requesterName: 'Mrs. Fernando',
    requesterRole: 'Teacher',
    requesterId: 'teacher-002',
    itemName: 'Safety Goggles',
    quantity: 30,
    reason: 'Additional safety equipment needed for expanded class size',
    urgency: 'high',
    status: 'approved',
    requestDate: '2025-11-24',
    responseDate: '2025-11-24',
    responseNote: 'Approved. Safety is priority.',
  },
];

export function InventoryRequestsPage({ userRole, userId, userName }: InventoryRequestsPageProps) {
  const fetcher = (url: string) => fetch(url).then(res => res.json());

const { data: requests, error, mutate } = useSWR<InventoryRequest[]>(
  '/api/inventory-requests',
  fetcher
);
if (error) return <div>Failed to load requests</div>;
if (!requests) return <div>Loading requests...</div>;
  const [newRequest, setNewRequest] = useState({
    itemName: '',
    quantity: 1,
    reason: '',
    urgency: 'medium' as const,
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const canCreateRequest = userRole === 'teacher' || userRole === 'lab-assistant';
  const canApproveRequest = userRole === 'principal';

  const handleCreateRequest = () => {
    const request: InventoryRequest = {
      id: `req-${Date.now()}`,
      requesterName: userName,
      requesterRole: userRole === 'teacher' ? 'Teacher' : 'Lab Assistant',
      requesterId: userId,
      itemName: newRequest.itemName,
      quantity: newRequest.quantity,
      reason: newRequest.reason,
      urgency: newRequest.urgency,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
    };

  mutate([request, ...requests], false);

  setNewRequest({ itemName: '', quantity: 1, reason: '', urgency: 'medium' });
  setIsDialogOpen(false);
    
    // Mock email notification
    toast.success('Request Sent Successfully', {
      description: 'Your inventory request has been sent to the principal via email and portal.',
    });
  };

  const handleApproveRequest = (requestId: string) => {
    mutate(requests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: 'approved', 
            responseDate: new Date().toISOString().split('T')[0],
            responseNote: 'Approved by Principal'
          } 
        : req
    ));
    
    toast.success('Request Approved', {
      description: 'Email notification sent to the requester.',
    });
  };

const handleRejectRequest = (requestId: string) => {
  mutate(
    requests.map(req =>
      req.id === requestId
        ? {
            ...req,
            status: 'rejected',
            responseDate: new Date().toISOString().split('T')[0],
            responseNote: 'Not approved at this time',
          }
        : req
    ),
    false
  );
    
    toast.error('Request Rejected', {
      description: 'Email notification sent to the requester.',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Filter requests based on user role
  const displayRequests = canApproveRequest 
    ? requests 
    : requests.filter(req => req.requesterId === userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-blue-900 mb-2">Inventory Requests</h1>
          <p className="text-gray-600">
            {canApproveRequest 
              ? 'Review and manage inventory requests from staff'
              : 'Submit and track your inventory requests'}
          </p>
        </div>
        
        {canCreateRequest && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <PackagePlus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Inventory Request</DialogTitle>
                <DialogDescription>
                  Submit a request to the principal for new inventory items
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    placeholder="e.g., Beakers (250ml)"
                    value={newRequest.itemName}
                    onChange={(e) => setNewRequest({ ...newRequest, itemName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newRequest.quantity}
                    onChange={(e) => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <select
                    id="urgency"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newRequest.urgency}
                    onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value as any })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Request</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain why this item is needed..."
                    rows={4}
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRequest}
                  disabled={!newRequest.itemName || !newRequest.reason}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl text-yellow-700">
                    {displayRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-yellow-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl text-green-700">
                    {displayRequests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rejected</p>
                  <p className="text-3xl text-red-700">
                    {displayRequests.filter(r => r.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="w-10 h-10 text-red-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {displayRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No inventory requests found</p>
            </CardContent>
          </Card>
        ) : (
          displayRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <CardTitle className="text-blue-900">{request.itemName}</CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2 flex-wrap">
                        <span>{request.requesterName} ({request.requesterRole})</span>
                        <span>•</span>
                        <span>Qty: {request.quantity}</span>
                        <span>•</span>
                        <Badge className={getUrgencyColor(request.urgency)} variant="outline">
                          {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.requestDate}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-700 mb-1">Reason:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {request.reason}
                      </p>
                    </div>

                    {request.responseNote && (
                      <div>
                        <p className="text-sm text-gray-700 mb-1">Response:</p>
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
                          {request.responseNote}
                          {request.responseDate && (
                            <span className="block mt-1 text-xs text-gray-500">
                              {request.responseDate}
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {canApproveRequest && request.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-auto"
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Send Email
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
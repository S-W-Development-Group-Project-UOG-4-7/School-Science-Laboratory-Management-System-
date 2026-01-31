'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';

import {
  PackagePlus,
  CheckCircle,
  XCircle,
  Clock,
  PauseCircle,
  AlertCircle,
  
  User,
  FlaskConical,
  Bell,
  
  BellRing,
 
  AlertTriangle,
  
  Calendar,
  
  Send,

} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

// --------------------
// Types (UI-side)
// --------------------
type UIUrgency = 'low' | 'medium' | 'high';
type UIStatus = 'pending' | 'approved' | 'rejected' | 'on-hold';

interface InventoryRequest {
  id: string;
  requesterName: string;
  requesterRole: string;
  requesterId: string;
  requesterEmail?: string;
  itemName: string;
  quantity: number;
  reason: string;
  urgency: UIUrgency;
  status: UIStatus;
  requestDate: string;
  responseDate?: string;
  responseNote?: string;
}

interface NotificationUI {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  requestId?: string;
  senderName: string;
  senderRole: string;
}

interface InventoryRequestsPageProps {
  userRole: string;
  userId: string;
  userName: string;
  userEmail: string;
}

// --------------------
// Helpers
// --------------------
function roleToHeaderRole(userRole: string) {
  const r = userRole.toLowerCase();
  if (r === 'principal') return 'PRINCIPAL';
  if (r === 'admin') return 'ADMIN';
  if (r === 'teacher') return 'TEACHER';
  if (r === 'lab-assistant') return 'LAB_ASSISTANT';
  if (r === 'student') return 'STUDENT';
  return userRole.toUpperCase();
}

function safeJson<T>(res: Response): Promise<T> {
  return res.json().catch(() => {
    throw new Error('Server did not return JSON (maybe wrong API route or 404)');
  });
}

// DB status -> UI status
function dbToUiStatus(dbStatus: string): UIStatus {
  if (dbStatus === 'in_progress') return 'on-hold';
  if (dbStatus === 'pending') return 'pending';
  if (dbStatus === 'approved') return 'approved';
  if (dbStatus === 'rejected') return 'rejected';
  return 'pending';
}

export function InventoryRequestsPage({ userRole, userId, userName, userEmail }: InventoryRequestsPageProps) {
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationUI[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [notifyRequester, setNotifyRequester] = useState(true);


  const [newRequest, setNewRequest] = useState({
    itemName: '',
    quantity: 1,
    reason: '',
    urgency: 'medium' as UIUrgency,
    expectedDate: '',
  });

  // Roles
  const canCreateRequest = userRole.toLowerCase() === 'lab-assistant';
  const canApproveRequest = userRole.toLowerCase() === 'principal' || userRole.toLowerCase() === 'admin';
  const canSendNotification = canApproveRequest;

  // --------------------
  // Loaders
  // --------------------
  async function loadRequests() {
    const res = await fetch('/api/inventory/requests', {
      method: 'GET',
      headers: {
        'x-user-role': roleToHeaderRole(userRole),
        'x-user-id': userId,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || `Failed to load requests (${res.status})`);
    }

    const data = await safeJson<any[]>(res);

    // If your backend already returns UI-ready fields, this still works.
    // If it returns prisma shapes, adjust here.
    const mapped: InventoryRequest[] = (Array.isArray(data) ? data : []).map((r: any) => ({
      id: r.id,
      requesterName: r.requesterName ?? r.requestedBy?.name ?? 'Unknown',
      requesterRole: r.requesterRole ?? r.requestedBy?.role ?? 'Lab Assistant',
      requesterId: r.requesterId ?? r.requestedById ?? r.requestedBy?.id ?? '',
      requesterEmail: r.requesterEmail ?? r.requestedBy?.email,
      itemName: r.itemName ?? r.item?.name ?? 'Item',
      quantity: r.quantity,
      reason: r.reason,
      urgency: (r.urgency ?? r.priority ?? 'medium') as UIUrgency,
      status: dbToUiStatus(r.status),
      requestDate: r.requestDate ?? (r.createdAt ? String(r.createdAt).slice(0, 10) : ''),
      responseDate:
        r.approvedDate ? String(r.approvedDate).slice(0, 10) :
        r.rejectedDate ? String(r.rejectedDate).slice(0, 10) :
        undefined,
      responseNote: r.notes ?? r.responseNote ?? undefined,
    }));

    setRequests(mapped);
  }

  async function loadNotifications() {
    const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || `Failed to load notifications (${res.status})`);
    }

    const data = await safeJson<NotificationUI[]>(res);
    setNotifications(Array.isArray(data) ? data : []);
  }

  async function refreshAll() {
    setLoading(true);
    try {
      await Promise.all([loadRequests(), loadNotifications()]);
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to load data', { description: e?.message ?? 'Unknown error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------
  // Actions
  // --------------------
  async function patchRequest(requestId: string, action: 'approve' | 'reject' | 'hold', note?: string) {
    const res = await fetch(`/api/inventory/requests/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': roleToHeaderRole(userRole),
        'x-user-id': userId,
      },
      body: JSON.stringify({ action, note }),
    });

    if (!res.ok) {
      // IMPORTANT: if route is wrong, Next sends HTML. This avoids dumping it.
      const text = await res.text().catch(() => '');
      const clean = text?.includes('<!DOCTYPE') ? 'API route not found (404). Check /api/inventory/requests/[id]/route.ts' : text;
      throw new Error(clean || `Update failed (${res.status})`);
    }

    await safeJson(res);
    await loadRequests();
    if (notifyRequester) await loadNotifications();
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      await patchRequest(requestId, 'approve');
      toast.success('Request Approved');
    } catch (e: any) {
      toast.error('Approve failed', { description: e?.message ?? 'Unknown error' });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await patchRequest(requestId, 'reject');
      toast.error('Request Rejected');
    } catch (e: any) {
      toast.error('Reject failed', { description: e?.message ?? 'Unknown error' });
    }
  };

  const handleMarkOnHold = async (requestId: string) => {
    try {
      await patchRequest(requestId, 'hold');
      toast.info('Marked as On Hold');
    } catch (e: any) {
      toast.error('Hold failed', { description: e?.message ?? 'Unknown error' });
    }
  };

  // Notification dialog
  const handleSendNotification = (request: InventoryRequest) => {
    setSelectedRequest(request);

    let defaultMessage = '';
    if (request.status === 'approved') {
      defaultMessage = `Your request for ${request.quantity} x ${request.itemName} has been approved.`;
    } else if (request.status === 'rejected') {
      defaultMessage = `Your request for ${request.quantity} x ${request.itemName} cannot be approved at this time.`;
    } else if (request.status === 'on-hold') {
      defaultMessage = `Your request for ${request.quantity} x ${request.itemName} is being processed.`;
    } else {
      defaultMessage = `Update regarding your inventory request for ${request.quantity} x ${request.itemName}.`;
    }

    setNotificationMessage(defaultMessage);
    setIsNotifyDialogOpen(true);
  };

  async function sendNotification() {
    if (!selectedRequest) return;

    try {
      const prismaType =
        selectedRequest.status === 'approved'
          ? 'approval'
          : selectedRequest.status === 'rejected'
          ? 'rejection'
          : 'request';

      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedRequest.requesterId,
          title: `Request ${selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}`,
          message: notificationMessage,
          type: prismaType,
          requestId: selectedRequest.id,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const clean = text?.includes('<!DOCTYPE') ? 'Notifications API route not found' : text;
        throw new Error(clean || `Failed to send (${res.status})`);
      }

      toast.success('Notification Sent', {
        description: `Sent to ${selectedRequest.requesterName}`,
        duration: 2500,
      });

      setIsNotifyDialogOpen(false);
      setSelectedRequest(null);
      setNotificationMessage('');

      await loadNotifications();
    } catch (e: any) {
      toast.error('Notification failed', { description: e?.message ?? 'Unknown error' });
    }
  }

  // Create Request (UI only)
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Create Request is UI only', {
      description: 'If you want to save to DB, we need POST /api/inventory/requests.',
    });

    setIsDialogOpen(false);
    setNewRequest({
      itemName: '',
      quantity: 1,
      reason: '',
      urgency: 'medium',
      
      expectedDate: '',
    
    });
  
  };

  // --------------------
  // UI helpers
  // --------------------
  const getStatusColor = (status: UIStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'on-hold':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: UIStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-3 h-3" />;
      case 'rejected':
        return <XCircle className="w-3 h-3" />;
      case 'on-hold':
        return <PauseCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getUrgencyColor = (urgency: UIUrgency) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getUrgencyIcon = (urgency: UIUrgency) => {
    switch (urgency) {
      case 'high':
        return <AlertTriangle className="w-3 h-3" />;
      case 'medium':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Bell className="w-3 h-3" />;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const userNotifications = useMemo(() => notifications.filter((n) => n.userId === userId), [notifications, userId]);
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => (n.userId === userId ? { ...n, read: true } : n)));
    toast.info('All notifications marked as read (UI only)');
  };

  const filteredRequests = requests
    .filter((r) => (selectedTab === 'all' ? true : r.status === selectedTab))
    .filter((r) => (filterUrgency === 'all' ? true : r.urgency === filterUrgency));

  const displayRequests = canApproveRequest ? filteredRequests : filteredRequests.filter((r) => r.requesterId === userId);

  const stats = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      onHold: requests.filter((r) => r.status === 'on-hold').length,
    }),
    [requests]
  );

  return (
    <div className="space-y-6">
      {/* Notification dialog */}
      <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-white border-2 border-gray-300 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Bell className="w-5 h-5" />
              Send Notification
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Send an in-app notification to the requester about their inventory request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-2">
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{selectedRequest.requesterName}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <span className="bg-blue-50 px-2 py-1 rounded">{selectedRequest.requesterRole}</span>
                      <span>•</span>
                      <span className="text-blue-600">ID: {selectedRequest.requesterId}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Request Details:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Item</p>
                      <p className="text-sm font-medium text-gray-900">{selectedRequest.itemName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Quantity</p>
                      <p className="text-sm font-medium text-gray-900">{selectedRequest.quantity} units</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Reason</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">{selectedRequest.reason}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Request Date</p>
                      <p className="text-sm text-gray-900">{selectedRequest.requestDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {getStatusIcon(selectedRequest.status)}
                        <span className="ml-1">{selectedRequest.status}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationMessage" className="text-sm font-medium text-gray-700">
                  Notification Message
                </Label>
                <Textarea
                  id="notificationMessage"
                  rows={6}
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  className="font-sans text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Type your notification message here..."
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" className="border-gray-300 hover:border-gray-400">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={sendNotification} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
              <Bell className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Inventory Requests</h1>
          <p className="text-gray-600">
            {canApproveRequest ? 'Review and manage inventory requests' : 'View inventory requests'}
          </p>
          {loading && <p className="text-sm text-gray-500 mt-1">Loading...</p>}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {canApproveRequest && (
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Notify requester:</span>
              <Switch checked={notifyRequester} onCheckedChange={setNotifyRequester} className="data-[state=checked]:bg-green-600" />
            </div>
          )}

          <Button variant="outline" className="border-gray-300 hover:border-gray-400" onClick={refreshAll}>
            Refresh
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative border-gray-300 hover:border-gray-400">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-96 p-0 bg-white border-gray-300 shadow-xl">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {userNotifications.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800">
                      Mark all as read
                    </Button>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {userNotifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {userNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getNotificationTypeColor(notification.type)}`}>
                            {getNotificationTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-gray-900">{notification.title}</h4>
                              {!notification.read && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                From: {notification.senderName} ({notification.senderRole})
                              </span>
                              <span className="text-xs text-gray-500">{notification.timestamp}</span>
                            </div>
                         
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            
            </PopoverContent>
         
          </Popover>
        
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: stats.pending, color: 'yellow', icon: Clock },
          { label: 'Approved', value: stats.approved, color: 'green', icon: CheckCircle },
          { label: 'Rejected', value: stats.rejected, color: 'red', icon: XCircle },
          { label: 'On Hold', value: stats.onHold, color: 'blue', icon: PauseCircle },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
            <Card className={`border-${stat.color}-200 bg-${stat.color}-50/50`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-700`}>{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 bg-${stat.color}-100 rounded-full flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs + Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-white">
                All Requests
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700">
                Pending
              </TabsTrigger>
              <TabsTrigger value="on-hold" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                On Hold
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={filterUrgency} onValueChange={setFilterUrgency}>
            <SelectTrigger className="w-full sm:w-40 bg-white">
              <SelectValue placeholder="Filter by urgency" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300">
              <SelectItem value="all">All Urgency</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {displayRequests.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No inventory requests found</p>
            </CardContent>
          </Card>
        ) : (
          displayRequests.map((request, index) => (
            <motion.div key={request.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
              <Card className="border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FlaskConical className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <CardTitle className="text-lg text-gray-900">{request.itemName}</CardTitle>
                            <Badge className={getUrgencyColor(request.urgency)}>
                              {getUrgencyIcon(request.urgency)}
                              <span className="ml-1">{request.urgency} Priority</span>
                            </Badge>
             
                          </div>

                          <CardDescription className="flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {request.requesterName} ({request.requesterRole})
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {request.requestDate}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="font-medium">Qty: {request.quantity}</span>
                          </CardDescription>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </Badge>
                      {request.responseDate && <span className="text-xs text-gray-500">Updated: {request.responseDate}</span>}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">{request.reason}</p>
                    </div>

                    {request.responseNote && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Response:</p>
                        <p
                          className={`text-sm p-3 rounded-lg border ${
                            request.status === 'approved'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : request.status === 'rejected'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {request.responseNote}
                        </p>
                      </div>
                    )}

                    {/* Buttons logic:
                        ✅ Approve/Reject/Hold only when pending
                        ✅ After approved/rejected/on-hold → only Send Notification remains
                    */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {canApproveRequest && request.status === 'pending' && (
                        <>
                          <Button onClick={() => handleMarkOnHold(request.id)} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                            <PauseCircle className="w-4 h-4 mr-2" />
                            Mark On Hold
                          </Button>

                          <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800" onClick={() => handleApproveRequest(request.id)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>

                          <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-300" onClick={() => handleRejectRequest(request.id)}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}

                      {canSendNotification && (
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" onClick={() => handleSendNotification(request)}>
                          <Bell className="w-4 h-4 mr-2" />
                          Send Notification
                        </Button>
                      )}

                      {userNotifications.some((n) => n.requestId === request.id && !n.read) && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <BellRing className="w-3 h-3 mr-1" />
                          New Notification
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* ✅ IMPORTANT: removed TabsContent to prevent crash */}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Check,
  User,
  FlaskConical,
  Bell,
  BellRing,
  Inbox,
  MessageSquare,
 
  TrendingUp,
  
  AlertTriangle,
 
  Calendar,
  Archive,
  Send,
  Eye,
  EyeOff
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface InventoryRequest {
  id: string;
  requesterName: string;
  requesterRole: string;
  requesterId: string;
  requesterEmail: string;
  itemName: string;
  quantity: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'on-hold';
  requestDate: string;
  responseDate?: string;
  responseNote?: string;
}

interface Notification {
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

// Updated mock data without email fields
const mockRequests: InventoryRequest[] = [
  {
    id: 'req-001',
    requesterName: 'Lab Assistant Perera',
    requesterRole: 'Lab Assistant',
    requesterId: 'lab-001',
    requesterEmail: 'perera.lab@school.edu',
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
    requesterId: 'lab-002',
    requesterEmail: 'kumar.lab@school.edu',
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
    requesterName: 'Lab Assistant Fernando',
    requesterRole: 'Lab Assistant',
    requesterId: 'lab-003',
    requesterEmail: 'fernando.lab@school.edu',
    itemName: 'Safety Goggles',
    quantity: 30,
    reason: 'Additional safety equipment needed for expanded class size',
    urgency: 'high',
    status: 'on-hold',
    requestDate: '2025-11-24',
    responseDate: '2025-11-24',
    responseNote: 'Processing. Checking stock availability.',
  
  },
  {
    id: 'req-004',
    requesterName: 'Lab Assistant Silva',
    requesterRole: 'Lab Assistant',
    requesterId: 'lab-004',
    requesterEmail: 'silva.lab@school.edu',
    itemName: 'Bunsen Burners',
    quantity: 10,
    reason: 'Replace old equipment for physics lab',
    urgency: 'medium',
    status: 'rejected',
    requestDate: '2025-11-23',
    responseDate: '2025-11-23',
    responseNote: 'Rejected. Budget constraints for this quarter.',
  },
];

// Initial notifications
const initialNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'lab-002',
    title: 'Request Approved',
    message: 'Your request for 50x Microscope Slides has been approved. Purchase order initiated.',
    type: 'success',
    timestamp: '2025-11-25 14:30',
    read: false,
    requestId: 'req-002',
    senderName: 'Principal Johnson',
    senderRole: 'Principal'
  },
  {
    id: 'notif-002',
    userId: 'lab-003',
    title: 'Request On Hold',
    message: 'Your request for 30x Safety Goggles is being processed. Checking stock availability.',
    type: 'info',
    timestamp: '2025-11-24 10:15',
    read: false,
    requestId: 'req-003',
    senderName: 'Lab Manager Smith',
    senderRole: 'Lab Manager'
  },
  {
    id: 'notif-003',
    userId: 'lab-004',
    title: 'Request Rejected',
    message: 'Your request for 10x Bunsen Burners was rejected due to budget constraints.',
    type: 'error',
    timestamp: '2025-11-23 16:45',
    read: true,
    requestId: 'req-004',
    senderName: 'Principal Johnson',
    senderRole: 'Principal'
  },
];

export function InventoryRequestsPage({ userRole, userId, userName, userEmail }: InventoryRequestsPageProps) {
  const [requests, setRequests] = useState<InventoryRequest[]>(mockRequests);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
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
    urgency: 'medium' as const,
    priority: 'normal',
    expectedDate: '',
  
  });

  // ONLY lab assistants can create requests
  const canCreateRequest = userRole === 'lab-assistant';
  
  // Principals, lab managers, and admins can approve requests
  const canApproveRequest = userRole === 'principal' || userRole === 'lab-manager' || userRole === 'admin';
  // Principals, lab managers, and admins can send notifications
  const canSendNotification = userRole === 'principal' || userRole === 'lab-manager' || userRole === 'admin';
  // Function to handle sending notification
  const handleSendNotification = (request: InventoryRequest) => {
    setSelectedRequest(request);
   
    
    
    // Pre-fill notification message based on request status
    let defaultMessage = '';
    if (request.status === 'approved') {
      defaultMessage = `Your request for ${request.quantity} x ${request.itemName} has been approved. You will be notified once the items are available for collection.`;
    } else if (request.status === 'rejected') {
      defaultMessage = `Your request for ${request.quantity} x ${request.itemName} cannot be approved at this time. You may revise and resubmit your request if needed.`;
    } else if (request.status === 'on-hold') {
      defaultMessage = `Your request for ${request.quantity} x ${request.itemName} is being processed. We will update you once there's progress.`;
    } else {
      defaultMessage = `Update regarding your inventory request for ${request.quantity} x ${request.itemName}. We will notify you once there's an update.`;
    }
    
    setNotificationMessage(defaultMessage);
    setIsNotifyDialogOpen(true);
  };

  // Function to actually send the notification
  const sendNotification = () => {
    if (!selectedRequest) return;

    const notificationType = selectedRequest.status === 'approved' ? 'success' :
                            selectedRequest.status === 'rejected' ? 'error' :
                            selectedRequest.status === 'on-hold' ? 'info' : 'warning';

    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      userId: selectedRequest.requesterId,
      title: `Request ${selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}`,
      message: notificationMessage,
      type: notificationType,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: false,
      requestId: selectedRequest.id,
      senderName: userName,
      senderRole: userRole === 'principal' ? 'Principal' : userRole === 'lab-manager' ? 'Lab Manager' : 'Administrator'
    };

    setNotifications(prev => [newNotification, ...prev]);

    toast.success('Notification Sent', {
      description: `Notification sent to ${selectedRequest.requesterName}`,
      duration: 3000,
      action: {
        label: 'View',
        onClick: () => {
          // Mark as read and optionally scroll to notification
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === newNotification.id ? { ...notif, read: true } : notif
            )
          );
        }
      }
    });

    setIsNotifyDialogOpen(false);
    setSelectedRequest(null);
    setNotificationMessage('');
  };

  const handleApproveRequest = (requestId: string) => {
    setRequests(prevRequests => {
      const request = prevRequests.find(req => req.id === requestId);
      if (!request) return prevRequests;

      const updatedRequest: InventoryRequest = {
        ...request,
        status: 'approved',
        responseDate: new Date().toISOString().split('T')[0],
        responseNote: 'Approved by ' + userName,
      
      };

      const updatedRequests = prevRequests.map(req => 
        req.id === requestId ? updatedRequest : req
      );

      // Send automatic notification
      if (notifyRequester) {
        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          userId: request.requesterId,
          title: 'Request Approved',
          message: `Your request for ${request.quantity} x ${request.itemName} has been approved by ${userName}.`,
          type: 'success',
          timestamp: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          read: false,
          requestId: request.id,
          senderName: userName,
          senderRole: userRole === 'principal' ? 'Principal' : userRole === 'lab-manager' ? 'Lab Manager' : 'Administrator'
        };

        setNotifications(prev => [newNotification, ...prev]);
      }

      toast.success('Request Approved', {
        description: notifyRequester 
          ? `Approved and notification sent to ${request.requesterName}`
          : `Approved request for ${request.itemName}`,
        duration: 3000,
      });
      
      return updatedRequests;
    });
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(prevRequests => {
      const request = prevRequests.find(req => req.id === requestId);
      if (!request) return prevRequests;

      const updatedRequest: InventoryRequest = {
        ...request,
        status: 'rejected',
        responseDate: new Date().toISOString().split('T')[0],
        responseNote: 'Not approved at this time',
      
      };

      const updatedRequests = prevRequests.map(req => 
        req.id === requestId ? updatedRequest : req
      );

      // Send automatic notification
      if (notifyRequester) {
        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          userId: request.requesterId,
          title: 'Request Rejected',
          message: `Your request for ${request.quantity} x ${request.itemName} was not approved at this time.`,
          type: 'error',
          timestamp: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          read: false,
          requestId: request.id,
          senderName: userName,
          senderRole: userRole === 'principal' ? 'Principal' : userRole === 'lab-manager' ? 'Lab Manager' : 'Administrator'
        };

        setNotifications(prev => [newNotification, ...prev]);
      }
      
      toast.error('Request Rejected', {
        description: notifyRequester 
          ? `Rejected and notified ${request.requesterName}`
          : `Rejected request for ${request.itemName}`,
        duration: 3000,
      });
      
      return updatedRequests;
    });
  };

  const handleMarkOnHold = (requestId: string) => {
    setRequests(prevRequests => {
      const request = prevRequests.find(req => req.id === requestId);
      if (!request) return prevRequests;

      const updatedRequest: InventoryRequest = {
        ...request,
        status: 'on-hold',
        responseDate: new Date().toISOString().split('T')[0],
        responseNote: 'Request is being processed',
      
      };

      const updatedRequests = prevRequests.map(req => 
        req.id === requestId ? updatedRequest : req
      );

      // Send automatic notification
      if (notifyRequester) {
        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          userId: request.requesterId,
          title: 'Request On Hold',
          message: `Your request for ${request.quantity} x ${request.itemName} is being processed. We will update you soon.`,
          type: 'info',
          timestamp: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          read: false,
          requestId: request.id,
          senderName: userName,
          senderRole: userRole === 'principal' ? 'Principal' : userRole === 'lab-manager' ? 'Lab Manager' : 'Administrator'
        };

        setNotifications(prev => [newNotification, ...prev]);
      }
      
      toast.info('Marked as On Hold', {
        description: `Processing request for ${request.itemName}`,
        duration: 3000,
      });
      
      return updatedRequests;
    });
  };
  
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequestObj: InventoryRequest = {
      id: `req-${Date.now()}`,
      requesterName: userName,
      requesterRole: 'Lab Assistant', // Always set to Lab Assistant since only they can create requests
      requesterId: userId,
      requesterEmail: userEmail,
      itemName: newRequest.itemName,
      quantity: newRequest.quantity,
      reason: newRequest.reason,
      urgency: newRequest.urgency,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
    };

    setRequests(prevRequests => [newRequestObj, ...prevRequests]);
    
    // Create notification for approvers
    const approverRoles = ['principal', 'lab-manager', 'admin'];
    const approverNotification: Notification = {
      id: `notif-${Date.now()}-approver`,
      userId: 'all-approvers', // In real app, would send to actual approver IDs
      title: 'New Inventory Request',
      message: `New request for ${newRequest.quantity} x ${newRequest.itemName} from ${userName}.`,
      type: 'info',
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: false,
      requestId: newRequestObj.id,
      senderName: userName,
      senderRole: 'Lab Assistant'
    };

    setIsDialogOpen(false);
    setNewRequest({ 
      itemName: '', 
      quantity: 1, 
      reason: '', 
      urgency: 'medium',
      priority: 'normal',
      expectedDate: '',
   
    });

    toast.success('Request Sent Successfully', {
      description: 'Your inventory request has been submitted for review.',
      icon: <CheckCircle className="w-4 h-4" />,
    });
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  const getUrgencyIcon = (urgency: string) => {
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

  // Get user's notifications
  const userNotifications = notifications.filter(notif => 
    notif.userId === userId || notif.userId === 'all-approvers'
  );

  // Get unread notification count
  const unreadCount = userNotifications.filter(notif => !notif.read).length;

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => 
        userNotifications.some(userNotif => userNotif.id === notif.id) 
          ? { ...notif, read: true } 
          : notif
      )
    );
    toast.info('All notifications marked as read');
  };

  // Filter requests based on selected tab
  const filteredRequests = requests.filter(request => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'pending') return request.status === 'pending';
    if (selectedTab === 'approved') return request.status === 'approved';
    if (selectedTab === 'rejected') return request.status === 'rejected';
    if (selectedTab === 'on-hold') return request.status === 'on-hold';
    return true;
  }).filter(request => {
    if (filterUrgency === 'all') return true;
    return request.urgency === filterUrgency;
  });

  // Filter requests based on user role
  const displayRequests = canApproveRequest 
    ? filteredRequests 
    : filteredRequests.filter(req => req.requesterId === userId);

  return (
    <div className="space-y-6">
      {/* Send Notification Dialog */}
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
              {/* Requester Info */}
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
                
                {/* Request Details */}
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

              {/* Notification Form */}
              <div className="space-y-4">
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

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Template Variables</h4>
                  <p className="text-xs text-blue-700">
                    You can use: {"{requester}"}, {"{item}"}, {"{quantity}"}, {"{status}"}, {"{date}"}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Bell className="w-4 h-4" />
                  <span>Notification will appear in the requester's notification panel</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" className="border-gray-300 hover:border-gray-400">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={sendNotification}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
            >
              <Bell className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Request Dialog - Only shown for lab assistants */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-white border-2 border-gray-300 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Inventory Request</DialogTitle>
            <DialogDescription>
              Submit a request to the principal for new inventory items
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRequest} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  placeholder="e.g., Beakers (250ml)"
                  value={newRequest.itemName}
                  onChange={(e) => setNewRequest({ ...newRequest, itemName: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newRequest.quantity}
                  onChange={(e) => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) || 1 })}
                  required
                  className="bg-white"
                />
              </div>
              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select 
                  value={newRequest.urgency} 
                  onValueChange={(value) => setNewRequest({ ...newRequest, urgency: value as any })}
                >
                  <SelectTrigger id="urgency" className="bg-white">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300">
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="expectedDate">Expected Need Date</Label>
                <Input
                  id="expectedDate"
                  type="date"
                  value={newRequest.expectedDate}
                  onChange={(e) => setNewRequest({ ...newRequest, expectedDate: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="reason">Reason for Request *</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why this item is needed..."
                  rows={4}
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>
         
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-300">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit"
                disabled={!newRequest.itemName || !newRequest.reason}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header with Notification Bell */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Inventory Requests</h1>
          <p className="text-gray-600">
            {canApproveRequest 
              ? 'Review and manage inventory requests from lab assistants'
              : canCreateRequest
              ? 'Submit and track your inventory requests'
              : 'View inventory requests (read-only)'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {canApproveRequest && (
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Notify requester:</span>
              <Switch 
                checked={notifyRequester}
                onCheckedChange={setNotifyRequester}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          )}
          
          {/* Notification Bell */}
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
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
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                From: {notification.senderName} ({notification.senderRole})
                              </span>
                              <span className="text-xs text-gray-500">{notification.timestamp}</span>
                            </div>
                            {notification.requestId && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // In a real app, this would navigate to the request
                                  const request = requests.find(r => r.id === notification.requestId);
                                  if (request) {
                                    setSelectedRequest(request);
                                  }
                                }}
                              >
                                View Request
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {userNotifications.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        // In a real app, this would navigate to a full notifications page
                        toast.info('All notifications loaded in this panel');
                      }}
                    >
                      See all
                    </Button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          {canCreateRequest && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
                  <PackagePlus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Pending', 
            value: requests.filter(r => r.status === 'pending').length,
            color: 'yellow',
            icon: Clock 
          },
          { 
            label: 'Approved', 
            value: requests.filter(r => r.status === 'approved').length,
            color: 'green',
            icon: CheckCircle 
          },
          { 
            label: 'Rejected', 
            value: requests.filter(r => r.status === 'rejected').length,
            color: 'red',
            icon: XCircle 
          },
          { 
            label: 'On Hold', 
            value: requests.filter(r => r.status === 'on-hold').length,
            color: 'blue',
            icon: PauseCircle 
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`border-${stat.color}-200 bg-${stat.color}-50/50`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold text-${stat.color}-700`}>
                      {stat.value}
                    </p>
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

      {/* Tabs and Filters */}
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

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
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
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {displayRequests.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {canCreateRequest 
                  ? 'You have no inventory requests yet. Create your first request!'
                  : 'No inventory requests found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          displayRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
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
                      {request.responseDate && (
                        <span className="text-xs text-gray-500">
                          Updated: {request.responseDate}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {request.reason}
                      </p>
                    </div>

                    {request.responseNote && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Response:</p>
                        <p className={`text-sm p-3 rounded-lg border ${
                          request.status === 'approved' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : request.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {request.responseNote}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {canApproveRequest && request.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleMarkOnHold(request.id)}
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <PauseCircle className="w-4 h-4 mr-2" />
                            Mark On Hold
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            onClick={() => handleApproveRequest(request.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-300"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}

                      {canSendNotification && (
                        <Button
                          variant="default"
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                          onClick={() => handleSendNotification(request)}
                        >
                          <Bell className="w-4 h-4 mr-2" />
                          Send Notification
                        </Button>
                      )}

                      {/* Show notification badge if user has unread notifications for this request */}
                      {userNotifications.some(n => 
                        n.requestId === request.id && !n.read && n.userId === request.requesterId
                      ) && (
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
    </div>
  );
}
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  PackagePlus, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail,
  AlertCircle,
  Check,
  User,
  FlaskConical,
  Eye,
  EyeOff,
  TrendingUp,
  FileText,
  Download,
  AlertTriangle,
  Bell,
  Calendar,
  Archive
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
  status: 'pending' | 'approved' | 'rejected' | 'in-progress';
  requestDate: string;
  responseDate?: string;
  responseNote?: string;
  emailSent?: boolean;
  emailSentTo?: string;
  emailSentAt?: string;
  attachments?: { name: string; url: string; size: string }[];
}

interface InventoryRequestsPageProps {
  userRole: string;
  userId: string;
  userName: string;
  userEmail: string;
}

// Mock data matching your image
const mockRequests: InventoryRequest[] = [
  {
    id: 'req-001',
    requesterName: 'Mr. Perera',
    requesterRole: 'Teacher',
    requesterId: 'teacher-001',
    requesterEmail: 'perera@school.edu',
    itemName: 'Beakers (250ml)',
    quantity: 20,
    reason: 'Chemistry practical session for Grade 10 students scheduled next week',
    urgency: 'high',
    status: 'pending',
    requestDate: '2025-11-26',
    attachments: [
      { name: 'lesson_plan.pdf', url: '/attachments/lesson_plan.pdf', size: '1.2 MB' },
      { name: 'student_list.csv', url: '/attachments/student_list.csv', size: '0.5 MB' }
    ]
  },
  {
    id: 'req-002',
    requesterName: 'Lab Assistant Kumar',
    requesterRole: 'Lab Assistant',
    requesterId: 'lab-001',
    requesterEmail: 'kumar.lab@school.edu',
    itemName: 'Microscope Slides',
    quantity: 50,
    reason: 'Current stock running low, needed for Biology practicals',
    urgency: 'medium',
    status: 'approved',
    requestDate: '2025-11-25',
    responseDate: '2025-11-25',
    responseNote: 'Approved. Purchase order initiated.',
    emailSent: true,
    emailSentTo: 'kumar.lab@school.edu',
    emailSentAt: '2025-11-25 14:30',
    attachments: [
      { name: 'inventory_report.pdf', url: '/attachments/inventory_report.pdf', size: '2.1 MB' }
    ]
  },
  {
    id: 'req-003',
    requesterName: 'Mrs. Fernando',
    requesterRole: 'Teacher',
    requesterId: 'teacher-002',
    requesterEmail: 'fernando@school.edu',
    itemName: 'Safety Goggles',
    quantity: 30,
    reason: 'Additional safety equipment needed for expanded class size',
    urgency: 'high',
    status: 'in-progress',
    requestDate: '2025-11-24',
    responseDate: '2025-11-24',
    responseNote: 'Processing. Checking stock availability.',
    emailSent: true,
    emailSentTo: 'fernando@school.edu',
    emailSentAt: '2025-11-24 10:15'
  },
  {
    id: 'req-004',
    requesterName: 'Mr. Silva',
    requesterRole: 'Teacher',
    requesterId: 'teacher-003',
    requesterEmail: 'silva@school.edu',
    itemName: 'Bunsen Burners',
    quantity: 10,
    reason: 'Replace old equipment for physics lab',
    urgency: 'medium',
    status: 'rejected',
    requestDate: '2025-11-23',
    responseDate: '2025-11-23',
    responseNote: 'Rejected. Budget constraints for this quarter.',
    emailSent: true,
    emailSentTo: 'silva@school.edu',
    emailSentAt: '2025-11-23 16:45'
  },
];

export function InventoryRequestsPage({ userRole, userId, userName, userEmail }: InventoryRequestsPageProps) {
  const [requests, setRequests] = useState<InventoryRequest[]>(mockRequests);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isViewEmailDialogOpen, setIsViewEmailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [notifyRequester, setNotifyRequester] = useState(true);
  const [emailSignature, setEmailSignature] = useState(`\n\nBest regards,\n${userName}\n${userRole === 'principal' ? 'School Principal' : userRole === 'lab-manager' ? 'Lab Manager' : 'Administrator'}`);
  
  const [newRequest, setNewRequest] = useState({
    itemName: '',
    quantity: 1,
    reason: '',
    urgency: 'medium' as const,
    priority: 'normal',
    expectedDate: '',
    attachments: [] as File[],
  });

  const canCreateRequest = userRole === 'teacher' || userRole === 'lab-assistant' || userRole === 'admin';
  const canApproveRequest = userRole === 'principal' || userRole === 'lab-manager' || userRole === 'admin';
  const canSendEmail = userRole === 'principal' || userRole === 'lab-manager' || userRole === 'admin';

  // Function to handle sending email
  const handleSendEmail = (request: InventoryRequest) => {
    setSelectedRequest(request);
    setEmailSubject(`Update on Your Inventory Request: ${request.itemName}`);
    
    // Pre-fill email content based on request status
    let defaultContent = '';
    if (request.status === 'approved') {
      defaultContent = `Dear ${request.requesterName},\n\nYour request for ${request.quantity} x ${request.itemName} has been approved.\n\nReason: ${request.reason}\n\nResponse: ${request.responseNote}\n\nYou will be notified once the items are available for collection.\n\nRequest ID: ${request.id}\nRequest Date: ${request.requestDate}`;
    } else if (request.status === 'rejected') {
      defaultContent = `Dear ${request.requesterName},\n\nRegarding your request for ${request.quantity} x ${request.itemName}:\n\nWe regret to inform you that this request cannot be approved at this time.\n\nReason for rejection: ${request.responseNote}\n\nYou may revise and resubmit your request if needed.\n\nRequest ID: ${request.id}\nRequest Date: ${request.requestDate}`;
    } else {
      defaultContent = `Dear ${request.requesterName},\n\nThis is an update regarding your inventory request for ${request.quantity} x ${request.itemName}.\n\nCurrent Status: ${request.status}\n\nWe will notify you once there's an update.\n\nRequest ID: ${request.id}\nRequest Date: ${request.requestDate}`;
    }
    
    setEmailContent(defaultContent + emailSignature);
    setIsEmailDialogOpen(true);
  };

  // Function to actually send the email
  const sendEmail = () => {
    if (!selectedRequest) return;

    // Update request with email sent info
    setRequests(prevRequests => prevRequests.map(req => 
      req.id === selectedRequest.id 
        ? { 
            ...req, 
            emailSent: true,
            emailSentTo: req.requesterEmail,
            emailSentAt: new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          } 
        : req
    ));

    toast.success('Email Sent Successfully', {
      description: `Email sent to ${selectedRequest.requesterName} (${selectedRequest.requesterEmail})`,
      icon: <Mail className="w-4 h-4" />,
      duration: 4000,
      action: {
        label: 'View',
        onClick: () => {
          setSelectedRequest(selectedRequest);
          setIsViewEmailDialogOpen(true);
        }
      }
    });

    // In a real app, you would send the email via API here
    console.log('Email sent:', {
      to: selectedRequest.requesterEmail,
      subject: emailSubject,
      body: emailContent,
      requestId: selectedRequest.id
    });

    setIsEmailDialogOpen(false);
    setSelectedRequest(null);
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
        emailSent: notifyRequester,
        emailSentTo: notifyRequester ? request.requesterEmail : undefined,
        emailSentAt: notifyRequester ? new Date().toLocaleString() : undefined
      };

      const updatedRequests = prevRequests.map(req => 
        req.id === requestId ? updatedRequest : req
      );
      
      toast.success('Request Approved', {
        description: notifyRequester 
          ? `Approved and email sent to ${request.requesterName}`
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
        emailSent: notifyRequester,
        emailSentTo: notifyRequester ? request.requesterEmail : undefined,
        emailSentAt: notifyRequester ? new Date().toLocaleString() : undefined
      };

      const updatedRequests = prevRequests.map(req => 
        req.id === requestId ? updatedRequest : req
      );
      
      toast.error('Request Rejected', {
        description: notifyRequester 
          ? `Rejected and notified ${request.requesterName}`
          : `Rejected request for ${request.itemName}`,
        duration: 3000,
      });
      
      return updatedRequests;
    });
  };

  const handleMarkInProgress = (requestId: string) => {
    setRequests(prevRequests => {
      const request = prevRequests.find(req => req.id === requestId);
      if (!request) return prevRequests;

      const updatedRequest: InventoryRequest = {
        ...request,
        status: 'in-progress',
        responseDate: new Date().toISOString().split('T')[0],
        responseNote: 'Request is being processed',
        emailSent: notifyRequester,
        emailSentTo: notifyRequester ? request.requesterEmail : undefined,
        emailSentAt: notifyRequester ? new Date().toLocaleString() : undefined
      };

      const updatedRequests = prevRequests.map(req => 
        req.id === requestId ? updatedRequest : req
      );
      
      toast.info('Marked as In Progress', {
        description: `Processing request for ${request.itemName}`,
        duration: 3000,
      });
      
      return updatedRequests;
    });
  };

  const handleDownloadAttachment = (attachment: { name: string; url: string; size: string }) => {
    toast.info('Download Started', {
      description: `Downloading ${attachment.name}`,
      duration: 2000,
    });
    
    // In a real app, this would download the file
    console.log(`Downloading: ${attachment.name} from ${attachment.url}`);
    
    // Simulate download
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequestObj: InventoryRequest = {
      id: `req-${Date.now()}`,
      requesterName: userName,
      requesterRole: userRole === 'teacher' ? 'Teacher' : userRole === 'lab-assistant' ? 'Lab Assistant' : 'Admin',
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
    
    setIsDialogOpen(false);
    setNewRequest({ 
      itemName: '', 
      quantity: 1, 
      reason: '', 
      urgency: 'medium',
      priority: 'normal',
      expectedDate: '',
      attachments: []
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
      case 'in-progress':
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
      case 'in-progress':
        return <Clock className="w-3 h-3" />;
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

  // Filter requests based on selected tab
  const filteredRequests = requests.filter(request => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'pending') return request.status === 'pending';
    if (selectedTab === 'approved') return request.status === 'approved';
    if (selectedTab === 'rejected') return request.status === 'rejected';
    if (selectedTab === 'in-progress') return request.status === 'in-progress';
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
      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-300 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Mail className="w-5 h-5 text-blue-600" />
              Send Email Notification
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Send an email update to the requester about their inventory request
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
                      <span className="text-blue-600">{selectedRequest.requesterEmail}</span>
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

              {/* Email Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailSubject" className="text-sm font-medium text-gray-700">
                    Subject
                  </Label>
                  <Input
                    id="emailSubject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Email subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailContent" className="text-sm font-medium text-gray-700">
                    Message
                  </Label>
                  <Textarea
                    id="emailContent"
                    rows={10}
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    className="font-sans text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Type your email message here..."
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>Email will be sent to: <strong>{selectedRequest.requesterEmail}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="email-copy" 
                      defaultChecked 
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="email-copy" className="text-sm text-gray-600">
                      Send copy to me
                    </Label>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Email Template</h4>
                  <p className="text-xs text-blue-700">
                    You can use: {"{name}"}, {"{item}"}, {"{quantity}"}, {"{status}"}, {"{date}"}
                  </p>
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
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  // Preview email
                  setSelectedRequest(selectedRequest);
                  setIsEmailDialogOpen(false);
                  setIsViewEmailDialogOpen(true);
                }}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={sendEmail}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Email Dialog */}
      <Dialog open={isViewEmailDialogOpen} onOpenChange={setIsViewEmailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-2 border-gray-300 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              Email Preview
            </DialogTitle>
            <DialogDescription>
              Preview of the email to be sent
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">To:</p>
                    <p className="text-gray-900">{selectedRequest.requesterName} &lt;{selectedRequest.requesterEmail}&gt;</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Subject:</p>
                    <p className="text-gray-900">{emailSubject || `Update on Your Inventory Request: ${selectedRequest.itemName}`}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="whitespace-pre-line text-gray-700 text-sm leading-relaxed">
                  {emailContent || `Dear ${selectedRequest.requesterName},

This is an update regarding your inventory request for ${selectedRequest.quantity} x ${selectedRequest.itemName}.

Current Status: ${selectedRequest.status}

We will notify you once there's an update.

Best regards,
${userName}`}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <span>Sent via Science Lab Portal</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => {
                setIsViewEmailDialogOpen(false);
                setIsEmailDialogOpen(true);
              }}
            >
              Edit Email
            </Button>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Request Dialog */}
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

            <div className="space-y-2 pt-4 border-t">
              <Label>Attachments (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                   onClick={() => document.getElementById('attachments')?.click()}>
                <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Click to upload supporting documents</p>
                <p className="text-xs text-gray-500">PDF, DOC, XLS up to 10MB each</p>
                <Input 
                  id="attachments" 
                  type="file" 
                  multiple 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setNewRequest({ ...newRequest, attachments: files });
                  }}
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

      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Inventory Requests</h1>
          <p className="text-gray-600">
            {canApproveRequest 
              ? 'Review and manage inventory requests from staff'
              : 'Submit and track your inventory requests'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
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
            label: 'In Progress', 
            value: requests.filter(r => r.status === 'in-progress').length,
            color: 'blue',
            icon: TrendingUp 
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
              <TabsTrigger value="in-progress" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                In Progress
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
              <p className="text-gray-600">No inventory requests found</p>
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
                            {request.emailSent && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Mail className="w-3 h-3 mr-1" />
                                Emailed
                              </Badge>
                            )}
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

                    {request.attachments && request.attachments.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {request.attachments.map((attachment, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                              onClick={() => handleDownloadAttachment(attachment)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              {attachment.name}
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {attachment.size}
                              </Badge>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    
                    
                   <div className="flex flex-wrap gap-2 pt-2">
                      {canApproveRequest && request.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleMarkInProgress(request.id)}
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Mark In Progress
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


                      {canSendEmail && (
                        <Button
                          variant={request.emailSent ? "outline" : "default"}
                          className={request.emailSent 
                            ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-300" 
                            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                          }
                          onClick={() => handleSendEmail(request)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {request.emailSent ? 'Resend Email' : 'Send Email'}
                          {request.emailSent && <Check className="w-3 h-3 ml-1" />}
                        </Button>
                      )}

                      {request.emailSent && request.emailSentAt && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsViewEmailDialogOpen(true);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Email
                        </Button>
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
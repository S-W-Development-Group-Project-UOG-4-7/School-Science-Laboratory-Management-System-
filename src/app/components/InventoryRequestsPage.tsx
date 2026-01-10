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
  TrendingUp
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
  requesterEmail: string;
  itemName: string;
  quantity: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  responseDate?: string;
  responseNote?: string;
  emailSent?: boolean;
  emailSentTo?: string;
  emailSentAt?: string;
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
    emailSentAt: '2025-11-25 14:30'
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
    status: 'approved',
    requestDate: '2025-11-24',
    responseDate: '2025-11-24',
    responseNote: 'Approved. Safety is priority.',
    emailSent: true,
    emailSentTo: 'fernando@school.edu',
    emailSentAt: '2025-11-24 10:15'
  },
];

export function InventoryRequestsPage({ userRole, userId, userName, userEmail }: InventoryRequestsPageProps) {
  const [requests, setRequests] = useState<InventoryRequest[]>(mockRequests);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [showEmailHistory, setShowEmailHistory] = useState<string | null>(null);
  
  const [newRequest, setNewRequest] = useState({
    itemName: '',
    quantity: 1,
    reason: '',
    urgency: 'medium' as const,
  });

  const canCreateRequest = userRole === 'teacher' || userRole === 'lab-assistant';
  const canApproveRequest = userRole === 'principal' || userRole === 'lab-manager';
  const canSendEmail = userRole === 'principal' || userRole === 'lab-manager';

  // Function to handle sending email
  const handleSendEmail = (request: InventoryRequest) => {
    setSelectedRequest(request);
    setEmailSubject(`Update on Your Inventory Request: ${request.itemName}`);
    
    // Pre-fill email content based on request status
    let defaultContent = '';
    if (request.status === 'approved') {
      defaultContent = `Dear ${request.requesterName},\n\nYour request for ${request.quantity} x ${request.itemName} has been approved.\n\nReason: ${request.reason}\n\nYou will be notified once the items are available for collection.\n\nBest regards,\n${userName}\n${userRole === 'principal' ? 'School Principal' : 'Lab Manager'}`;
    } else if (request.status === 'rejected') {
      defaultContent = `Dear ${request.requesterName},\n\nRegarding your request for ${request.quantity} x ${request.itemName}:\n\nWe regret to inform you that this request cannot be approved at this time due to budget constraints/availability issues.\n\nReason for rejection: ${request.responseNote || 'Not specified'}\n\nYou may revise and resubmit your request if needed.\n\nBest regards,\n${userName}\n${userRole === 'principal' ? 'School Principal' : 'Lab Manager'}`;
    } else {
      defaultContent = `Dear ${request.requesterName},\n\nThis is an update regarding your inventory request for ${request.quantity} x ${request.itemName}.\n\nCurrent Status: ${request.status}\n\nWe will notify you once there's an update.\n\nBest regards,\n${userName}\n${userRole === 'principal' ? 'School Principal' : 'Lab Manager'}`;
    }
    
    setEmailContent(defaultContent);
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
            emailSentAt: new Date().toLocaleString()
          } 
        : req
    ));

    // Show notification with role-specific message
    const recipientType = selectedRequest.requesterRole === 'Teacher' ? 'teacher' : 'lab assistant';
    toast.success(`✅ Email sent to ${recipientType} (${selectedRequest.requesterName})`, {
      description: `Subject: ${emailSubject}`,
      duration: 4000,
      icon: <Mail className="w-4 h-4" />,
      action: {
        label: 'View',
        onClick: () => setShowEmailHistory(selectedRequest.id)
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
        emailSent: true,
        emailSentTo: request.requesterEmail,
        emailSentAt: new Date().toLocaleString()
      };

      const updatedRequests = prevRequests.map(req => 
        req.id === requestId ? updatedRequest : req
      );
      
      // Show toast notification directly
      const recipientType = request.requesterRole === 'Teacher' ? 'teacher' : 'lab assistant';
      toast.success(`✅ Approved and notified ${recipientType}`, {
        description: `Approved request for ${request.itemName} (Qty: ${request.quantity})`,
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
        emailSent: true,
        emailSentTo: request.requesterEmail,
        emailSentAt: new Date().toLocaleString()
      };

      const updatedRequests = prevRequests.map(req => 
        req.id === requestId ? updatedRequest : req
      );
      
      // Show toast notification directly
      const recipientType = request.requesterRole === 'Teacher' ? 'teacher' : 'lab assistant';
      toast.error(`❌ Rejected and notified ${recipientType}`, {
        description: `Rejected request for ${request.itemName} (Qty: ${request.quantity})`,
        duration: 3000,
      });
      
      return updatedRequests;
    });
  };

  const handleCreateRequest = () => {
    const newRequestObj: InventoryRequest = {
      id: `req-${Date.now()}`,
      requesterName: userName,
      requesterRole: userRole === 'teacher' ? 'Teacher' : 'Lab Assistant',
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
    setNewRequest({ itemName: '', quantity: 1, reason: '', urgency: 'medium' });

    toast.success('Request Sent Successfully', {
      description: 'Your inventory request has been submitted.',
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
      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Email Notification
            </DialogTitle>
            <DialogDescription>
              Send an email update to the requester about their inventory request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedRequest.requesterName}</p>
                    <p className="text-sm text-gray-600">{selectedRequest.requesterRole} • {selectedRequest.requesterEmail}</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-sm font-medium">Request Details:</p>
                  <p className="text-sm">{selectedRequest.itemName} • Qty: {selectedRequest.quantity}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedRequest.reason}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailSubject">Subject</Label>
                <Input
                  id="emailSubject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailContent">Message</Label>
                <Textarea
                  id="emailContent"
                  rows={8}
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Type your email message here..."
                  className="font-mono text-sm"
                />
              </div>

              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Email will be sent to: {selectedRequest.requesterEmail}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={sendEmail}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
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

      {/* Stats Cards - Updated without funding */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Emails Sent</p>
                  <p className="text-3xl text-blue-700">
                    {requests.filter(r => r.emailSent).length}
                  </p>
                </div>
                <Mail className="w-10 h-10 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Email History Panel */}
      {showEmailHistory && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">Email History</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowEmailHistory(null)}>
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
          {requests
            .filter(req => req.id === showEmailHistory && req.emailSent)
            .map(request => (
              <div key={request.id} className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Email sent to:</span>
                  <span>{request.requesterEmail}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Time:</span> {request.emailSentAt}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span> {request.status}
                </div>
              </div>
            ))}
        </motion.div>
      )}

      {/* Divider */}
      <hr className="border-gray-200" />

      {/* Requests List */}
      <div className="space-y-6">
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
              <Card className="border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <FlaskConical className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-blue-900">{request.itemName}</CardTitle>
                          <CardDescription className="flex items-center gap-2 flex-wrap mt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {request.requesterName} ({request.requesterRole})
                            </span>
                            <span>•</span>
                            <span>Qty: {request.quantity}</span>
                            <span>•</span>
                            <Badge className={getUrgencyColor(request.urgency)} variant="outline">
                              {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                            </Badge>
                            {request.emailSent && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <Mail className="w-3 h-3 mr-1" />
                                  Email Sent
                                </Badge>
                              </>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm text-gray-500">
                        {request.requestDate}
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
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

                    <div className="flex flex-wrap gap-2 pt-2">
                      {/* Approve/Reject for pending requests (Principals only) */}
                      {canApproveRequest && request.status === 'pending' && (
                        <>
                          <Button
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            onClick={() => handleApproveRequest(request.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}

                      {/* Email Button */}
                      {canSendEmail && (
                        <Button
                          variant={request.emailSent ? "outline" : "default"}
                          className={request.emailSent 
                            ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-200" 
                            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                          }
                          onClick={() => handleSendEmail(request)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {request.emailSent ? 'Email Sent' : 'Send Email'}
                          {request.emailSent && <Check className="w-3 h-3 ml-1" />}
                        </Button>
                      )}

                      {/* View Email Button */}
                      {request.emailSent && (
                        <Button
                          variant="ghost"
                          onClick={() => setShowEmailHistory(request.id === showEmailHistory ? null : request.id)}
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
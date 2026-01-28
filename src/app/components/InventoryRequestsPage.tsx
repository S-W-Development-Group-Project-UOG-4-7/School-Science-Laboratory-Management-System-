'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Edit, Trash2 } from 'lucide-react';
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
   requesterRole: 'LAB_ASSISTANT' | 'ADMIN';
  requesterId: string;
  itemId: string;
  quantity: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  responseDate?: string;
  responseNote?: string;
}
interface InventoryRequestCreate {
  requesterName: string;
  requesterId: string;
  itemId: string;
  quantity: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending';
  requestDate: string;
}

interface InventoryRequestsPageProps {
  userRole: string;
  userId: string;
  userName: string;
}

interface NewRequestState {
  itemId: string;
  quantity: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
}



export function InventoryRequestsPage({ userRole, userId, userName }: InventoryRequestsPageProps) {
    const [newRequest, setNewRequest] = useState<NewRequestState>({
    itemId: '',
    quantity: 1,
    reason: '',
    urgency: 'medium',
});
  const [editForm, setEditForm] = useState<NewRequestState>({
  itemId: '',
  quantity: 1,
  reason: '',
  urgency: 'medium',
 });

const role = userRole
  .toUpperCase()
  .replace('-', '_')
  .replace(' ', '_');

const canCreateRequest =
  role === 'LAB_ASSISTANT';

const canApproveRequest =
  role === 'ADMIN';
console.log('userRole:', userRole);
console.log('normalized role:', role);


const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);
const [openEditDialog, setOpenEditDialog] = useState(false);
const [isDialogOpen, setIsDialogOpen] = useState(false);
const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
};

const { data: requests, error, mutate } = useSWR<InventoryRequest[]>(
  '/api/inventory-requests',
  fetcher
);
if (error) return <div>Failed to load requests</div>;
if (!requests) return <div>Loading requests...</div>;
  



const handleCreateRequest = async () => {
  // Build payload
  const request: InventoryRequestCreate = {
    requesterName: userName,       // string
    requesterId: userId,           // string
    itemId: newRequest.itemId.trim(), // remove extra spaces
    quantity: Number(newRequest.quantity), // ensure it's a number
    reason: newRequest.reason.trim(),
    urgency: newRequest.urgency as 'low' | 'medium' | 'high',
    status: 'pending',
    requestDate: new Date().toISOString(),
  };

  // Basic front-end validation
  if (!request.itemId || !request.reason || request.quantity <= 0) {
    toast.error('Please fill all fields correctly.');
    return;
  }

  try {
    console.log('Sending inventory request:', request);

    const res = await fetch('/api/inventory-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    // If API returns error, log full response for debugging
    if (!res.ok) {
      const text = await res.text();
      console.error('API failed with status', res.status, 'and response:', text);
      throw new Error('Failed to create request');
    }

    // Success: refresh the list
    await mutate(); // re-fetch data

    // Reset form
    setNewRequest({ itemId: '', quantity: 1, reason: '', urgency: 'medium' });
    setIsDialogOpen(false);

    toast.success('Request created successfully');
  } catch (error: any) {
    console.error('Error creating inventory request:', error);
    toast.error('Failed to create request');
  }
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
  const handleEditRequest = (request: InventoryRequest) => {
  setSelectedRequest(request);
  setEditForm({
    itemId: request.itemId,
    quantity: request.quantity,
    reason: request.reason,
    urgency: request.urgency,
  });
  setOpenEditDialog(true);
};

const handleUpdate = async (id: string, updatedData: any) => {
  try {
    const res = await fetch(`/api/inventory-requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
     if (!res.ok) {
      throw new Error('Update failed');
    }

    setOpenEditDialog(false);
    setSelectedRequest(null);
    // Refresh list after update
  
  } catch (error) {
    console.error(error);
    alert('Failed to update request');
  }
};

const handleDelete = async (id: string) => {
  try {
    const res = await fetch(`/api/inventory-requests/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Delete failed');
    }

    await mutate(); // re-fetch
    toast.success('Request deleted successfully');
  } catch (err) {
    toast.error('Failed to delete request');
    console.error(err);
  }
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
  //const displayRequests = canApproveRequest 
    //? requests 
    //: requests.filter(req => req.requesterId === userId);

  const displayRequests = requests;
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
                 <Label htmlFor="itemId">Item</Label>
                  <Input
                    id="itemId"
                    placeholder="Enter Item ID"
                    value={newRequest.itemId}
                    onChange={(e) => setNewRequest({ ...newRequest, itemId: e.target.value })}
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
                  disabled={!newRequest.itemId || !newRequest.reason}
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
                        <CardTitle className="text-blue-900">{request.itemId}</CardTitle>
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

                    {request.status === 'pending' && (canApproveRequest || request.requesterId === userId) && (
  <div className="flex gap-2 pt-2">
    {canApproveRequest && (
      <>
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
      </>
    )}

    {request.requesterId === userId && (
      <>
        <Button size="sm" onClick={() => handleEditRequest(request)}>
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleDelete(request.id)}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </>
    )}

    <Button size="sm" variant="outline" className="ml-auto">
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
      <Dialog open={openEditDialog} onOpenChange={(open) => {
  if (!open) setSelectedRequest(null);
}}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Edit Inventory Request</DialogTitle>
      <DialogDescription>Modify your request details before submission</DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="editItemId">Item ID</Label>
        <Input
          id="editItemId"
          value={editForm.itemId}
          onChange={(e) => setEditForm({ ...editForm, itemId: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="editQuantity">Quantity</Label>
        <Input
          id="editQuantity"
          type="number"
          min="1"
          value={editForm.quantity}
          onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 1 })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="editUrgency">Urgency</Label>
        <select
          id="editUrgency"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={editForm.urgency}
          onChange={(e) => setEditForm({ ...editForm, urgency: e.target.value as any })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="editReason">Reason</Label>
        <Textarea
          id="editReason"
          rows={4}
          value={editForm.reason}
          onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
        />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
      <Button
        onClick={() =>
         selectedRequest &&
         handleUpdate(selectedRequest.id, editForm)
        }
          className="bg-blue-600 text-white"
       >
           Update
        </Button>
        </DialogFooter>
    </DialogContent>
  </Dialog>

</div>
  );
}
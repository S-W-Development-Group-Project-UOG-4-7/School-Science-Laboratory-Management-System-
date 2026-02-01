'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, AlertTriangle, CheckCircle, Info, Plus, Edit, X, Bell, CheckCircle2, Clock, User, Package, AlertCircle, Mail, Download, CheckCheck, ShoppingCart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import type { UserRole } from '@/src/app/lib/types';
import { ImageWithFallback } from './img/ImageWithFallback';

interface InventoryPageProps {
  userRole: UserRole;
}

interface InventoryItem {
  id: string;
  name: string;
  category: 'Glassware' | 'Equipment' | 'Chemicals' | 'Safety' | 'Instruments';
  stockLevel: number;
  minStockLevel: number;
  unit: string;
  location: string;
  photo: string;
  storageInstructions: string;
  handlingProcedure: string;
  safetyNotes: string;
  lastUpdated: string;
}

interface InventoryRequest {
  id: string;
  itemId: string;
  itemName: string;
  itemCategory: string;
  requestedBy: string;
  requestedByRole: string;
  requestedDate: string;
  neededDate: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'fulfilled';
  reason: string;
  attachments: string[];
  approvedBy?: string;
  approvedDate?: string;
  fulfilledBy?: string;
  fulfilledDate?: string;
  fulfilledQuantity?: number;
  notes?: string;
}

interface Notification {
  id: string;
  type: 'request' | 'approval' | 'rejection' | 'fulfillment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  requestId?: string;
  itemId?: string;
}

const inventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Beakers (250ml)',
    category: 'Glassware',
    stockLevel: 35,
    minStockLevel: 20,
    unit: 'pieces',
    location: 'Cabinet A2 - Shelf 3',
    photo: 'https://images.unsplash.com/photo-1761095596584-34731de3e568?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVtaXN0cnklMjBsYWJvcmF0b3J5JTIwYmVha2VyfGVufDF8fHx8MTc2Mjk2NDk4NHww&ixlib=rb-4.1.0&q=80&w=1080',
    storageInstructions: 'Store in a dry, cool place away from direct sunlight. Stack carefully with padding between units to prevent breakage.',
    handlingProcedure: 'Handle with care. Check for cracks before use. Clean thoroughly after each use with appropriate cleaning solution.',
    safetyNotes: 'Wear safety gloves when handling. Dispose of broken glassware in designated sharps container.',
    lastUpdated: '2025-11-10',
  },
  {
    id: '2',
    name: 'Compound Microscopes',
    category: 'Instruments',
    stockLevel: 8,
    minStockLevel: 10,
    unit: 'units',
    location: 'Equipment Room - Shelf B',
    photo: 'https://images.unsplash.com/photo-1614308457932-e16d85c5d053?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWNyb3Njb3BlJTIwc2NpZW5jZSUyMGxhYnxlbnwxfHx8fDE3NjI4ODI3NzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    storageInstructions: 'Store in a dust-free cabinet with desiccant packs. Keep covered when not in use. Maintain at room temperature (20-25°C).',
    handlingProcedure: 'Always carry with both hands - one on the arm and one supporting the base. Clean lenses with lens paper only. Never use regular cloth or tissue.',
    safetyNotes: 'Ensure electrical safety before plugging in. Keep away from water sources. Report any damaged cables immediately.',
    lastUpdated: '2025-11-08',
  },
  {
    id: '3',
    name: 'Test Tubes (20ml)',
    category: 'Glassware',
    stockLevel: 120,
    minStockLevel: 80,
    unit: 'pieces',
    location: 'Cabinet A1 - Drawer 2',
    photo: 'https://images.unsplash.com/photo-1606206605628-0a09580d44a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWJvcmF0b3J5JTIwdGVzdCUyMHR1YmVzfGVufDF8fHx8MTc2Mjg3NzgzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    storageInstructions: 'Store upright in test tube racks. Keep in dry storage away from heat sources. Organize by size for easy access.',
    handlingProcedure: 'Inspect for chips or cracks before use. Use test tube holders for hot materials. Clean with appropriate brushes and detergent.',
    safetyNotes: 'Never heat a closed test tube. Point opening away from yourself and others when heating. Dispose of broken glass properly.',
    lastUpdated: '2025-11-11',
  },
  {
    id: '4',
    name: 'Safety Goggles',
    category: 'Safety',
    stockLevel: 42,
    minStockLevel: 50,
    unit: 'pieces',
    location: 'Safety Cabinet - Main Lab',
    photo: 'https://images.unsplash.com/photo-1758685848561-3658f433e6a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWZldHklMjBnb2dnbGVzJTIwbGFifGVufDF8fHx8MTc2Mjk2NDk4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    storageInstructions: 'Store in a clean, dry place. Keep each pair in individual compartments to prevent scratching. Sanitize regularly.',
    handlingProcedure: 'Ensure proper fit before use. Clean with mild soap and water after each use. Check for scratches or damage before issuing.',
    safetyNotes: 'Mandatory for all laboratory work. Must be worn at all times in the lab. Replace if scratched or damaged.',
    lastUpdated: '2025-11-09',
  },
  {
    id: '5',
    name: 'Bunsen Burners',
    category: 'Equipment',
    stockLevel: 15,
    minStockLevel: 12,
    unit: 'units',
    location: 'Equipment Room - Shelf C',
    photo: 'https://images.unsplash.com/photo-1644261766628-3af7203be678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidW5zZW4lMjBidXJuZXIlMjBmbGFtZXxlbnwxfHx8fDE3NjI5NjQ5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    storageInstructions: 'Store in ventilated area away from flammable materials. Disconnect gas tubing when not in use. Keep upright.',
    handlingProcedure: 'Check gas connections before use. Light with striker, never matches. Adjust air valve for proper flame type. Turn off gas when not actively heating.',
    safetyNotes: 'Never leave unattended when lit. Ensure proper ventilation. Keep flammable materials at safe distance. Allow to cool before storing.',
    lastUpdated: '2025-11-07',
  },
  {
    id: '6',
    name: 'Volumetric Flasks (100ml)',
    category: 'Glassware',
    stockLevel: 18,
    minStockLevel: 15,
    unit: 'pieces',
    location: 'Cabinet A3 - Shelf 2',
    photo: 'https://images.unsplash.com/photo-1761095596584-34731de3e568?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWJvcmF0b3J5JTIwZ2xhc3N3YXJlJTIwZXF1aXBtZW50fGVufDF8fHx8MTc2Mjg4MjQxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    storageInstructions: 'Store with stoppers in place. Keep in secured cabinet to prevent tipping. Maintain at constant room temperature.',
    handlingProcedure: 'Clean thoroughly before use. Fill to calibration mark at eye level. Use for preparation of standard solutions only.',
    safetyNotes: 'Do not heat. Handle stopper separately from flask when in use. Clean immediately after use to prevent contamination.',
    lastUpdated: '2025-11-10',
  },
];

const initialRequests: InventoryRequest[] = [
  {
    id: 'req1',
    itemId: '2',
    itemName: 'Compound Microscopes',
    itemCategory: 'Instruments',
    requestedBy: 'Lab Assistant Sarah',
    requestedByRole: 'lab-assistant',
    requestedDate: '2025-11-12',
    neededDate: '2025-11-20',
    quantity: 5,
    priority: 'high',
    status: 'approved',
    reason: 'Stock running low. Need additional units for upcoming biology practical exams.',
    attachments: ['lesson_plan.pdf', 'student_list.csv'],
    approvedBy: 'Principal Silva',
    approvedDate: '2025-11-13',
  },
  {
    id: 'req2',
    itemId: '4',
    itemName: 'Safety Goggles',
    itemCategory: 'Safety',
    requestedBy: 'Lab Assistant Mike',
    requestedByRole: 'lab-assistant',
    requestedDate: '2025-11-11',
    neededDate: '2025-11-25',
    quantity: 20,
    priority: 'medium',
    status: 'fulfilled',
    reason: 'Stock running low due to increased class sizes. Need additional pairs for safety compliance.',
    attachments: ['inventory_report.pdf'],
    approvedBy: 'Principal Silva',
    approvedDate: '2025-11-12',
    fulfilledBy: 'Lab Assistant Mike',
    fulfilledDate: '2025-11-15',
    fulfilledQuantity: 20,
    notes: 'Purchased from Science Supplies Ltd. Added to inventory on 2025-11-15.',
  },
  {
    id: 'req3',
    itemId: '1',
    itemName: 'Beakers (250ml)',
    itemCategory: 'Glassware',
    requestedBy: 'Mr. Perera',
    requestedByRole: 'teacher',
    requestedDate: '2025-11-13',
    neededDate: '2025-11-26',
    quantity: 20,
    priority: 'high',
    status: 'pending',
    reason: 'Chemistry practical session for Grade 10 students scheduled next week.',
    attachments: ['lesson_plan.pdf', 'student_list.csv'],
  },
];

const initialNotifications: Notification[] = [
  {
    id: 'notif1',
    type: 'fulfillment',
    title: 'Safety Goggles Restocked',
    message: 'Lab Assistant Mike has added 20 pieces of Safety Goggles to inventory.',
    timestamp: '2025-11-15 02:15 PM',
    read: false,
    requestId: 'req2',
    itemId: '4',
  },
  {
    id: 'notif2',
    type: 'fulfillment',
    title: 'Test Tubes Restocked',
    message: 'Lab Assistant Sarah has added 50 pieces of Test Tubes (20ml) to inventory.',
    timestamp: '2025-11-14 11:30 AM',
    read: false,
    requestId: 'req4',
    itemId: '3',
  },
];

export function InventoryPage({ userRole }: InventoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [requests, setRequests] = useState<InventoryRequest[]>(initialRequests);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);
  
  // Request form state
  const [requestQuantity, setRequestQuantity] = useState('');
  const [requestPriority, setRequestPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [requestReason, setRequestReason] = useState('');
  const [requestNeededDate, setRequestNeededDate] = useState('');
  
  // Fulfillment form state
  const [fulfilledQuantity, setFulfilledQuantity] = useState('');
  const [fulfillmentNotes, setFulfillmentNotes] = useState('');
  const [fulfillmentDate, setFulfillmentDate] = useState('');

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.stockLevel <= item.minStockLevel) {
      return { label: 'Low Stock', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
  };

  const canEdit = userRole === 'teacher' || userRole === 'lab-assistant';
  const isPrincipal = userRole === 'principal';
  const isLabAssistant = userRole === 'lab-assistant';
  const isTeacher = userRole === 'teacher';

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const fulfilledRequests = requests.filter(req => req.status === 'fulfilled');
  const inProgressRequests = requests.filter(req => req.status === 'in-progress');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');

  const unreadNotifications = notifications.filter(n => !n.read);
  const fulfillmentNotifications = notifications.filter(n => n.type === 'fulfillment');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'fulfilled': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleRequestSubmit = () => {
    if (!selectedItem || !requestQuantity || !requestReason || !requestNeededDate) return;
    
    const newRequest: InventoryRequest = {
      id: `req${requests.length + 1}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemCategory: selectedItem.category,
      requestedBy: isLabAssistant ? 'Lab Assistant' : 'Teacher',
      requestedByRole: userRole,
      requestedDate: new Date().toISOString().split('T')[0],
      neededDate: requestNeededDate,
      quantity: parseInt(requestQuantity),
      priority: requestPriority,
      status: 'pending',
      reason: requestReason,
      attachments: [],
    };

    setRequests([newRequest, ...requests]);
    
    // Send notification to principal
    const notification: Notification = {
      id: `notif${notifications.length + 1}`,
      type: 'request',
      title: 'New Inventory Request',
      message: `${newRequest.requestedBy} requested ${newRequest.quantity} ${selectedItem.unit} of ${selectedItem.name}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      requestId: newRequest.id,
      itemId: selectedItem.id,
    };

    setNotifications([notification, ...notifications]);
    
    // Reset form
    setShowRequestDialog(false);
    setRequestQuantity('');
    setRequestPriority('medium');
    setRequestReason('');
    setRequestNeededDate('');
  };

  const handleApproveRequest = (requestId: string) => {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    const updatedRequests = requests.map(req => 
      req.id === requestId 
        ? { ...req, status: 'approved' as const, approvedBy: 'Principal Silva', approvedDate: new Date().toISOString().split('T')[0] }
        : req
    );

    setRequests(updatedRequests);

    // Send notification to requester
    const notification: Notification = {
      id: `notif${notifications.length + 1}`,
      type: 'approval',
      title: 'Request Approved',
      message: `Your request for ${request.quantity} ${inventoryItems.find(i => i.id === request.itemId)?.unit} of ${request.itemName} has been approved by Principal Silva.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      requestId: requestId,
      itemId: request.itemId,
    };

    setNotifications([notification, ...notifications]);
  };

  const handleRejectRequest = (requestId: string) => {
    const request = requests.find(req => req.id === requestId);
    if (!request) return;

    const updatedRequests = requests.map(req => 
      req.id === requestId 
        ? { ...req, status: 'rejected' as const }
        : req
    );

    setRequests(updatedRequests);

    // Send notification to requester
    const notification: Notification = {
      id: `notif${notifications.length + 1}`,
      type: 'rejection',
      title: 'Request Rejected',
      message: `Your request for ${request.quantity} ${inventoryItems.find(i => i.id === request.itemId)?.unit} of ${request.itemName} has been rejected.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      requestId: requestId,
      itemId: request.itemId,
    };

    setNotifications([notification, ...notifications]);
  };

  const handleFulfillRequest = () => {
    if (!selectedRequest || !fulfilledQuantity || !fulfillmentDate) return;

    const updatedRequests = requests.map(req => 
      req.id === selectedRequest.id 
        ? { 
            ...req, 
            status: 'fulfilled' as const,
            fulfilledBy: 'Lab Assistant',
            fulfilledDate: fulfillmentDate,
            fulfilledQuantity: parseInt(fulfilledQuantity),
            notes: fulfillmentNotes,
          }
        : req
    );

    setRequests(updatedRequests);

    // Update inventory stock level
    const item = inventoryItems.find(i => i.id === selectedRequest.itemId);
    if (item) {
      // In a real app, you would update the actual inventory here
      console.log(`Updated ${item.name} stock: +${fulfilledQuantity} ${item.unit}`);
    }

    // Send fulfillment notification
    const notification: Notification = {
      id: `notif${notifications.length + 1}`,
      type: 'fulfillment',
      title: `${selectedRequest.itemName} Restocked`,
      message: `Lab Assistant has added ${fulfilledQuantity} ${item?.unit} of ${selectedRequest.itemName} to inventory.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      requestId: selectedRequest.id,
      itemId: selectedRequest.itemId,
    };

    setNotifications([notification, ...notifications]);

    // Reset form
    setShowFulfillDialog(false);
    setSelectedRequest(null);
    setFulfilledQuantity('');
    setFulfillmentNotes('');
    setFulfillmentDate('');
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  // Get requests for a specific item
  const getItemRequests = (itemId: string) => {
    return requests.filter(req => req.itemId === itemId);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-2">Laboratory Inventory</h2>
          <p className="text-gray-600">
            Manage and track all laboratory equipment, glassware, and materials
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Notifications Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </Button>
            
            {/* Notifications Dropdown - MODIFIED to show fulfillment details */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Fulfillment Notifications</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllNotificationsAsRead}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Mark all as read
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Items that have been restocked</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {fulfillmentNotifications.length > 0 ? (
                    fulfillmentNotifications.map((notification) => {
                      const request = requests.find(req => req.id === notification.requestId);
                      const item = inventoryItems.find(i => i.id === notification.itemId);
                      
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? 'bg-purple-50' : ''
                          }`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="rounded-full p-2 bg-purple-100 text-purple-600">
                              <Package className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                {!notification.read && (
                                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                )}
                              </div>
                              
                              {/* Detailed fulfillment information */}
                              <div className="mt-2 space-y-2">
                                <p className="text-sm text-gray-600">{notification.message}</p>
                                
                                {request && (
                                  <div className="text-sm">
                                    <div className="flex items-center gap-2 text-gray-700">
                                      <span className="font-medium">Requested by:</span>
                                      <span>{request.requestedBy}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                      <span className="font-medium">Date fulfilled:</span>
                                      <span>{request.fulfilledDate}</span>
                                    </div>
                                    {request.notes && (
                                      <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                                        <span className="font-medium text-gray-700">Notes: </span>
                                        <span className="text-gray-600">{request.notes}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {item && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="bg-gray-50">{item.category}</Badge>
                                    <span className="text-xs text-gray-500">Location: {item.location}</span>
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-xs text-gray-500 mt-3">{notification.timestamp}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <CheckCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No fulfillment notifications</p>
                      <p className="text-sm text-gray-500 mt-1">Items restocked will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {canEdit && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                  <DialogDescription>
                    Add new equipment or material to the laboratory inventory
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Item Name</label>
                      <Input placeholder="e.g., Beakers (250ml)" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <Select>
                        <SelectTrigger className="mt-1 bg-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="Glassware">Glassware</SelectItem>
                          <SelectItem value="Equipment">Equipment</SelectItem>
                          <SelectItem value="Chemicals">Chemicals</SelectItem>
                          <SelectItem value="Safety">Safety Equipment</SelectItem>
                          <SelectItem value="Instruments">Instruments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Stock Level</label>
                      <Input type="number" placeholder="e.g., 35" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Minimum Stock Level</label>
                      <Input type="number" placeholder="e.g., 20" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Unit</label>
                      <Input placeholder="e.g., pieces, units" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <Input placeholder="e.g., Cabinet A2 - Shelf 3" className="mt-1" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => {}}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Add Item
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Fulfillment Statistics - ONLY FULFILLED */}
      {isPrincipal && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Items Restocked</p>
                  <p className="text-3xl font-bold text-purple-600">{fulfilledRequests.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Fulfilled requests</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              
              {/* Recent Fulfillments */}
              {fulfilledRequests.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Recently Restocked</h4>
                  <div className="space-y-3">
                    {fulfilledRequests.slice(0, 3).map((request) => {
                      const item = inventoryItems.find(i => i.id === request.itemId);
                      return (
                        <div key={request.id} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <CheckCheck className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{request.itemName}</p>
                              <p className="text-xs text-gray-600">
                                {request.fulfilledQuantity} {item?.unit} added by {request.fulfilledBy}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{request.fulfilledDate}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 transition-all hover:border-blue-400 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="hover:border-blue-400 transition-colors bg-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Glassware">Glassware</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Chemicals">Chemicals</SelectItem>
                  <SelectItem value="Safety">Safety Equipment</SelectItem>
                  <SelectItem value="Instruments">Instruments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-700">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{inventoryItems.length}</p>
            <p className="text-sm text-gray-600 mt-1">Unique item types</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-700">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{inventoryItems.filter(item => item.stockLevel <= item.minStockLevel).length}</p>
            <p className="text-sm text-gray-600 mt-1">Items need restocking</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-700">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">Today</p>
            <p className="text-sm text-gray-600 mt-1">2025-11-12</p>
          </CardContent>
        </Card>
      </div>

    {/* Inventory Grid Container */}
        <div className="border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
      {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredItems.map((item) =>{
              const status = getStockStatus(item);
              const StatusIcon = status.icon;
              const itemRequests = getItemRequests(item.id);
              const hasPendingRequest = itemRequests.some(req => req.status === 'pending');
              const hasApprovedRequest = itemRequests.some(req => req.status === 'approved');
              const hasFulfilledRequest = itemRequests.some(req => req.status === 'fulfilled');

              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                  <div className="h-48 bg-gray-100 relative">
                    <ImageWithFallback
                      src={item.photo}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    {(hasPendingRequest || hasApprovedRequest || hasFulfilledRequest) && (
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {hasPendingRequest && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Request Pending
                          </Badge>
                        )}
                        {hasApprovedRequest && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                        {hasFulfilledRequest && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            <Package className="w-3 h-3 mr-1" />
                            Fulfilled
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline" className="bg-gray-50">{item.category}</Badge>
                      <span className="text-xs text-gray-500">{item.lastUpdated}</span>
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">{item.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">Location: {item.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Current Stock</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {item.stockLevel} <span className="text-sm font-normal text-gray-600">{item.unit}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Min. Required</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {item.minStockLevel} <span className="text-sm font-normal text-gray-600">{item.unit}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {/* Details Button */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                            onClick={() => setSelectedItem(item)}
                          >
                            <Info className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900">{item.name}</DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Inventory details and restock history
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6 py-4">
                            {/* Image */}
                            <div className="h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                              <ImageWithFallback
                                src={item.photo}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Divider */}
                            <hr className="border-gray-300" />

                            {/* Table-like Details - UPDATED to match new screenshot */}
                            <div className="space-y-6">
                              <h3 className="text-lg font-semibold text-gray-900">Property</h3>
                              <div className="space-y-4">
                                {/* Category */}
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-1">Category</h4>
                                  <div>
                                    <Badge variant="outline" className="bg-gray-50">{item.category}</Badge>
                                  </div>
                                </div>
                                
                                {/* Location */}
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-1">Location</h4>
                                  <p className="text-gray-900">{item.location}</p>
                                </div>
                                
                                {/* Stock Level */}
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-1">Stock Level</h4>
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-900">
                                      {item.stockLevel} {item.unit}
                                    </span>
                                    <Badge className={status.color} variant="outline">
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {status.label}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {/* Last Updated */}
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-1">Last Updated</h4>
                                  <p className="text-gray-900">{item.lastUpdated}</p>
                                </div>
                              </div>
                            </div>

                            {/* Divider */}
                            <hr className="border-gray-300" />

                            {/* Restock History Section - UPDATED to match new screenshot */}
                            <div className="space-y-6">
                              <h3 className="text-lg font-semibold text-gray-900">Restock History</h3>
                              
                              {/* Filter to only show fulfilled requests for this item from lab assistants */}
                              {itemRequests.filter(request => 
                                request.status === 'fulfilled' && 
                                request.requestedByRole === 'lab-assistant'
                              ).length > 0 ? (
                                <div className="space-y-6">
                                  {itemRequests.filter(request => 
                                    request.status === 'fulfilled' && 
                                    request.requestedByRole === 'lab-assistant'
                                  ).map((request) => (
                                    <div key={request.id} className="space-y-4">
                                      {/* Requester and status */}
                                      <div>
                                        <h4 className="text-lg font-bold text-gray-900">{request.requestedBy}</h4>
                                        <div className="flex items-center gap-3 mt-2">
                                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                            <CheckCheck className="w-3 h-3 mr-1" />
                                            Fulfilled
                                          </Badge>
                                          <span className="text-sm text-gray-600 italic">
                                            {request.priority} Priority
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Quantity */}
                                      <div>
                                        <p className="text-2xl font-bold text-gray-900">{request.quantity} {item.unit}</p>
                                        <p className="text-sm text-gray-500 mt-1">Quantity requested</p>
                                      </div>
                                      
                                      {/* Dates */}
                                      <div className="text-sm text-gray-700">
                                        <p>
                                          <span className="font-medium">Requested:</span> {request.requestedDate} · 
                                          <span className="font-medium ml-1">Needed:</span> {request.neededDate}
                                        </p>
                                      </div>
                                      
                                      {/* Reason */}
                                      <p className="text-gray-700">
                                        {request.reason}
                                      </p>
                                      
                                      {/* Divider */}
                                      <hr className="border-gray-300" />
                                      
                                      {/* Fulfillment Details */}
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <CheckCheck className="w-5 h-5 text-green-600" />
                                          <h5 className="font-bold text-gray-900">
                                            Fulfilled by {request.fulfilledBy} on {request.fulfilledDate}
                                          </h5>
                                        </div>
                                        <p className="text-gray-700">
                                          <span className="font-medium">Quantity added:</span> {request.fulfilledQuantity} {item.unit}
                                        </p>
                                        {request.notes && (
                                          <div className="mt-2">
                                            <p className="text-gray-700">
                                              <span className="font-medium">Notes:</span> {request.notes}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                  <p className="text-gray-600">No restock history available</p>
                                  <p className="text-sm text-gray-500 mt-1">Restocked items will appear here</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Edit Button */}
                      {canEdit && (
                        <Button size="sm" variant="outline" className="border-gray-300 hover:border-blue-400 hover:bg-blue-50">
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <Card className="py-12 border border-gray-200 shadow-sm">
              <CardContent className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-gray-900 mb-2 font-semibold">No items found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Fulfillment Dialog for Lab Assistant */}
      <Dialog open={showFulfillDialog} onOpenChange={setShowFulfillDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Mark Request as Fulfilled</DialogTitle>
            <DialogDescription>
              Confirm that you have added the requested items to inventory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRequest && (
              <>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-gray-900">{selectedRequest.itemName}</h4>
                  <p className="text-sm text-gray-600">Requested by: {selectedRequest.requestedBy}</p>
                  <p className="text-sm text-gray-600">Quantity requested: {selectedRequest.quantity} {inventoryItems.find(i => i.id === selectedRequest.itemId)?.unit}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Quantity Fulfilled
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter quantity added"
                    value={fulfilledQuantity}
                    onChange={(e) => setFulfilledQuantity(e.target.value)}
                    min="1"
                    max={selectedRequest.quantity.toString()}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Requested: {selectedRequest.quantity} {inventoryItems.find(i => i.id === selectedRequest.itemId)?.unit}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Fulfillment Date
                  </label>
                  <Input
                    type="date"
                    value={fulfillmentDate}
                    onChange={(e) => setFulfillmentDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add any notes about the fulfillment (e.g., supplier, quality, storage location)"
                    value={fulfillmentNotes}
                    onChange={(e) => setFulfillmentNotes(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                setShowFulfillDialog(false);
                setSelectedRequest(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleFulfillRequest}
              disabled={!fulfilledQuantity || !fulfillmentDate}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark as Fulfilled
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
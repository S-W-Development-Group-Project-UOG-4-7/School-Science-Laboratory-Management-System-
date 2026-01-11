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
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail,
  AlertCircle,
  Calendar,
  FlaskConical,
  Beaker,
  Filter,
  Eye,
  EyeOff,
  Loader2
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// Define enums locally since Prisma enums can't be imported on client side
enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PREPARED = 'PREPARED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

enum EquipmentCategory {
  GLASSWARE = 'GLASSWARE',
  INSTRUMENTS = 'INSTRUMENTS',
  CHEMICALS = 'CHEMICALS',
  SAFETY = 'SAFETY',
  OTHER = 'OTHER'
}

// Types based on Prisma schema
interface EquipmentItem {
  id?: number;
  name: string;
  quantity: number;
  category: EquipmentCategory;
}

interface EquipmentRequestData {
  id: number;
  teacherId: number;
  labAssistantId: number;
  className: string;
  grade: string;
  subject: string;
  practicalDate: string;
  practicalTime: string;
  additionalNotes?: string;
  status: RequestStatus;
  responseNote?: string;
  responseDate?: string;
  createdAt: string;
  updatedAt: string;
  teacher: {
    id: number;
    userId: number;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  };
  labAssistant: {
    id: number;
    userId: number;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  };
  equipmentItems: EquipmentItem[];
}

interface InventoryRequestsPageProps {
  userRole: string;
  userId: string;
  userName: string;
}

// Subject options
const subjectOptions = [
  { value: 'science', label: 'Science' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'physics', label: 'Physics' },
  { value: 'biology', label: 'Biology' },
];

// Common equipment items
const commonEquipmentItems = [
  { id: 1, name: 'Beakers (250ml)', category: EquipmentCategory.GLASSWARE },
  { id: 2, name: 'Test Tubes', category: EquipmentCategory.GLASSWARE },
  { id: 3, name: 'Microscope', category: EquipmentCategory.INSTRUMENTS },
  { id: 4, name: 'Bunsen Burner', category: EquipmentCategory.INSTRUMENTS },
  { id: 5, name: 'Safety Goggles', category: EquipmentCategory.SAFETY },
  { id: 6, name: 'Lab Coats', category: EquipmentCategory.SAFETY },
  { id: 7, name: 'Glass Slides', category: EquipmentCategory.GLASSWARE },
  { id: 8, name: 'Graduated Cylinders', category: EquipmentCategory.GLASSWARE },
  { id: 9, name: 'Droppers', category: EquipmentCategory.GLASSWARE },
  { id: 10, name: 'Digital Balance', category: EquipmentCategory.INSTRUMENTS },
];

// Lab assistant type
interface LabAssistantData {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export function InventoryRequestsPage({ userRole, userId, userName }: InventoryRequestsPageProps) {
  const [requests, setRequests] = useState<EquipmentRequestData[]>([]);
  const [labAssistants, setLabAssistants] = useState<LabAssistantData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newRequest, setNewRequest] = useState({
    labAssistantId: '',
    className: '',
    grade: '',
    subject: '',
    practicalDate: '',
    practicalTime: '',
    equipmentItems: [] as EquipmentItem[],
    additionalNotes: '',
  });
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [equipmentQuantity, setEquipmentQuantity] = useState(1);
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | RequestStatus>('all');
  const [showCompletedRejected, setShowCompletedRejected] = useState(false);

  const isTeacher = userRole?.toUpperCase() === 'TEACHER';
  const isLabAssistant = userRole?.toUpperCase() === 'LAB_ASSISTANT';

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  if (!userRole || !userId) return; // 🔒 prevent early crash

  setIsLoading(true);
  try {
    const response = await fetch(
      `/api/equipment-requests?userRole=${userRole}&userId=${userId}`
    );

    if (!response.ok) {
      throw new Error(`Equipment request fetch failed: ${response.status}`);
    }

    const data = await response.json();
    setRequests(Array.isArray(data.requests) ? data.requests : []);

    const assistantsResponse = await fetch('/api/lab-assistants');

    if (!assistantsResponse.ok) {
      throw new Error(`Lab assistants fetch failed: ${assistantsResponse.status}`);
    }

    const assistantsData = await assistantsResponse.json();
    setLabAssistants(
      Array.isArray(assistantsData.assistants)
        ? assistantsData.assistants
        : []
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    toast.error('Failed to load data');
  } finally {
    setIsLoading(false);
  }
};


  // Get grades based on subject
  const getGradeOptions = (subject: string) => {
    if (subject === 'science') {
      return Array.from({ length: 6 }, (_, i) => (i + 6).toString()); // 6 to 11
    } else {
      return ['12', '13'];
    }
  };

  // Get class options based on grade
  const getClassOptions = (grade: string) => {
    const gradeNum = parseInt(grade);
    if (gradeNum >= 6 && gradeNum <= 11) {
      return ['A', 'B', 'C', 'D'];
    } else {
      return ['A', 'B'];
    }
  };

  const handleCreateRequest = async () => {
    if (newRequest.equipmentItems.length === 0) {
      toast.error('Please add at least one equipment item');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/equipment-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: parseInt(userId),
          labAssistantId: parseInt(newRequest.labAssistantId),
          className: newRequest.className,
          grade: newRequest.grade,
          subject: newRequest.subject,
          practicalDate: newRequest.practicalDate,
          practicalTime: newRequest.practicalTime,
          additionalNotes: newRequest.additionalNotes,
          equipmentItems: newRequest.equipmentItems,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create request');
      }

      const data = await response.json();
      
      // Update local state
      setRequests([data.request, ...requests]);
      setIsDialogOpen(false);
      
      // Reset form
      setNewRequest({
        labAssistantId: '',
        className: '',
        grade: '',
        subject: '',
        practicalDate: '',
        practicalTime: '',
        equipmentItems: [],
        additionalNotes: '',
      });
      
      toast.success('Request Sent Successfully', {
        description: 'Your equipment request has been submitted.',
      });
      
      // Refresh data to get latest from server
      fetchData();
    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddEquipment = () => {
    if (!selectedEquipment) {
      toast.error('Please select an equipment item');
      return;
    }

    const equipment = commonEquipmentItems.find(item => item.id.toString() === selectedEquipment);
    if (!equipment) return;

    const existingItemIndex = newRequest.equipmentItems.findIndex(item => item.name === equipment.name);
    
    if (existingItemIndex > -1) {
      const updatedItems = [...newRequest.equipmentItems];
      updatedItems[existingItemIndex].quantity += equipmentQuantity;
      setNewRequest({ ...newRequest, equipmentItems: updatedItems });
    } else {
      setNewRequest({
        ...newRequest,
        equipmentItems: [
          ...newRequest.equipmentItems,
          {
            name: equipment.name,
            quantity: equipmentQuantity,
            category: equipment.category,
          }
        ]
      });
    }

    setSelectedEquipment('');
    setEquipmentQuantity(1);
  };

  const handleRemoveEquipment = (index: number) => {
    const updatedItems = [...newRequest.equipmentItems];
    updatedItems.splice(index, 1);
    setNewRequest({ ...newRequest, equipmentItems: updatedItems });
  };

  const handleUpdateEquipmentQuantity = (index: number, quantity: number) => {
    const updatedItems = [...newRequest.equipmentItems];
    updatedItems[index].quantity = quantity;
    setNewRequest({ ...newRequest, equipmentItems: updatedItems });
  };

  const handleUpdateRequestStatus = async (requestId: number, status: RequestStatus, responseNote?: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/equipment-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          responseNote,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update request');
      }

      const data = await response.json();
      
      // Update local state
      setRequests(requests.map(req => 
        req.id === requestId ? data.request : req
      ));

      // Show success message
      const statusMessages: Record<RequestStatus, string> = {
        [RequestStatus.APPROVED]: 'Request Approved',
        [RequestStatus.REJECTED]: 'Request Rejected',
        [RequestStatus.PREPARED]: 'Marked as Prepared',
        [RequestStatus.COMPLETED]: 'Marked as Completed',
        [RequestStatus.PENDING]: 'Status Updated',
      };

      toast.success(statusMessages[status], {
        description: 'Email notification has been sent.',
      });
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast.error(error.message || 'Failed to update request');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case RequestStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case RequestStatus.PREPARED:
        return 'bg-green-100 text-green-800 border-green-200';
      case RequestStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED:
      case RequestStatus.PREPARED:
      case RequestStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case RequestStatus.REJECTED:
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return <Clock className="w-4 h-4 mr-1" />;
    }
  };

  const formatCategory = (category: string) => {
    return category.toLowerCase().replace('_', ' ');
  };

  // Filter requests based on user role and status filter
  const displayRequests = (() => {
    let filtered = requests;
    
    // Apply status filter
    if (activeStatusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === activeStatusFilter);
    }
    
    // Filter out completed and rejected by default
    if (!showCompletedRejected) {
      filtered = filtered.filter(req => 
        req.status !== RequestStatus.COMPLETED && req.status !== RequestStatus.REJECTED
      );
    }
    
    return filtered;
  })();

  // Calculate status counts
  const statusCounts = {
    [RequestStatus.PENDING]: requests.filter(r => r.status === RequestStatus.PENDING).length,
    [RequestStatus.APPROVED]: requests.filter(r => r.status === RequestStatus.APPROVED).length,
    [RequestStatus.PREPARED]: requests.filter(r => r.status === RequestStatus.PREPARED).length,
    [RequestStatus.COMPLETED]: requests.filter(r => r.status === RequestStatus.COMPLETED).length,
    [RequestStatus.REJECTED]: requests.filter(r => r.status === RequestStatus.REJECTED).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-blue-900 mb-2">Equipment Requests</h1>
          <p className="text-gray-600">
            {isTeacher
              ? 'Request lab equipment for your practical sessions'
              : isLabAssistant
              ? 'Manage equipment requests from teachers'
              : 'View all equipment requests'}
          </p>
        </div>
        
        {isTeacher && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <FlaskConical className="w-4 h-4 mr-2" />
                New Equipment Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Request Lab Equipment</DialogTitle>
                <DialogDescription>
                  Submit equipment requirements for your upcoming practical session
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="labAssistant">Lab Assistant *</Label>
                    <Select
                      value={newRequest.labAssistantId}
                      onValueChange={(value) => setNewRequest({ ...newRequest, labAssistantId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lab assistant" />
                      </SelectTrigger>
                      <SelectContent>
                        {labAssistants.map((assistant) => (
                          <SelectItem key={assistant.id} value={assistant.id.toString()}>
                            {assistant.user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={newRequest.subject}
                      onValueChange={(value) => {
                        setNewRequest({ 
                          ...newRequest, 
                          subject: value, 
                          grade: '', 
                          className: '' 
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map((subject) => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade *</Label>
                    <Select
                      value={newRequest.grade}
                      onValueChange={(value) => {
                        setNewRequest({ 
                          ...newRequest, 
                          grade: value,
                          className: '' // Reset class when grade changes
                        });
                      }}
                      disabled={!newRequest.subject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {getGradeOptions(newRequest.subject).map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="className">Class *</Label>
                    <Select
                      value={newRequest.className}
                      onValueChange={(value) => setNewRequest({ ...newRequest, className: value })}
                      disabled={!newRequest.grade}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {newRequest.grade ? 
                          getClassOptions(newRequest.grade).map((cls) => (
                            <SelectItem key={cls} value={`${newRequest.grade}-${cls}`}>
                              Class {cls}
                            </SelectItem>
                          )) : null
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="practicalDate">Practical Date *</Label>
                    <Input
                      id="practicalDate"
                      type="date"
                      value={newRequest.practicalDate}
                      onChange={(e) => setNewRequest({ ...newRequest, practicalDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="practicalTime">Time Slot *</Label>
                    <Input
                      id="practicalTime"
                      placeholder="e.g., 10:00 AM - 12:00 PM"
                      value={newRequest.practicalTime}
                      onChange={(e) => setNewRequest({ ...newRequest, practicalTime: e.target.value })}
                    />
                  </div>
                </div>

                {/* Equipment Selection */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label>Equipment Items *</Label>
                    <span className="text-sm text-gray-500">
                      {newRequest.equipmentItems.length} item(s) added
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonEquipmentItems.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="number"
                      min="1"
                      value={equipmentQuantity}
                      onChange={(e) => setEquipmentQuantity(parseInt(e.target.value) || 1)}
                      className="w-24"
                      placeholder="Qty"
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddEquipment}
                      disabled={!selectedEquipment}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Equipment List */}
                  {newRequest.equipmentItems.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                      {newRequest.equipmentItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatCategory(item.category)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateEquipmentQuantity(index, parseInt(e.target.value) || 1)}
                              className="w-20 h-8 text-sm"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveEquipment(index)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Any special instructions or additional requirements..."
                    rows={3}
                    value={newRequest.additionalNotes}
                    onChange={(e) => setNewRequest({ ...newRequest, additionalNotes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRequest}
                  disabled={!newRequest.labAssistantId || !newRequest.subject || !newRequest.grade || !newRequest.className || !newRequest.practicalDate || !newRequest.practicalTime || newRequest.equipmentItems.length === 0 || isCreating}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {/* Status Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs 
          value={activeStatusFilter} 
          onValueChange={(value) => setActiveStatusFilter(value as any)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              All
            </TabsTrigger>
            <TabsTrigger value={RequestStatus.PENDING} className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({statusCounts[RequestStatus.PENDING]})
            </TabsTrigger>
            <TabsTrigger value={RequestStatus.APPROVED} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({statusCounts[RequestStatus.APPROVED]})
            </TabsTrigger>
            <TabsTrigger value={RequestStatus.PREPARED} className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              Prepared ({statusCounts[RequestStatus.PREPARED]})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCompletedRejected(!showCompletedRejected)}
          className="sm:ml-auto"
        >
          {showCompletedRejected ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Completed/Rejected
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show Completed/Rejected
            </>
          )}
        </Button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {displayRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No equipment requests found</p>
              {activeStatusFilter !== 'all' && (
                <p className="text-sm text-gray-500 mt-2">
                  No {activeStatusFilter.toLowerCase()} requests
                </p>
              )}
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
                        <CardTitle className="text-blue-900 flex items-center gap-2">
                          <FlaskConical className="w-5 h-5" />
                          {request.subject} - {request.className}
                        </CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.practicalDate).toLocaleDateString()} at {request.practicalTime}
                        </span>
                        <span>•</span>
                        <span>Teacher: {request.teacher.user.name}</span>
                        <span>•</span>
                        <span>Lab Assistant: {request.labAssistant.user.name}</span>
                      </CardDescription>
                    </div>
                    <div className="text-sm text-gray-500">
                      Requested: {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Equipment Items */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Equipment Required:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {request.equipmentItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatCategory(item.category)}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-white">
                              Qty: {item.quantity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {request.additionalNotes && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          {request.additionalNotes}
                        </p>
                      </div>
                    )}

                    {request.responseNote && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Response from Lab Assistant:</p>
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
                          {request.responseNote}
                          {request.responseDate && (
                            <span className="block mt-1 text-xs text-gray-500">
                              Responded on: {new Date(request.responseDate).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {isLabAssistant && request.labAssistant.userId === parseInt(userId) && (
                      <div className="flex gap-2 pt-2 flex-wrap">
                        {request.status === RequestStatus.PENDING && (
                          <>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                              onClick={() => handleUpdateRequestStatus(
                                request.id, 
                                RequestStatus.APPROVED,
                                'Equipment will be prepared and ready for your practical session.'
                              )}
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                              onClick={() => handleUpdateRequestStatus(
                                request.id, 
                                RequestStatus.REJECTED,
                                'Unable to fulfill request due to unavailability of equipment.'
                              )}
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-1" />
                              )}
                              Reject
                            </Button>
                          </>
                        )}
                        {request.status === RequestStatus.APPROVED && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            onClick={() => handleUpdateRequestStatus(
                              request.id, 
                              RequestStatus.PREPARED,
                              'Equipment has been prepared and set up in the laboratory.'
                            )}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            Mark as Prepared
                          </Button>
                        )}
                        {request.status === RequestStatus.PREPARED && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                            onClick={() => handleUpdateRequestStatus(
                              request.id, 
                              RequestStatus.COMPLETED,
                              'Practical session completed and equipment returned.'
                            )}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            Mark as Completed
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-auto"
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Contact Teacher
                        </Button>
                      </div>
                    )}

                    {isTeacher && request.teacher.userId === parseInt(userId) && request.status === RequestStatus.PENDING && (
                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-gray-600 hover:bg-gray-50"
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Contact Lab Assistant
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
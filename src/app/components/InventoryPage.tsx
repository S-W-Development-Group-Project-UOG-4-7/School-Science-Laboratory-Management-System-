'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, AlertTriangle, CheckCircle, Package, Info, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import type { UserRole } from '@/lib/types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

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
  addedBy: UserRole;
}

// Initial data with addedBy field
const initialInventoryItems: InventoryItem[] = [
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
    addedBy: 'lab-assistant',
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
    addedBy: 'teacher',
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
    addedBy: 'lab-assistant',
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
    addedBy: 'lab-assistant',
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
    addedBy: 'lab-assistant',
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
    addedBy: 'teacher',
  },
];

// Form for adding/editing items
const emptyInventoryItem: Omit<InventoryItem, 'id' | 'lastUpdated' | 'addedBy'> = {
  name: '',
  category: 'Glassware',
  stockLevel: 0,
  minStockLevel: 0,
  unit: 'pieces',
  location: '',
  photo: '',
  storageInstructions: '',
  handlingProcedure: '',
  safetyNotes: '',
};

export function InventoryPage({ userRole }: InventoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(initialInventoryItems);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id' | 'lastUpdated' | 'addedBy'>>(emptyInventoryItem);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter items based on user role
  const getFilteredItems = () => {
    let filtered = inventoryItems;
    
    // Teachers can only see items added by lab assistants
    
    
    // Apply search and category filters
    return filtered.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredItems = getFilteredItems();

  const getStockStatus = (item: InventoryItem) => {
    if (item.stockLevel <= item.minStockLevel) {
      return { label: 'Low Stock', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
  };

  // Check permissions
  const canEdit = userRole === 'lab-assistant'; // Only lab assistants can edit
  const canDelete = userRole === 'lab-assistant'; // Only lab assistants can delete
  const canAdd = userRole === 'lab-assistant'; // Only lab assistants can add

  // Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData(emptyInventoryItem);
  };

  // Open add dialog
  const handleAddClick = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const handleEditClick = (item: InventoryItem) => {
    const { id, lastUpdated, addedBy, ...itemData } = item;
    setFormData(itemData);
    setIsEditDialogOpen(true);
  };

  // Handle add item
  const handleAddItem = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        ...formData,
        lastUpdated: new Date().toISOString().split('T')[0],
        addedBy: 'lab-assistant' as UserRole,
      };
      
      setInventoryItems(prev => [...prev, newItem]);
      setIsSubmitting(false);
      setIsAddDialogOpen(false);
      resetForm();
    }, 500);
  };

  // Handle update item
  const handleUpdateItem = () => {
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedItems = inventoryItems.map(item => {
        if (item.id === selectedItem.id) {
          return {
            ...item,
            ...formData,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      });
      
      setInventoryItems(updatedItems);
      setIsSubmitting(false);
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedItem(null);
    }, 500);
  };

  // Handle delete item
  const handleDeleteClick = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;
    
    // Simulate API call
    setTimeout(() => {
      setInventoryItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }, 500);
  };

  // Statistics calculations
  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter(item => item.stockLevel <= item.minStockLevel).length;
  const labAssistantItems = inventoryItems.filter(item => item.addedBy === 'lab-assistant').length;
  const teacherItems = inventoryItems.filter(item => item.addedBy === 'teacher').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-2">Laboratory Inventory</h2>
          <p className="text-gray-600">
            {userRole === 'teacher' 
              ? 'Viewing items added by lab assistants' 
              : 'Manage and track all laboratory equipment, glassware, and materials'}
          </p>
        </div>
        {canAdd && (
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleAddClick}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 transition-all hover:border-blue-400 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="hover:border-blue-400 transition-colors">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">{totalItems}</p>
            <p className="text-sm text-gray-600">Unique item types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{lowStockItems}</p>
            <p className="text-sm text-gray-600">Items need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lab Assistant Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-600">{labAssistantItems}</p>
            <p className="text-sm text-gray-600">Added by lab assistants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">Today</p>
            <p className="text-sm text-gray-600">{new Date().toISOString().split('T')[0]}</p>
          </CardContent>
        </Card>
      </div>

      {/* Role-based notice for teachers */}
      {userRole === 'teacher' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-700">
                You are viewing only items added by lab assistants. You cannot add, edit, or delete items.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const status = getStockStatus(item);
          const StatusIcon = status.icon;

          return (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-100">
                <ImageWithFallback
                  src={item.photo}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant="outline" className="text-xs">
                      Added by: {item.addedBy}
                    </Badge>
                  </div>
                  <Badge className={status.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription>Location: {item.location}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="text-gray-900">
                      {item.stockLevel} {item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Min. Required</p>
                    <p className="text-gray-900">
                      {item.minStockLevel} {item.unit}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{item.name}</DialogTitle>
                        <DialogDescription>
                          Complete information and handling procedures
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={item.photo}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Category</p>
                            <p className="text-gray-900">{item.category}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="text-gray-900">{item.location}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Stock Level</p>
                            <p className="text-gray-900">
                              {item.stockLevel} {item.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Added By</p>
                            <p className="text-gray-900">{item.addedBy}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Last Updated</p>
                            <p className="text-gray-900">{item.lastUpdated}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Unit</p>
                            <p className="text-gray-900">{item.unit}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-gray-900 mb-2">Storage Instructions</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {item.storageInstructions}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="text-blue-900 mb-2">Handling Procedure</h4>
                            <p className="text-sm text-gray-700">{item.handlingProcedure}</p>
                          </div>

                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <h4 className="text-red-900 mb-2">⚠️ Safety Notes</h4>
                            <p className="text-sm text-gray-700">{item.safetyNotes}</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {(canEdit || canDelete) && (
                    <div className="flex gap-2">
                      {canEdit && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditClick(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              {userRole === 'teacher' 
                ? 'No items have been added by lab assistants yet.' 
                : 'Try adjusting your filters or search query'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Fill in the details for the new inventory item
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter item name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Glassware">Glassware</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Chemicals">Chemicals</SelectItem>
                    <SelectItem value="Safety">Safety Equipment</SelectItem>
                    <SelectItem value="Instruments">Instruments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockLevel">Current Stock Level *</Label>
                <Input
                  id="stockLevel"
                  type="number"
                  min="0"
                  value={formData.stockLevel}
                  onChange={(e) => handleInputChange('stockLevel', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minStockLevel">Minimum Stock Level *</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  min="0"
                  value={formData.minStockLevel}
                  onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(value) => handleInputChange('unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                    <SelectItem value="pairs">Pairs</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="grams">Grams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Storage Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Cabinet A2 - Shelf 3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo URL</Label>
              <Input
                id="photo"
                value={formData.photo}
                onChange={(e) => handleInputChange('photo', e.target.value)}
                placeholder="Enter image URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storageInstructions">Storage Instructions</Label>
              <Textarea
                id="storageInstructions"
                value={formData.storageInstructions}
                onChange={(e) => handleInputChange('storageInstructions', e.target.value)}
                placeholder="Enter storage instructions"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="handlingProcedure">Handling Procedure</Label>
              <Textarea
                id="handlingProcedure"
                value={formData.handlingProcedure}
                onChange={(e) => handleInputChange('handlingProcedure', e.target.value)}
                placeholder="Enter handling procedure"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="safetyNotes">Safety Notes</Label>
              <Textarea
                id="safetyNotes"
                value={formData.safetyNotes}
                onChange={(e) => handleInputChange('safetyNotes', e.target.value)}
                placeholder="Enter safety notes"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleAddItem}
              disabled={isSubmitting || !formData.name || !formData.location}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Item
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the details for this inventory item
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Item Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Glassware">Glassware</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Chemicals">Chemicals</SelectItem>
                    <SelectItem value="Safety">Safety Equipment</SelectItem>
                    <SelectItem value="Instruments">Instruments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-stockLevel">Current Stock Level *</Label>
                <Input
                  id="edit-stockLevel"
                  type="number"
                  min="0"
                  value={formData.stockLevel}
                  onChange={(e) => handleInputChange('stockLevel', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-minStockLevel">Minimum Stock Level *</Label>
                <Input
                  id="edit-minStockLevel"
                  type="number"
                  min="0"
                  value={formData.minStockLevel}
                  onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit *</Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(value) => handleInputChange('unit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                    <SelectItem value="pairs">Pairs</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="grams">Grams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-location">Storage Location *</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-photo">Photo URL</Label>
              <Input
                id="edit-photo"
                value={formData.photo}
                onChange={(e) => handleInputChange('photo', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-storageInstructions">Storage Instructions</Label>
              <Textarea
                id="edit-storageInstructions"
                value={formData.storageInstructions}
                onChange={(e) => handleInputChange('storageInstructions', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-handlingProcedure">Handling Procedure</Label>
              <Textarea
                id="edit-handlingProcedure"
                value={formData.handlingProcedure}
                onChange={(e) => handleInputChange('handlingProcedure', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-safetyNotes">Safety Notes</Label>
              <Textarea
                id="edit-safetyNotes"
                value={formData.safetyNotes}
                onChange={(e) => handleInputChange('safetyNotes', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedItem(null);
              }}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleUpdateItem}
              disabled={isSubmitting || !formData.name || !formData.location}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Item
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "
              {itemToDelete?.name}" from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import useSWR, { mutate } from 'swr';
import { Search, AlertTriangle, CheckCircle, Package, Info, Plus, Edit, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import type { InventoryItem, UserRole } from "@/app/lib/types";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface InventoryPageProps {
  userRole: UserRole;
}



//const fetcher = (url: string) => fetch(url).then(res => res.json());
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  const data = await res.json();
  // Ensure we always return an array
   return data.inventoryItems || [];
}; 
const LOCATIONS = [
  'Junior Lab',
  'Physics Lab',
  'Bio Lab',
  'Chemistry Lab'
];

export function InventoryPage({ userRole }: InventoryPageProps) {
  const { data: inventoryItems, error } = useSWR<InventoryItem[]>(
    '/api/inventory',
    fetcher
  );
  
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'Equipment' as InventoryItem['category'],
    stockLevel: 0,
    minStockLevel: 0,
    unit: '',
    location: 'Junior Lab',
    storageInstructions: '',
    handlingProcedure: '',
    safetyNotes: '',
    photo: '',
  });

  if (error) return <div>Failed to load inventory</div>;
  if (!inventoryItems) return <div>Loading inventory...</div>;

  const filteredItems = inventoryItems.filter((item: InventoryItem) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });
  
  // Sort items: low stock items first
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aIsLowStock = a.stockLevel <= a.minStockLevel;
    const bIsLowStock = b.stockLevel <= b.minStockLevel;
    
    if (aIsLowStock && !bIsLowStock) return -1;
    if (!aIsLowStock && bIsLowStock) return 1;
    return 0;
  });

  const canEdit = userRole === 'admin' || userRole === 'lab-assistant';

  const getStockStatus = (item: InventoryItem) => {
    if (item.stockLevel <= item.minStockLevel) {
      return { label: 'Low Stock', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
  };

 const handleAddItem = async () => {
  const formData = new FormData();
  formData.append('name', form.name);
  formData.append('category', form.category);
  formData.append('stockLevel', form.stockLevel.toString());
  formData.append('minStockLevel', form.minStockLevel.toString());
  formData.append('unit', form.unit);
  formData.append('location', form.location);
  formData.append('storageInstructions', form.storageInstructions);
  formData.append('handlingProcedure', form.handlingProcedure);
  formData.append('safetyNotes', form.safetyNotes);

  if (photoFile) {
    formData.append('photo', photoFile); // attach the file
  }

  await fetch('/api/inventory', {
    method: 'POST',
    body: formData, // send as FormData
  });

  setOpenAdd(false);
  setForm({
    name: '',
    category: 'Equipment',
    stockLevel: 0,
    minStockLevel: 0,
    unit: '',
    location: 'Junior Lab',
    storageInstructions: '',
    handlingProcedure: '',
    safetyNotes: '',
    photo: '',
  });
  setPhotoFile(null);
  mutate('/api/inventory');
};

  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    await fetch('/api/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, id: selectedItem.id }),
    });
    setSelectedItem(null);
    mutate('/api/inventory');
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    await fetch('/api/inventory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId }),
    });
    mutate('/api/inventory');
  };

  const inStockCount = inventoryItems.filter(item => item.stockLevel > item.minStockLevel).length;
  const lowStockCount = inventoryItems.filter(item => item.stockLevel <= item.minStockLevel).length;
 
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-2">Laboratory Inventory</h2>
          <p className="text-gray-600">
            Manage and track all laboratory equipment, glassware, and materials
          </p>
        </div>
        {canEdit && (
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setOpenAdd(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>
      
      {/* Add Item Dialog */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Fill in all the required information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Item Name</label>
              <Input
                placeholder="Enter item name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm({ ...form, category: value as InventoryItem['category'] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Glassware">Glassware</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Chemicals">Chemicals</SelectItem>
                  <SelectItem value="Safety Materials">Safety Materials</SelectItem>
                  <SelectItem value="Instruments">Instruments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Quantity</label>
              <Input
                type="number"
                min={0}
                placeholder="Enter quantity"
                value={form.stockLevel}
                onChange={(e) =>
                  setForm({ ...form, stockLevel: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Minimum Stock Level</label>
              <Input
                type="number"
                min={0}
                placeholder="Enter minimum stock level"
                value={form.minStockLevel}
                onChange={(e) =>
                  setForm({ ...form, minStockLevel: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Unit</label>
              <Input
                placeholder="e.g., pcs, ml, kg"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Location</label>
              <Select
                value={form.location}
                onValueChange={(value) => setForm({ ...form, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
            <label className="text-sm font-medium mb-1 block">Upload Photo</label>
            <input
               type="file"
               accept="image/*"
               onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
               className="block w-full text-sm text-gray-600"
             />
             {photoFile && <p className="text-sm mt-1">{photoFile.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Storage Instructions</label>
              <Textarea
                placeholder="Enter storage instructions"
                value={form.storageInstructions}
                onChange={(e) =>
                  setForm({ ...form, storageInstructions: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Handling Procedure</label>
              <Textarea
                placeholder="Enter handling procedure"
                value={form.handlingProcedure}
                onChange={(e) =>
                  setForm({ ...form, handlingProcedure: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Safety Notes</label>
              <Textarea
                placeholder="Enter safety notes"
                value={form.safetyNotes}
                onChange={(e) =>
                  setForm({ ...form, safetyNotes: e.target.value })
                }
                rows={3}
              />
            </div>

            <Button onClick={handleAddItem} className="w-full">Save Item</Button>
          </div>
        </DialogContent>
      </Dialog>

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
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Glassware">Glassware</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Chemicals">Chemicals</SelectItem>
                  <SelectItem value="Safety Materials">Safety Materials</SelectItem>
                  <SelectItem value="Instruments">Instruments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">In Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{inStockCount}</p>
            <p className="text-sm text-gray-600">Items above minimum level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{lowStockCount}</p>
            <p className="text-sm text-gray-600">Items need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {inventoryItems.length > 0
                ? new Date(inventoryItems[0].lastUpdated).toLocaleDateString()
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-600">Last item updated</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedItems.map((item) => {
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
                  <Badge variant="outline">{item.category}</Badge>
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
                    <p className="text-lg font-semibold text-gray-900">
                      {item.stockLevel} {item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Min. Required</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {item.minStockLevel} {item.unit}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Details Dialog */}
                  <Dialog open={openDetails && selectedItem?.id === item.id} onOpenChange={(open) => {
                    if (!open) setOpenDetails(false);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedItem(item);
                          setOpenDetails(true);
                        }}
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
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Category</p>
                            <p>{item.category}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Location</p>
                            <p>{item.location}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Quantity</p>
                            <p>{item.stockLevel} {item.unit}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Minimum Stock</p>
                            <p>{item.minStockLevel} {item.unit}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Storage Instructions</p>
                          <p className="text-gray-700">{item.storageInstructions || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Handling Procedure</p>
                          <p className="text-gray-700">{item.handlingProcedure || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Safety Notes</p>
                          <p className="text-gray-700">{item.safetyNotes || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Last Updated</p>
                          <p className="text-gray-700">{new Date(item.lastUpdated).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {canEdit && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(item);
                          setForm(item);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={!!selectedItem && !openDetails} onOpenChange={(open) => {
        if (!open) setSelectedItem(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Item Name</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Quantity</label>
              <Input type="number" value={form.stockLevel} onChange={e => setForm({ ...form, stockLevel: Number(e.target.value) })} />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Minimum Stock Level</label>
              <Input type="number" value={form.minStockLevel} onChange={e => setForm({ ...form, minStockLevel: Number(e.target.value) })} />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Unit</label>
              <Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Location</label>
              <Select value={form.location} onValueChange={(value) => setForm({ ...form, location: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleUpdateItem} className="w-full">Update Item</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
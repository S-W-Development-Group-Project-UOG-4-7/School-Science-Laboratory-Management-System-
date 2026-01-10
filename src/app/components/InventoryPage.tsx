'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, AlertTriangle, CheckCircle, Package, Info, Plus, Edit, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import type { UserRole } from '@/lib/types';
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

export function InventoryPage({ userRole }: InventoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

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
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Storage Instructions</label>
                    <textarea
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter storage instructions..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Handling Procedure</label>
                    <textarea
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter handling procedure..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Safety Notes</label>
                    <textarea
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter safety notes..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Photo URL</label>
                    <Input placeholder="https://example.com/photo.jpg" className="mt-1" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Add Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

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

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const status = getStockStatus(item);
          const StatusIcon = status.icon;

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
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
                      <DialogHeader className="border-b border-gray-200 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">{item.name}</DialogTitle>
                            <DialogDescription className="text-gray-600 mt-1">
                              Complete information and handling procedures
                            </DialogDescription>
                          </div>
                          <DialogClose asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <X className="h-4 w-4" />
                            </Button>
                          </DialogClose>
                        </div>
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

                        {/* Details Table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead className="font-semibold">Property</TableHead>
                                <TableHead className="font-semibold">Value</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow className="border-b border-gray-100">
                                <TableCell className="font-medium text-gray-600 py-3">Category</TableCell>
                                <TableCell className="py-3">
                                  <Badge variant="outline" className="bg-gray-50">{item.category}</Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow className="border-b border-gray-100">
                                <TableCell className="font-medium text-gray-600 py-3">Location</TableCell>
                                <TableCell className="py-3">{item.location}</TableCell>
                              </TableRow>
                              <TableRow className="border-b border-gray-100">
                                <TableCell className="font-medium text-gray-600 py-3">Stock Level</TableCell>
                                <TableCell className="py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{item.stockLevel} {item.unit}</span>
                                    <Badge className={status.color} variant="outline">
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {status.label}
                                    </Badge>
                                  </div>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium text-gray-600 py-3">Last Updated</TableCell>
                                <TableCell className="py-3">{item.lastUpdated}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        {/* Handling Procedure */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Info className="w-4 h-4 text-blue-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-blue-900">Handling Procedure</h4>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">{item.handlingProcedure}</p>
                        </div>

                        {/* Safety Notes */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-red-900">⚠️ Safety Notes</h4>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">{item.safetyNotes}</p>
                        </div>

                        {/* Storage Instructions */}
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-emerald-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-emerald-900">Storage Instructions</h4>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">{item.storageInstructions}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

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
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2 font-semibold">No items found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
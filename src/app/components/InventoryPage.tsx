'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, AlertTriangle, CheckCircle, Package, Info, Plus, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
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
          <Button className="bg-blue-600 hover:bg-blue-700">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">{inventoryItems.length}</p>
            <p className="text-sm text-gray-600">Unique item types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{inventoryItems.filter(item => item.stockLevel <= item.minStockLevel).length}</p>
            <p className="text-sm text-gray-600">Items need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">Today</p>
            <p className="text-sm text-gray-600">2025-11-12</p>
          </CardContent>
        </Card>
      </div>

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
                            <p className="text-sm text-gray-600">Last Updated</p>
                            <p className="text-gray-900">{item.lastUpdated}</p>
                          </div>
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

                  {canEdit && (
                    <Button size="sm" variant="outline">
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
        <Card className="py-12">
          <CardContent className="text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
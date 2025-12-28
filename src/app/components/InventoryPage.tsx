'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import useSWR from 'swr';
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
import type { UserRole } from '@/app/lib/types'
import { ImageWithFallback } from './figma/ImageWithFallback';

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

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function InventoryPage({ userRole }: InventoryPageProps) {
  const { data: inventoryItems, error } = useSWR<InventoryItem[]>(
  '/api/inventory',
  fetcher
);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    // ✅ loading check BEFORE using inventoryItems
  if (error) return <div>Failed to load inventory</div>;
  if (!inventoryItems) return <div>Loading inventory...</div>;

const filteredItems = inventoryItems.filter((item: InventoryItem) => {
  const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesCategory =
    selectedCategory === 'all' || item.category === selectedCategory;

  return matchesSearch && matchesCategory;
});
  
    const canEdit = userRole === 'teacher' || userRole === 'staff';

  const getStockStatus = (item: InventoryItem) => {
    if (item.stockLevel <= item.minStockLevel) {
      return { label: 'Low Stock', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
  };
   if (!inventoryItems) return <div>Loading inventory...</div>;



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
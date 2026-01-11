
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import { Package } from 'lucide-react';

interface InventoryItem {
    id: number;
    instrumentName: string;
    description: string;
    quantity: number;
    safetyPrecautions: string;
}

export function ViewInventoriesPage() {
    const [inventories, setInventories] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchInventory() {
            try {
                const response = await fetch('/api/inventory');
                const data = await response.json();

                if (data.success) {
                    setInventories(data.data);
                } else {
                    setError(data.message + (data.error ? `: ${data.error}` : '') || 'Failed to fetch inventory');
                }
            } catch (err) {
                setError('An error occurred while fetching inventory');
            } finally {
                setIsLoading(false);
            }
        }

        fetchInventory();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Laboratory Inventories</h2>
                    <p className="text-gray-500">View available instruments and safety guidelines</p>
                </div>
            </div>

            <Card className="border-t-4 border-t-blue-500 shadow-md">
                <CardHeader>
                    <CardTitle>Instrument List</CardTitle>
                </CardHeader>
                <CardContent>
                    {inventories.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No inventory items found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50">
                                        <TableHead className="w-[200px] font-bold text-gray-700">Instrument Name</TableHead>
                                        <TableHead className="font-bold text-gray-700">Description</TableHead>
                                        <TableHead className="text-right font-bold text-gray-700">Quantity</TableHead>
                                        <TableHead className="font-bold text-gray-700 w-[300px]">Safety Precautions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventories.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                            <TableCell className="font-semibold text-blue-900">{item.instrumentName}</TableCell>
                                            <TableCell className="text-gray-600">{item.description}</TableCell>
                                            <TableCell className="text-right">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.quantity > 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {item.quantity}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {item.safetyPrecautions && (
                                                    <div className="flex items-start gap-2 text-red-700 bg-red-50 p-2 rounded text-sm">
                                                        <span>⚠️</span>
                                                        <span>{item.safetyPrecautions}</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

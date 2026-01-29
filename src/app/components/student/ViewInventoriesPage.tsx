
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

    // Local asset mapping for fields missing in DB (Image, Instructions)
    // In a production app, these should be added to the database schema
    const inventoryAssets: Record<string, { image: string; instructions: string }> = {
        'Microscope': {
            image: 'https://www.bioimager.com/wp-content/uploads/2015/07/mt6130-45.jpg',
            instructions: '1. Place slide on stage. 2. Turn on light source. 3. Adjust coarse focus. 4. Use fine focus for details.',
        },
        'Beaker': {
            image: 'https://images.unsplash.com/photo-1576161825126-70e6c467a54a?auto=format&fit=crop&q=80&w=800',
            instructions: 'Use for holding, mixing, or heating substances. Do not use for precise measurements.',
        },
        'Bunsen Burner': {
            image: 'https://th.bing.com/th/id/R.096fc18db5fb0b48723380f8e46087c2?rik=fGH%2b7h4OgkUKpw&pid=ImgRaw&r=0',
            instructions: '1. Connect usage gas hose. 2. Close air hole. 3. Light match/lighter. 4. Turn on gas.',
        },
        'Test Tube': {
            image: 'https://images.unsplash.com/photo-1629851717366-3843586cd49d?auto=format&fit=crop&q=80&w=800',
            instructions: 'Hold with test tube holder when heating. Always point mouth away from yourself and others.',
        },
        'Pipette': {
            image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800',
            instructions: 'Squeeze bulb before entering liquid. Release slowly to draw liquid. Maintain vertical position.',
        },
        'Thermometer': {
            image: 'https://images.unsplash.com/photo-1629851717366-3843586cd49d?auto=format&fit=crop&q=80&w=800', // Placeholder
            instructions: 'Handle with care. Do not use as a stirring rod. Read level at eye height.',
        },
        'Digital Balance': {
            image: 'https://th.bing.com/th/id/R.01c0b20acf2b97849962f8713a48c721?rik=6qeh3wvvjdXFVA&pid=ImgRaw&r=0',
            instructions: 'Place on flat surface. Press tare/zero before weighing. Place item gently on pan.',
        },
    };

    const defaultAsset = {
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800',
        instructions: 'Refer to standard laboratory safety manual for usage instructions.',
    };

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
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Browse Equipment</h2>
                    <p className="text-gray-500">Explore our equipment: usage purposes and instructions</p>
                </div>
            </div>

            {inventories.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No inventory items found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inventories.map((item) => {
                        // Find matching asset or partial match
                        const assetKey = Object.keys(inventoryAssets).find(key =>
                            item.instrumentName.toLowerCase().includes(key.toLowerCase())
                        );
                        const asset = assetKey ? inventoryAssets[assetKey] : defaultAsset;

                        return (
                            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200 flex flex-col h-full">
                                <div className="h-48 overflow-hidden bg-gray-100 relative">
                                    <img
                                        src={asset.image}
                                        alt={item.instrumentName}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                </div>

                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xl text-blue-900">{item.instrumentName}</CardTitle>
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Purpose</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {item.description || "No description available."}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">How to Use</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed bg-blue-50/50 p-2 rounded-md border border-blue-100">
                                            {asset.instructions}
                                        </p>
                                    </div>

                                    {item.safetyPrecautions && (
                                        <div className="mt-auto pt-2">
                                            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-2 rounded text-xs border border-amber-100">
                                                <span className="text-lg">⚠️</span>
                                                <span>{item.safetyPrecautions}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

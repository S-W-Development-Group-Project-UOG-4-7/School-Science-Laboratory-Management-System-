'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Package, AlertTriangle } from 'lucide-react';

interface InventoryItem {
    id: number;
    name: string;
    category: string;
    stockLevel: number;
    unit: string;
    location: string;
    storageInstructions: string | null;
    handlingProcedure: string | null;
    safetyNotes: string | null;
}

export function ViewInventoriesPage() {
    const [inventories, setInventories] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Local asset mapping for fields missing in DB (Image, Instructions)
    const inventoryAssets: Record<string, { image: string; instructions: string }> = {
        'Microscope': {
            image: 'https://th.bing.com/th/id/R.6fc5038fc9ad54633eb4618bba0fec2e?rik=jAhuzWHdCkAm0w&riu=http%3a%2f%2fwww.pngall.com%2fwp-content%2fuploads%2f2016%2f09%2fMicroscope-PNG-Picture.png&ehk=xKn9SiQxwYiAOjEO6Z88TT2IXi1qdtl%2fRlD%2f1NplVjE%3d&risl=&pid=ImgRaw&r=0',
            instructions: '1. Place slide on stage. 2. Turn on light source. 3. Adjust coarse focus. 4. Use fine focus for details.',
        },
        'Beaker': {
            image: 'https://www.ld-didactic.de/phk/images/150dpi/602024.jpg',
            instructions: 'Use for holding, mixing, or heating substances. Do not use for precise measurements.',
        },
        'Bunsen Burner': {
            image: 'https://cdn.britannica.com/71/203271-050-8006A1ED/Bunsen-burner-laboratory.jpg',
            instructions: '1. Connect usage gas hose. 2. Close air hole. 3. Light match/lighter. 4. Turn on gas.',
        },
        'Test Tube': {
            image: 'https://tse1.mm.bing.net/th/id/OIP.eNdj29YyjKUehHAF7r9SzAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
            instructions: 'Hold with test tube holder when heating. Always point mouth away from yourself and others.',
        },

        'Digital Balance': {
            image: 'https://5.imimg.com/data5/PI/OX/MY-2095577/digital-balance-500x500-500x500.jpg',
            instructions: 'Place on flat surface. Press tare/zero before weighing. Place item gently on pan.',
        },
    };

    const defaultAsset = {
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
        instructions: 'Refer to standard laboratory safety manual for usage instructions.',
    };

    useEffect(() => {
        async function fetchInventory() {
            try {
                const response = await fetch('/api/inventory');
                const data = await response.json();

                if (Array.isArray(data)) {
                    setInventories(data);
                } else if (data.success && Array.isArray(data.data)) {
                    // Fallback in case API changes
                    setInventories(data.data);
                } else {
                    setError('Failed to fetch inventory data format');
                }
            } catch (err) {
                setError('An error occurred while fetching inventory');
                console.error(err);
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
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 shadow-sm">
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm underline hover:text-red-700"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6">
            <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                <div className="p-3 bg-blue-100 rounded-full">
                    <Package className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Laboratory Equipment</h2>
                    <p className="text-gray-500">Browse available instruments and view usage guidelines</p>
                </div>
            </div>

            {inventories.length === 0 ? (
                <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No inventory items found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {inventories.map((item) => {
                        // Find matching asset or partial match
                        const assetKey = Object.keys(inventoryAssets).find(key =>
                            item.name.toLowerCase().includes(key.toLowerCase())
                        );
                        const asset = assetKey ? inventoryAssets[assetKey] : defaultAsset;

                        return (
                            <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-200 flex flex-col h-full group bg-white">
                                <div className="h-48 overflow-hidden bg-gray-100 relative">
                                    <img
                                        src={asset.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />

                                </div>

                                <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
                                    <CardTitle className="text-xl text-gray-900 group-hover:text-blue-700 transition-colors">
                                        {item.name}
                                    </CardTitle>
                                    <p className="text-sm text-gray-500">{item.category}</p>
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col space-y-4 pt-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Usage Instructions</h4>
                                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-sm text-gray-700 leading-relaxed">
                                            {/* Prefer DB storage/handling notes, fallback to asset instructions */}
                                            {item.handlingProcedure || asset.instructions}
                                        </div>
                                    </div>

                                    {item.storageInstructions && (
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Storage</h4>
                                            <p className="text-sm text-gray-600">{item.storageInstructions}</p>
                                        </div>
                                    )}

                                    {item.safetyNotes && (
                                        <div className="mt-auto pt-4">
                                            <div className="flex items-start gap-3 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm animate-in fade-in duration-500">
                                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                                <span>{item.safetyNotes}</span>
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

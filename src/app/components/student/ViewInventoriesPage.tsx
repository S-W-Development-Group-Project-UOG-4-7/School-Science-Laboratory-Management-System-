'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card'; // CardHeader is part of CardContent in the new design structure or we use it differently
import { Package, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/badge'; // Assuming we have this, or use standard div

interface InventoryItem {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    location: string;
    storageInstructions: string | null;
    handlingProcedure: string | null;
    safetyNotes: string | null;
    photo: string | null;
}

export function ViewInventoriesPage() {
    const [inventories, setInventories] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Local asset mapping for fields missing in DB or as fallback
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
            instructions: 'Do not overload. Place on flat surface. Press tare/zero before weighing. Place item gently on pan.',
        },
        'Hydrochloric Acid': {
            image: 'https://tse4.mm.bing.net/th/id/OIP.h0r8bWrCiNjfE1gsAbmnGAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
            instructions: 'Use in fume hood. Always add acid to water, never water to acid.'
        }
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

                // Correctly handle the API response format { inventoryItems: [...] }
                if (data.inventoryItems && Array.isArray(data.inventoryItems)) {
                    setInventories(data.inventoryItems);
                } else if (Array.isArray(data)) {
                    setInventories(data);
                } else if (data.data && Array.isArray(data.data)) {
                    setInventories(data.data);
                } else {
                    console.warn('Unexpected API response format:', data);
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
            <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 shadow-sm mx-auto max-w-2xl mt-8">
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
        <div className="max-w-7xl mx-auto space-y-8 p-6">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Laboratory Equipment</h2>
                    <p className="text-gray-500 mt-1">Browse available instruments and view usage guidelines</p>
                </div>
            </div>

            {inventories.length === 0 ? (
                <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No inventory items found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inventories.map((item) => {
                        // Find matching asset or partial match
                        const assetKey = Object.keys(inventoryAssets).find(key =>
                            item.name.toLowerCase().includes(key.toLowerCase())
                        );
                        // Use DB photo if available, else local asset, else default
                        const imageSrc = item.photo || (assetKey ? inventoryAssets[assetKey].image : defaultAsset.image);
                        const instructions = item.handlingProcedure || (assetKey ? inventoryAssets[assetKey].instructions : defaultAsset.instructions);

                        return (
                            <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-100 group bg-white flex flex-col">
                                {/* Image Section */}
                                <div className="h-48 overflow-hidden bg-gray-50 relative">
                                    <img
                                        src={imageSrc}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {/* Availability Badge - Removed */}
                                </div>

                                {/* Content Section */}
                                <CardContent className="p-6 flex-1 flex flex-col gap-6">

                                    {/* Title & Category */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-600 mb-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 capitalize">
                                            {item.category}
                                        </p>
                                    </div>

                                    {/* Usage Instructions */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            USAGE INSTRUCTIONS
                                        </h4>
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {instructions}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Storage */}
                                    <div className="mt-auto">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            STORAGE
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {item.storageInstructions || 'Store in a cool, dry place.'}
                                        </p>
                                    </div>

                                    {/* Safety Notes (Optional but requested) */}
                                    {item.safetyNotes && (
                                        <div className="pt-2 border-t border-gray-100 mt-2">
                                            <div className="flex items-start gap-2 text-amber-600">
                                                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <span className="text-xs font-medium">{item.safetyNotes}</span>
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

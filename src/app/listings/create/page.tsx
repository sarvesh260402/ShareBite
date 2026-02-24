'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Utensils, Calendar, MapPin, Package, Image as ImageIcon } from 'lucide-react';

export default function CreateListing() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'veg',
        quantity: '',
        expiryTime: '',
        image: '',
        lat: 0,
        lng: 0,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData({ ...formData, image: base64String });
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    location: {
                        type: 'Point',
                        coordinates: [formData.lng, formData.lat]
                    },
                    expiryTime: new Date(formData.expiryTime).toISOString()
                }),
            });

            if (res.ok) {
                router.push('/dashboard?message=Listing created successfully!');
            } else {
                alert('Failed to create listing');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Mock location picker for now
    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setFormData({
                    ...formData,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            });
        }
    };

    if ((session?.user as any)?.role !== 'sender') {
        return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Only food senders can add food.</div>;
    }

    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
                <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Utensils className="text-primary" /> Share Surplus Food
                </h1>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Listing Title</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., 10 Fresh Veggie Burgers"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Describe the food, ingredients, and any allergen info..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', resize: 'none' }}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
                        <select
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white' }}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="veg">Veg</option>
                            <option value="non-veg">Non-Veg</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Quantity</label>
                        <div style={{ position: 'relative' }}>
                            <Package size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                            <input
                                type="text"
                                required
                                placeholder="e.g. 5 people"
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Expiry Time</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                            <input
                                type="datetime-local"
                                required
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                value={formData.expiryTime}
                                onChange={(e) => setFormData({ ...formData, expiryTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Food Image</label>
                        <div style={{ position: 'relative' }}>
                            <ImageIcon size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                            <input
                                type="file"
                                accept="image/*"
                                required
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white' }}
                                onChange={handleImageChange}
                            />
                        </div>
                        {imagePreview && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '1rem' }}>
                                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                            </motion.div>
                        )}
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <button
                            type="button"
                            onClick={handleGetLocation}
                            className="btn btn-outline"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <MapPin size={18} /> {formData.lat ? `Location Set: ${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}` : 'Get My Current Location'}
                        </button>
                    </div>

                    <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                        >
                            {loading ? 'Posting Listing...' : 'Post Food Listing'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

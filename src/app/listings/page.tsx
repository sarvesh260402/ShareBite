'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Utensils, MapPin, Clock, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface Listing {
    _id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    quantity: string;
    expiryTime: string;
    status: string;
    user?: {
        _id: string;
        name: string;
        role: string;
        ratings: number;
    };
}

export default function Listings() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: 'all',
        distance: '10',
        lat: null as number | null,
        lng: null as number | null
    });

    useEffect(() => {
        // Get location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setFilters(prev => ({
                    ...prev,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }));
            });
        }
        fetchListings();
    }, [filters.category, filters.distance, filters.lat, filters.lng]);

    const fetchListings = async () => {
        setLoading(true);
        let url = `/api/food?category=${filters.category}&distance=${filters.distance}`;
        if (filters.lat && filters.lng) {
            url += `&lat=${filters.lat}&lng=${filters.lng}`;
        }

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) {
                setListings(data);
            } else {
                console.error('Expected array but got:', data);
                setListings([]);
            }
        } catch (err) {
            console.error('Error fetching listings:', err);
            setListings([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Find Surplus Food</h1>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                        <Filter size={18} />
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            style={{ background: 'none', border: 'none', outline: 'none' }}
                        >
                            <option value="all">All Categories</option>
                            <option value="veg">Veg</option>
                            <option value="non-veg">Non-Veg</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                        <MapPin size={18} />
                        <select
                            value={filters.distance}
                            onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
                            style={{ background: 'none', border: 'none', outline: 'none' }}
                        >
                            <option value="5">Within 5 km</option>
                            <option value="10">Within 10 km</option>
                            <option value="20">Within 20 km</option>
                            <option value="50">Within 50 km</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>Loading listings...</div>
            ) : listings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', background: '#f9f9f9', borderRadius: '1rem' }}>
                    <Utensils size={48} style={{ margin: '0 auto 1rem', color: '#ccc' }} />
                    <h3>No food listings found nearby</h3>
                    <p>Check back later or try adjusting your filters.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {listings.map((listing) => (
                        <motion.div
                            key={listing._id}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            style={{
                                background: 'white',
                                borderRadius: '1rem',
                                overflow: 'hidden',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                border: '1px solid var(--border)'
                            }}
                        >
                            <div style={{ height: '200px', background: '#eee', position: 'relative' }}>
                                {listing.image ? (
                                    <img src={listing.image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <Utensils size={48} color="#ccc" />
                                    </div>
                                )}
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', background: listing.category === 'veg' ? '#4caf50' : '#f44336', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    {listing?.category?.toUpperCase()}
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem' }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>{listing.title}</h3>
                                <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {listing.description}
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#555' }}>
                                        <MapPin size={16} />
                                        <span>{listing.user?.name || 'Local Donor'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#555' }}>
                                        <Clock size={16} />
                                        <span>Expires: {new Date(listing.expiryTime).toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link href={`/listings/${listing._id}`} className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                                    View Details
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

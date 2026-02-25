'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Clock, MapPin, Eye, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MyListingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            if ((session?.user as any)?.role !== 'sender') {
                router.push('/dashboard');
                return;
            }
            fetchMyListings();
        }
    }, [status]);

    const fetchMyListings = async () => {
        try {
            const userId = (session?.user as any)?.id;
            const res = await fetch(`/api/food?userId=${userId}&showAll=true`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setListings(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading listings...</div>;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#666', textDecoration: 'none' }}>
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>My Food Listings</h1>
                    <p style={{ color: '#666' }}>View and manage all your donated food items.</p>
                </div>
                <Link href="/listings/create" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> Create New Listing
                </Link>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {listings.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '5rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '1rem' }}>
                        <Package size={48} style={{ margin: '0 auto 1rem', color: '#ccc' }} />
                        <h3>No listings found</h3>
                        <p>You haven't shared any food yet. Click the button above to start sharing!</p>
                    </div>
                ) : (
                    listings.map((listing: any) => (
                        <div key={listing._id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <div style={{ height: '180px', background: '#eee', position: 'relative' }}>
                                {listing.image ? (
                                    <img src={listing.image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Package size={40} color="#ccc" /></div>
                                )}
                                <div style={{
                                    position: 'absolute', top: '1rem', right: '1rem',
                                    padding: '0.25rem 0.75rem', borderRadius: '1rem',
                                    background: listing.status === 'available' ? '#4caf50' : (listing.status === 'reserved' ? '#2196f3' : '#9e9e9e'),
                                    color: 'white', fontSize: '0.75rem', fontWeight: 'bold'
                                }}>
                                    {listing.status?.toUpperCase()}
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>{listing.title}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#555' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={16} />
                                        <span>Expires: {new Date(listing.expiryTime).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Package size={16} />
                                        <span>Quantity: {listing.quantity}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <Link href={`/listings/${listing._id}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Eye size={18} /> View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

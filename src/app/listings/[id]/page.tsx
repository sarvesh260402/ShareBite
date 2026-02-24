'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Utensils, MapPin, Clock, Package, Send, ArrowLeft, CheckCircle2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { use } from 'react';

// Dynamically import Map to avoid SSR errors
const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <div style={{ height: '300px', background: '#eee', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>
});

export default function ListingDetail() {
    const params = useParams();
    // In Next 15+ params should be unwrapped if accessing dynamically, though standard usage often works 
    // depending on the exact build pattern. Using `use(params as any)` is the modern safe way, but we will 
    // stick to standard id for compatibility unless further errors exist.
    const id = params.id as string;

    const { data: session } = useSession();
    const router = useRouter();
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [message, setMessage] = useState('');
    const [claimSuccess, setClaimSuccess] = useState(false);
    const [claimData, setClaimData] = useState<any>(null); // Store the Claim doc from API

    // New Delivery State tracking for custom input
    const [deliveryName, setDeliveryName] = useState('');
    const [deliveryPhone, setDeliveryPhone] = useState('');

    useEffect(() => {
        if (id) {
            fetchListing();
        }
    }, [id]);

    const fetchListing = async () => {
        try {
            const res = await fetch(`/api/food/${id}`);
            if (res.ok) {
                const data = await res.json();
                setListing(data);
            } else {
                setListing(null);
            }
        } catch (err) {
            console.error(err);
            setListing(null);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!session) {
            router.push('/login');
            return;
        }

        if (!deliveryName || !deliveryPhone) {
            alert('Please provide the Delivery Partner Name and Phone Number before accepting.');
            return;
        }

        setClaiming(true);
        try {
            const res = await fetch('/api/claims', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: id,
                    message,
                    deliveryName,
                    deliveryPhone
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setClaimData(data);
                setClaimSuccess(true);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to claim');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setClaiming(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading...</div>;
    if (!listing) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Listing not found.</div>;

    const isOwner = session?.user && (session.user as any).id === listing.user?._id;

    // Delivery Details derived from claim status
    const deliveryPartner = claimData?.deliveryInfo || {
        name: deliveryName,
        phone: deliveryPhone,
    };
    const billAmount = claimData?.billAmount || 0;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <Link
                href="/listings"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    padding: '0.5rem 1rem',
                    background: '#f5f5f5',
                    borderRadius: '0.5rem',
                    color: '#333',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none'
                }}
            >
                <ArrowLeft size={18} /> Back to Listings
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem' }}>
                {/* Left Side: Image & Description */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div style={{ borderRadius: '1rem', overflow: 'hidden', height: '400px', background: '#eee', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                        <img src={listing.image || '/placeholder-food.jpg'} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{listing.title}</h1>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', background: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }}>{listing?.category?.toUpperCase()}</span>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', background: '#fff3e0', color: '#ef6c00', fontWeight: 'bold' }}>{listing?.status?.toUpperCase()}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#555' }}>
                            <Package size={20} />
                            <span>Quantity: <strong>{listing.quantity}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#555' }}>
                            <Clock size={20} />
                            <span>Expires: <strong>{new Date(listing.expiryTime).toLocaleString()}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#555' }}>
                            <MapPin size={20} />
                            <span>Donated by: <strong>{listing.user?.name}</strong></span>
                        </div>
                    </div>

                    <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '1rem' }}>
                        <h3 style={{ marginBottom: '0.75rem' }}>About this food</h3>
                        <p style={{ color: '#666', lineHeight: '1.8' }}>{listing.description}</p>
                    </div>
                </motion.div>

                {/* Right Side: Claim Form inputs */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    {!isOwner && listing.status === 'available' && (!session || (session?.user as any)?.role === 'receiver') && !claimSuccess && (
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Want to claim this?</h3>

                            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#555' }}>Delivery Partner Name *</label>
                                    <input
                                        type="text"
                                        placeholder="E.g. Swiggy Genie, Self, Rohan..."
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                        value={deliveryName}
                                        onChange={(e) => setDeliveryName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#555' }}>Delivery Partner Phone *</label>
                                    <input
                                        type="tel"
                                        placeholder="+91 90000 00000"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                        value={deliveryPhone}
                                        onChange={(e) => setDeliveryPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <textarea
                                placeholder="Add an optional message for the donor..."
                                rows={2}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '1.5rem', resize: 'none' }}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />

                            <button
                                onClick={handleClaim}
                                disabled={claiming}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}
                            >
                                <Send size={20} /> {claiming ? 'Processing...' : 'Accept'}
                            </button>
                        </div>
                    )}

                    {claimSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ background: '#e8f5e9', padding: '2rem', borderRadius: '1rem', border: '1px solid #c8e6c9', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#2e7d32' }}>
                                <CheckCircle2 size={28} />
                                <h3 style={{ margin: 0 }}>Request Accepted!</h3>
                            </div>

                            <p style={{ color: '#388e3c', marginBottom: '1.5rem' }}>
                                Your request has been sent to the donor. Delivery details have been assigned.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Bill Display Section */}
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e0e0e0' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#333' }}>
                                        <Package size={20} /> Generated Bill
                                    </h4>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px dashed #ccc', paddingBottom: '0.5rem' }}>
                                        <span style={{ color: '#666' }}>Order ID:</span>
                                        <span style={{ fontWeight: 'bold' }}>#{claimData?._id?.slice(-6).toUpperCase() || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: '#666' }}>Food Cost:</span>
                                        <span style={{ fontWeight: 'bold' }}>₹0</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ color: '#666' }}>Delivery/Packaging Fee:</span>
                                        <span style={{ fontWeight: 'bold' }}>₹{billAmount}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #333', paddingTop: '0.5rem' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total Amount:</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#e53935' }}>₹{billAmount}</span>
                                    </div>
                                </div>

                                {/* Delivery Partner Section */}
                                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e0e0e0' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#333' }}>
                                        <User size={20} /> Delivery Partner Details
                                    </h4>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                                        <div>
                                            <p style={{ color: '#666', margin: 0 }}>Name</p>
                                            <p style={{ fontWeight: 'bold', margin: '0.25rem 0 0 0' }}>{deliveryPartner.name}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: '#666', margin: 0 }}>Contact</p>
                                            <p style={{ fontWeight: 'bold', margin: '0.25rem 0 0 0' }}>{deliveryPartner.phone}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: '#666', margin: 0 }}>Vehicle</p>
                                            <p style={{ fontWeight: 'bold', margin: '0.25rem 0 0 0' }}>Honda Activa</p>
                                        </div>
                                        <div>
                                            <p style={{ color: '#666', margin: 0 }}>Status</p>
                                            <p style={{ fontWeight: 'bold', margin: '0.25rem 0 0 0', color: '#ef6c00' }}>Waiting for Pickup</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/dashboard"
                                className="btn btn-outline"
                                style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', background: 'white' }}
                            >
                                Track in Dashboard
                            </Link>

                        </motion.div>
                    )}

                    {!isOwner && listing.status === 'available' && (session?.user as any)?.role === 'sender' && !claimSuccess && (
                        <div style={{ background: '#fff3e0', padding: '1.5rem', borderRadius: '1rem', textAlign: 'center' }}>
                            <p style={{ color: '#ef6c00' }}>As a food sender, you cannot claim other food items.</p>
                        </div>
                    )}

                    {isOwner && (
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                            <p style={{ color: '#666' }}>This is your listing. Check the dashboard to manage claims.</p>
                            <Link href="/dashboard" className="btn btn-outline" style={{ display: 'inline-block', marginTop: '1rem' }}>Go to Dashboard</Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

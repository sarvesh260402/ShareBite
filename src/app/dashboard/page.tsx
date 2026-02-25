'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Utensils, Package, Clock, CheckCircle, Plus, LayoutDashboard, History } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [data, setData] = useState<{ listings: any[], claims: any[] }>({ listings: [], claims: [] });
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState<any>(null); // State for generating popup bills

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchDashboardData();
        }
    }, [status]);

    const fetchDashboardData = async () => {
        try {
            // Fetch claims unconditionally for the current active user
            const claimsRes = await fetch('/api/claims');
            const claims = await claimsRes.json();

            // Fetch listings ONLY if explicitly assigned the sender role (to hide empty lists for strict receivers)
            let listings = [];
            if ((session?.user as any)?.role === 'sender') {
                const userId = (session?.user as any)?.id;
                console.log('Dashboard: current userId:', userId);
                // Fetch all listings for this user specifically
                const listingsRes = await fetch(`/api/food?userId=${userId}&showAll=true`);
                const allListings = await listingsRes.json();
                console.log('Dashboard: total listings from API:', allListings?.length);
                if (Array.isArray(allListings)) {
                    listings = allListings;
                    console.log('Dashboard: listings for sender:', listings.length);
                }
            }

            setData({
                listings: Array.isArray(listings) ? listings.filter(l => l.status === 'available' || l.status === 'reserved') : [],
                claims: Array.isArray(claims) ? claims : []
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateClaimStatus = async (claimId: string, status: string) => {
        try {
            const res = await fetch(`/api/claims/${claimId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchDashboardData();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to update claim');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const markListingAsCompleted = async (listingId: string, claimId: string) => {
        try {
            // Update the listing status to picked_up
            const listingRes = await fetch(`/api/food/${listingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'picked_up' })
            });

            // Update the claim status to completed
            const claimRes = await fetch(`/api/claims/${claimId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' })
            });

            if (listingRes.ok && claimRes.ok) {
                fetchDashboardData();
            } else {
                alert('Failed to complete the process');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (status === 'loading' || loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading dashboard...</div>;

    const role = (session?.user as any)?.role;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Welcome back, {session?.user?.name}!</h1>
                    <p style={{ color: '#666' }}>Manage your food sharing activity.</p>
                </div>
                {(session?.user as any)?.role === 'sender' && (
                    <Link href="/listings/create" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={20} /> Create Listing
                    </Link>
                )}
            </header>

            {/* Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {role === 'sender' && (
                    <Link href="/my-listings" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.2s', height: '100%' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                                <Package size={24} />
                                <h4 style={{ margin: 0 }}>My Listings</h4>
                            </div>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{data.listings.length}</p>
                        </div>
                    </Link>
                )}
                <Link href="/claims" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.2s', height: '100%' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                            <History size={24} />
                            <h4 style={{ margin: 0 }}>{role === 'sender' ? 'Claims Received' : 'My Claims'}</h4>
                        </div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{data.claims.length}</p>
                    </div>
                </Link>
            </div>

            {/* Main Content Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Active Listings for Senders */}
                {role === 'sender' && (
                    <section>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Your Active Listings</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {data.listings.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '0.5rem' }}>No active listings.</div>
                            ) : (
                                data.listings.map((listing: any) => (
                                    <div key={listing._id} style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <Link href={`/listings/${listing._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <h4 style={{ margin: '0 0 0.25rem', cursor: 'pointer', color: 'var(--primary)' }}>{listing.title}</h4>
                                            </Link>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>Status: {listing.status}</p>
                                        </div>
                                        <Link href={`/listings/${listing._id}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 'bold' }}>View Details</Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}

                {/* Recent Claims */}
                <section style={{ gridColumn: role === 'receiver' ? 'span 2' : 'span 1' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                        Your Claims & Generated Bills
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {data.claims.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '0.5rem' }}>No recent claims found.</div>
                        ) : (
                            data.claims.map((claim: any) => (
                                <div key={claim._id} style={{ background: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{claim.listing?.title}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                                                {role === 'receiver' || claim.claimant?._id === (session?.user as any)?.id ? `Donor: ${claim.listing?.user?.name || 'Anonymous'}` : `Claimed by: ${claim.claimant?.name}`}
                                            </p>
                                        </div>
                                        <div>
                                            <span style={{
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.65rem',
                                                fontWeight: 'bold',
                                                background: claim.status === 'pending' ? '#fff3e0' : (claim.status === 'approved' ? '#e8f5e9' : '#f5f5f5'),
                                                color: claim.status === 'pending' ? '#ef6c00' : (claim.status === 'approved' ? '#2e7d32' : '#666')
                                            }}>
                                                {claim.status?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => setSelectedBill(claim)}
                                            className="btn btn-outline"
                                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: '#f5f5f5', border: '1px solid #ddd', color: '#333' }}
                                        >
                                            View Bill
                                        </button>
                                        {(session?.user as any)?.role === 'sender' && claim.status === 'pending' && (
                                            <button
                                                onClick={() => updateClaimStatus(claim._id, 'approved')}
                                                className="btn btn-primary"
                                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {(session?.user as any)?.role === 'sender' && claim.status === 'approved' && (
                                            <button
                                                onClick={() => markListingAsCompleted(claim.listing?._id, claim._id)}
                                                className="btn btn-secondary"
                                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: '#4caf50', color: 'white', border: 'none' }}
                                            >
                                                Picked Up
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* View Full Bill Modal */}
            {selectedBill && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '1.5rem', borderRadius: '1.5rem',
                        width: '95%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
                                Generated Bill & Order Summary
                            </h2>
                            <button onClick={() => setSelectedBill(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}>&times;</button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Information</h4>
                            <p style={{ margin: '0 0 0.25rem 0' }}><strong>Order ID:</strong> #{selectedBill._id?.slice(-6).toUpperCase()}</p>
                            <p style={{ margin: '0 0 0.25rem 0' }}><strong>Food Item:</strong> {selectedBill.listing?.title}</p>
                            <p style={{ margin: '0 0 0.25rem 0' }}><strong>Status:</strong> <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{selectedBill.status?.toUpperCase()}</span></p>
                            <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(selectedBill.createdAt).toLocaleString()}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '0.75rem' }}>
                                <h4 style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Sender Info</h4>
                                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}><strong>Name:</strong> {selectedBill.listing?.user?.name || 'N/A'}</p>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                                    {selectedBill.listing?.user?.phoneNumber || selectedBill.listing?.user?.email || 'No contact provided'}
                                </p>
                            </div>
                            <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '0.75rem' }}>
                                <h4 style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Receiver Info</h4>
                                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}><strong>Name:</strong> {selectedBill.claimant?.name || 'N/A'}</p>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                                    {selectedBill.claimant?.phoneNumber || selectedBill.claimant?.email || 'No contact provided'}
                                </p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem', background: '#fff9c4', padding: '1rem', borderRadius: '0.75rem' }}>
                            <h4 style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Delivery Info</h4>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}><strong>Partner Name:</strong> {selectedBill.deliveryInfo?.name || 'N/A'}</p>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}><strong>Partner Contact:</strong> {selectedBill.deliveryInfo?.phone || 'N/A'}</p>
                        </div>

                        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e0e0e0', marginBottom: '2rem' }}>
                            <h4 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.1rem' }}>Billing Summary</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#555' }}>Food Cost:</span>
                                <strong>₹0</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: '#555' }}>Delivery & Packaging Fee:</span>
                                <strong>₹{selectedBill.billAmount || 0}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #ccc', paddingTop: '1rem' }}>
                                <strong style={{ fontSize: '1.2rem' }}>Total Amount:</strong>
                                <strong style={{ color: '#e53935', fontSize: '1.2rem' }}>₹{selectedBill.billAmount || 0}</strong>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedBill(null)}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}
                        >
                            Close Bill
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

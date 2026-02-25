'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, Clock, CheckCircle, Package } from 'lucide-react';
import Link from 'next/link';

export default function ClaimsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState<any>(null);

    const downloadBill = (bill: any) => {
        const content = `
╔════════════════════════════════════════════╗
║             SHAREBITE RECEIPT              ║
╚════════════════════════════════════════════╝

ORDER INFORMATION
----------------------------------------------
Order ID:    #${bill._id?.slice(-6).toUpperCase()}
Date:        ${new Date(bill.createdAt).toLocaleString()}
Food Item:   ${bill.listing?.title}
Status:      ${bill.status?.toUpperCase()}

SENDER INFORMATION
----------------------------------------------
Name:        ${bill.listing?.user?.name || 'N/A'}
Contact:     ${bill.listing?.user?.phoneNumber || bill.listing?.user?.email || 'N/A'}

RECEIVER INFORMATION
----------------------------------------------
Name:        ${bill.claimant?.name || 'N/A'}
Contact:     ${bill.claimant?.phoneNumber || bill.claimant?.email || 'N/A'}

DELIVERY INFORMATION
----------------------------------------------
Partner:     ${bill.deliveryInfo?.name || 'N/A'}
Phone:       ${bill.deliveryInfo?.phone || 'N/A'}

BILLING SUMMARY
----------------------------------------------
Food Cost:                    ₹0
Delivery & Packaging Fee:     ₹${bill.billAmount || 0}
----------------------------------------------
TOTAL AMOUNT:                 ₹${bill.billAmount || 0}

Thank you for saving food with ShareBite!
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ShareBite_Bill_${bill._id?.slice(-6).toUpperCase()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchClaims();
        }
    }, [status]);

    const fetchClaims = async () => {
        try {
            const res = await fetch('/api/claims');
            const data = await res.json();
            setClaims(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading claims...</div>;

    const role = (session?.user as any)?.role;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>My Claims</h1>
                    <p style={{ color: '#666' }}>Track your food requests and delivery status.</p>
                </div>
                <Link href="/listings" className="btn btn-primary">Find More Food</Link>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {claims.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '5rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '1rem' }}>
                        <History size={48} style={{ margin: '0 auto 1rem', color: '#ccc' }} />
                        <h3>No claims found</h3>
                        <p>You haven't claimed any food yet. Go to the listings page to find available surplus food.</p>
                    </div>
                ) : (
                    claims.map((claim: any) => (
                        <div key={claim._id} style={{ background: 'white', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{ width: '60px', height: '60px', flexShrink: 0, background: '#eee', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                    {claim.listing?.image ? (
                                        <img src={claim.listing.image} alt={claim.listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Package size={24} color="#ccc" /></div>
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{claim.listing?.title}</h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', fontSize: '0.75rem', color: '#666' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={14} /> {new Date(claim.createdAt).toLocaleDateString()}</span>
                                        <span>Donor: {claim.listing?.user?.name || 'Anon'}</span>
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold',
                                            background: claim.status === 'pending' ? '#fff3e0' : (claim.status === 'approved' ? '#e8f5e9' : '#f5f5f5'),
                                            color: claim.status === 'pending' ? '#ef6c00' : (claim.status === 'approved' ? '#2e7d32' : '#666'),
                                        }}>
                                            {claim.status?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ fontSize: '0.8rem', color: '#555', marginBottom: '1rem', fontStyle: 'italic' }}>
                                "{claim.message || 'No message'}"
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setSelectedBill(claim)}
                                    className="btn btn-outline"
                                    style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.5rem' }}
                                >
                                    Bill
                                </button>
                                <Link href={`/listings/${claim.listing?._id}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', padding: '0.4rem 0.5rem' }}>
                                    Details
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bill Modal (Simplified reuse from Dashboard) */}
            {selectedBill && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '2rem', borderRadius: '1rem',
                        width: '90%', maxWidth: '500px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Bill Summary</h2>
                            <button onClick={() => setSelectedBill(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p><strong>Item:</strong> {selectedBill.listing?.title}</p>
                            <p><strong>Order ID:</strong> #{selectedBill._id?.slice(-6).toUpperCase()}</p>
                            <p><strong>Date:</strong> {new Date(selectedBill.createdAt).toLocaleString()}</p>
                        </div>

                        {selectedBill.deliveryInfo && (
                            <div style={{ marginBottom: '1.5rem', background: '#fff9c4', padding: '1rem', borderRadius: '0.5rem' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: '#666' }}>Delivery Info</h4>
                                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}><strong>Name:</strong> {selectedBill.deliveryInfo.name}</p>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Contact:</strong> {selectedBill.deliveryInfo.phone}</p>
                            </div>
                        )}

                        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Food Cost</span>
                                <span>₹0</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Delivery Fee</span>
                                <span>₹{selectedBill.billAmount || 0}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '0.5rem', fontWeight: 'bold' }}>
                                <span>Total Amount</span>
                                <span style={{ color: '#e53935' }}>₹{selectedBill.billAmount || 0}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => downloadBill(selectedBill)}
                                className="btn btn-outline"
                                style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', fontWeight: 'bold', border: '2px solid var(--primary)', color: 'var(--primary)' }}
                            >
                                Download Bill
                            </button>
                            <button
                                onClick={() => setSelectedBill(null)}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', fontWeight: 'bold' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

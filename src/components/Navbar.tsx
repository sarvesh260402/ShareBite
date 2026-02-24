'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Utensils, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 1000 }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
                    <Utensils size={28} />
                    <span>ShareBite</span>
                </Link>

                {/* Desktop Menu */}
                <div style={{ display: 'none', gap: '1.5rem', alignItems: 'center' }} className="desktop-menu">
                    <Link href="/listings">Find Food</Link>
                    {session ? (
                        <>
                            <Link href="/dashboard">Dashboard</Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={20} />
                                <span>{session.user?.name}</span>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="btn btn-outline"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="btn btn-outline">Login</Link>
                            <Link href="/register" className="btn btn-primary">Register</Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ display: 'none', background: 'none' }}
                    className="mobile-toggle"
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div style={{ padding: '1rem', background: 'white', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link href="/listings" onClick={() => setIsOpen(false)}>Find Food</Link>
                        {session ? (
                            <>
                                <Link href="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                <button onClick={() => signOut()} className="btn btn-outline">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                                <Link href="/register" onClick={() => setIsOpen(false)} className="btn btn-primary">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
        @media (min-width: 768px) {
          .desktop-menu { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 767px) {
          .mobile-toggle { display: block !important; }
        }
      `}</style>
        </nav>
    );
}

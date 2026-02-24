'use client';

import Link from 'next/link';
import { Utensils, Heart, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '5rem 1rem',
        background: 'linear-gradient(135deg, #f1f8e9 0%, #fff3e0 100%)',
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container"
        >
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: '#2e7d32' }}>
            Share Surplus Food,<br />Feed Your Community
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#555', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Join ShareBite to connect with neighbors, restaurants, and NGOs to share quality surplus food and reduce waste.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/listings" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Find Food Nearby
            </Link>
            <Link href="/register" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Start Sharing
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container" style={{ padding: '5rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ textAlign: 'center', padding: '2rem', borderRadius: '1rem', background: '#f9f9f9' }}>
            <div style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
              <Utensils size={48} style={{ margin: '0 auto' }} />
            </div>
            <h3>Reduce Waste</h3>
            <p>Save perfectly good food from going to landfills and help the environment.</p>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', borderRadius: '1rem', background: '#f9f9f9' }}>
            <div style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>
              <Heart size={48} style={{ margin: '0 auto' }} />
            </div>
            <h3>Feed People</h3>
            <p>Connect with local NGOs and community members to ensure no one goes hungry.</p>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem', borderRadius: '1rem', background: '#f9f9f9' }}>
            <div style={{ marginBottom: '1rem', color: '#1976d2' }}>
              <ShieldCheck size={48} style={{ margin: '0 auto' }} />
            </div>
            <h3>Safe & Secure</h3>
            <p>Verified users and quality standards to ensure food safety for everyone.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

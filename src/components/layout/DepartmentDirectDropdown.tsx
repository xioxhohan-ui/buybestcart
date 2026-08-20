'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import {
  Cpu,
  Laptop,
  Gamepad2,
  Home,
  ShieldCheck,
  Sparkles,
  HeartPulse,
  Dumbbell,
  Tent,
  ArrowRight,
  X,
} from 'lucide-react';
import { isReducedMotion } from '@/lib/animation';

interface DepartmentDirectDropdownProps {
  activeDepartment: string | null;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

interface CuratedCluster {
  title: string;
  items: Array<{ name: string; slug: string }>;
}

interface CuratedDepartment {
  label: string;
  icon: React.ElementType;
  overviewSlug: string;
  tagline: string;
  clusters: CuratedCluster[];
}

const CONCISE_DEPARTMENTS: Record<string, CuratedDepartment> = {
  electronics: {
    label: 'Electronics & Audio',
    icon: Cpu,
    overviewSlug: '/category/electronics',
    tagline: 'Flagship phones, ANC headphones, 4K monitors, GaN fast chargers & high-speed SSDs',
    clusters: [
      {
        title: 'Phones & Tablets',
        items: [
          { name: 'Smartphones (iPhone & Galaxy)', slug: 'smartphones' },
          { name: 'Tablets & iPads', slug: 'tablets' },
          { name: 'E-Readers & Paper Tablets', slug: 'e-readers' },
          { name: 'Smartwatches & Trackers', slug: 'smartwatches' },
        ],
      },
      {
        title: 'Audio & Acoustics',
        items: [
          { name: 'Noise-Cancelling Headphones', slug: 'noise-cancelling-headphones' },
          { name: 'True Wireless Earbuds', slug: 'wireless-earbuds' },
          { name: 'Bluetooth Portable Speakers', slug: 'bluetooth-speakers' },
          { name: 'Soundbars & Home Audio', slug: 'soundbars' },
        ],
      },
      {
        title: 'Monitors & Video',
        items: [
          { name: '4K & Ultrawide Monitors', slug: 'ultrawide-monitors' },
          { name: 'Portable USB-C Monitors', slug: 'portable-monitors' },
          { name: 'Streaming Sticks & Hubs', slug: 'streaming-devices' },
          { name: 'Webcams & USB Microphones', slug: 'webcams' },
        ],
      },
      {
        title: 'Power & Storage',
        items: [
          { name: 'Fast GaN Wall Chargers', slug: 'gan-chargers' },
          { name: 'MagSafe & Wireless Docks', slug: 'wireless-chargers' },
          { name: 'Portable Power Banks', slug: 'power-banks' },
          { name: 'External NVMe SSDs', slug: 'external-ssds' },
        ],
      },
    ],
  },
  computers: {
    label: 'Computers & Laptops',
    icon: Laptop,
    overviewSlug: '/category/computers-laptops',
    tagline: 'Apple MacBooks, RTX gaming laptops, mechanical keyboards & mesh Wi-Fi',
    clusters: [
      {
        title: 'Laptops',
        items: [
          { name: 'Apple MacBooks (M3 / Pro)', slug: 'macbooks' },
          { name: 'Windows Productivity Laptops', slug: 'business-laptops' },
          { name: 'GeForce RTX Gaming Laptops', slug: 'gaming-laptops' },
          { name: '2-in-1 Touchscreen Laptops', slug: '2-in-1-laptops' },
        ],
      },
      {
        title: 'Desktops & Rigs',
        items: [
          { name: 'Prebuilt Gaming Desktop PCs', slug: 'gaming-pcs' },
          { name: 'All-in-One Desktop PCs', slug: 'all-in-one-pcs' },
          { name: 'Compact Mini PCs', slug: 'mini-pcs' },
        ],
      },
      {
        title: 'Keyboards, Mice & Docks',
        items: [
          { name: 'Custom Mechanical Keyboards', slug: 'mechanical-keyboards' },
          { name: 'Wireless Ergonomic Mice', slug: 'ergonomic-mouse' },
          { name: 'Thunderbolt & USB-C Docks', slug: 'docking-stations' },
          { name: 'Laptop Cooling Stands', slug: 'laptop-stands' },
        ],
      },
      {
        title: 'Components & Mesh Wi-Fi',
        items: [
          { name: 'High-Speed NVMe RAM & SSDs', slug: 'ram-ssd' },
          { name: 'CPU Coolers & PC Cases', slug: 'pc-cooling' },
          { name: 'Wi-Fi 7 Mesh Router Systems', slug: 'mesh-wifi' },
        ],
      },
    ],
  },
  gaming: {
    label: 'Gaming & High-Refresh Gear',
    icon: Gamepad2,
    overviewSlug: '/category/gaming',
    tagline: 'Consoles, handhelds, high-refresh OLED displays, VR & gaming battlestations',
    clusters: [
      {
        title: 'Consoles & Handhelds',
        items: [
          { name: 'PlayStation 5 & PSVR2', slug: 'playstation' },
          { name: 'Xbox Series X / Series S', slug: 'xbox' },
          { name: 'Nintendo Switch & OLED', slug: 'nintendo-switch' },
          { name: 'Steam Deck & Handheld PCs', slug: 'handheld-gaming' },
        ],
      },
      {
        title: 'Displays & Controllers',
        items: [
          { name: '240Hz+ OLED Gaming Monitors', slug: 'gaming-monitors' },
          { name: 'Pro Wireless Controllers', slug: 'gaming-controllers' },
          { name: 'Force Feedback Racing Wheels', slug: 'racing-wheels' },
          { name: 'HOTAS Flight Simulators', slug: 'flight-simulators' },
        ],
      },
      {
        title: 'Audio & Streaming',
        items: [
          { name: 'Spatial Audio Gaming Headsets', slug: 'gaming-headsets' },
          { name: '4K HDMI Capture Cards', slug: 'capture-cards' },
          { name: 'USB Streaming Microphones', slug: 'gaming-microphones' },
          { name: 'Ambient RGB Smart Lights', slug: 'gaming-lights' },
        ],
      },
      {
        title: 'Battlestation Furniture',
        items: [
          { name: 'Ergonomic Gaming Chairs', slug: 'gaming-chairs' },
          { name: 'Electric Height Gaming Desks', slug: 'gaming-desks' },
          { name: 'Console Cooling Charging Docks', slug: 'console-chargers' },
        ],
      },
    ],
  },
  home: {
    label: 'Home & Kitchen Living',
    icon: Home,
    overviewSlug: '/category/smart-home',
    tagline: 'Air fryers, espresso makers, chef knives, standing desks & smart ambient lights',
    clusters: [
      {
        title: 'Small Kitchen Appliances',
        items: [
          { name: 'Dual-Zone Air Fryers', slug: 'air-fryers' },
          { name: 'Espresso Machines & Grinders', slug: 'espresso-machines' },
          { name: 'High-Speed Blenders & Juicers', slug: 'blenders' },
          { name: 'Instant Pots & Multi-Cookers', slug: 'pressure-cookers' },
        ],
      },
      {
        title: 'Cookware & Cutlery',
        items: [
          { name: 'Non-Stick Cookware Sets', slug: 'cookware' },
          { name: 'Japanese Chef Knife Sets', slug: 'knife-sets' },
          { name: 'Bamboo Cutting Boards', slug: 'cutting-boards' },
          { name: 'Glass Food Storage Sets', slug: 'storage-containers' },
        ],
      },
      {
        title: 'Furniture & Sleep',
        items: [
          { name: 'Electric Standing Desks', slug: 'desks' },
          { name: 'Ergonomic Mesh Office Chairs', slug: 'chairs' },
          { name: 'Cooling Memory Foam Mattresses', slug: 'mattresses' },
          { name: 'Blackout Curtains & Rugs', slug: 'curtains-rugs' },
        ],
      },
      {
        title: 'Organization & Lighting',
        items: [
          { name: 'Pantry & Spice Organizers', slug: 'spice-racks' },
          { name: 'Heavy-Duty Storage Shelving', slug: 'shelving' },
          { name: 'Modern Arc Floor Lamps', slug: 'floor-lamps' },
          { name: 'Smart Color LED Bulbs', slug: 'smart-lights' },
        ],
      },
    ],
  },
  smarthome: {
    label: 'Smart Home & Automated Security',
    icon: ShieldCheck,
    overviewSlug: '/smart-home/best-smart-home-products',
    tagline: 'Matter color lighting, smart deadbolts, 4K security cams & robot vacuums',
    clusters: [
      {
        title: 'Security & Access',
        items: [
          { name: 'Biometric Smart Deadbolts', slug: 'smart-locks' },
          { name: 'Wireless 2K Video Doorbells', slug: 'smart-doorbells' },
          { name: 'Indoor/Outdoor 4K Security Cameras', slug: 'outdoor-cameras' },
          { name: 'DIY Wireless Alarm Systems', slug: 'security-systems' },
        ],
      },
      {
        title: 'Lighting & Climate',
        items: [
          { name: 'Matter Color Smart Bulbs', slug: 'smart-bulbs' },
          { name: 'Smart Wi-Fi Plugs & Switches', slug: 'smart-plugs' },
          { name: 'Learning Smart Thermostats', slug: 'smart-thermostats' },
          { name: 'Smoke & Water Leak Sensors', slug: 'smart-sensors' },
        ],
      },
      {
        title: 'Robot Cleaners & Air Care',
        items: [
          { name: 'Robot Vacuums (Auto-Empty)', slug: 'robot-vacuums' },
          { name: 'Robot Mop & Vacuum Combos', slug: 'robot-mops' },
          { name: 'True HEPA Smart Air Purifiers', slug: 'smart-air-purifiers' },
          { name: 'Smart Touchscreen Displays', slug: 'smart-displays' },
        ],
      },
      {
        title: 'Curated 2026 Guides',
        items: [
          { name: 'Best Smart Home Products', slug: '../smart-home/best-smart-home-products' },
          { name: 'Starter Kits for Beginners', slug: '../smart-home/for-beginners' },
          { name: 'Best Picks Under $50', slug: '../smart-home/under-50' },
          { name: 'Best Picks Under $100', slug: '../smart-home/under-100' },
          { name: 'Top Home Security Systems', slug: '../smart-home/security' },
        ],
      },
    ],
  },
  beauty: {
    label: 'Beauty, Grooming & Personal Care',
    icon: Sparkles,
    overviewSlug: '/category/beauty',
    tagline: 'Ionic hair dryers, electric shavers, sonic toothbrushes & skincare tech',
    clusters: [
      {
        title: 'Hair Styling & Drying',
        items: [
          { name: 'Ionic High-Speed Hair Dryers', slug: 'hair-dryers' },
          { name: 'Ceramic Hair Straighteners', slug: 'hair-straighteners' },
          { name: 'Auto-Rotating Curling Wands', slug: 'curling-irons' },
          { name: 'Professional Hair Clippers', slug: 'hair-clippers' },
        ],
      },
      {
        title: 'Shaving & Grooming',
        items: [
          { name: 'Rotary & Foil Electric Shavers', slug: 'electric-shavers' },
          { name: 'Adjustable Beard Trimmers', slug: 'beard-trimmers' },
          { name: 'All-in-One Grooming Kits', slug: 'grooming-kits' },
        ],
      },
      {
        title: 'Skincare & Oral Care',
        items: [
          { name: 'Sonic Facial Cleansing Brushes', slug: 'facial-cleansing' },
          { name: 'LED Red Light Therapy Tools', slug: 'skincare-tools' },
          { name: 'Sonic Electric Toothbrushes', slug: 'electric-toothbrushes' },
          { name: 'Cordless Water Flossers', slug: 'water-flossers' },
        ],
      },
      {
        title: 'Vanity & Wellness',
        items: [
          { name: 'Lighted LED Vanity Mirrors', slug: 'vanity-mirrors' },
          { name: 'Acrylic Makeup Organizers', slug: 'makeup-storage' },
          { name: 'Deep Tissue Massage Guns', slug: 'massage-devices' },
        ],
      },
    ],
  },
  health: {
    label: 'Health & Consumer Wellness',
    icon: HeartPulse,
    overviewSlug: '/category/health-wellness',
    tagline: 'Walking pads, percussive massage guns, posture support & clean air',
    clusters: [
      {
        title: 'Activity & Fitness',
        items: [
          { name: 'Activity Fitness Trackers', slug: 'fitness-trackers' },
          { name: 'Health & Wellness Smartwatches', slug: 'smartwatches' },
          { name: 'Smart Health Rings', slug: 'smart-rings' },
        ],
      },
      {
        title: 'Recovery & Massage',
        items: [
          { name: 'Percussive Massage Guns', slug: 'massage-guns' },
          { name: 'High-Density Foam Rollers', slug: 'foam-rollers' },
          { name: 'Heated Neck & Back Massagers', slug: 'wellness-accessories' },
        ],
      },
      {
        title: 'Cardio & Ergonomics',
        items: [
          { name: 'Under-Desk Walking Pads', slug: 'walking-pads' },
          { name: 'Compact Folding Treadmills', slug: 'treadmills' },
          { name: 'Ergonomic Lumbar Cushions', slug: 'ergonomic-products' },
          { name: 'Adjustable Posture Braces', slug: 'posture-products' },
        ],
      },
      {
        title: 'Sleep & Clean Air',
        items: [
          { name: 'Contoured Cooling Pillows', slug: 'pillows' },
          { name: '3D Blackout Sleep Masks', slug: 'sleep-masks' },
          { name: 'Ultrasonic Cool Mist Humidifiers', slug: 'humidifiers' },
          { name: 'True HEPA Air Purifiers', slug: 'air-purifiers' },
        ],
      },
    ],
  },
  fitness: {
    label: 'Fitness, Sports & Training',
    icon: Dumbbell,
    overviewSlug: '/category/sports',
    tagline: 'Adjustable dumbbells, yoga mats, running shoes & bike computers',
    clusters: [
      {
        title: 'Strength & Home Gym',
        items: [
          { name: 'Adjustable Dumbbells Sets', slug: 'dumbbells' },
          { name: 'Cast Iron Kettlebells', slug: 'kettlebells' },
          { name: 'Heavy-Duty Resistance Bands', slug: 'resistance-bands' },
          { name: 'Adjustable Workout Benches', slug: 'workout-benches' },
        ],
      },
      {
        title: 'Yoga & Mobility',
        items: [
          { name: 'Non-Slip Eco Yoga Mats', slug: 'yoga-mats' },
          { name: 'High-Density Yoga Blocks', slug: 'yoga-blocks' },
          { name: 'Stretching Straps & Wheels', slug: 'yoga-accessories' },
        ],
      },
      {
        title: 'Running & Gear',
        items: [
          { name: 'Cushioned Running Shoes', slug: 'running-shoes' },
          { name: 'GPS Running Watches', slug: 'fitness-watches' },
          { name: 'Insulated Sports Water Bottles', slug: 'sports-bottles' },
          { name: 'Ventilated Sports Gym Bags', slug: 'gym-bags' },
        ],
      },
      {
        title: 'Cycling Electronics',
        items: [
          { name: 'GPS Cycling Computers', slug: 'cycling-computers' },
          { name: 'High-Lumen USB Bike Lights', slug: 'bike-lights' },
          { name: 'Heavy-Duty Bike U-Locks', slug: 'bike-locks' },
        ],
      },
    ],
  },
  outdoors: {
    label: 'Outdoors, Camping & Expedition',
    icon: Tent,
    overviewSlug: '/category/outdoors',
    tagline: 'Tents, hiking backpacks, camp stoves, coolers & portable power stations',
    clusters: [
      {
        title: 'Shelter & Sleep',
        items: [
          { name: 'All-Weather Camping Tents', slug: 'tents' },
          { name: '4-Season Sleeping Bags', slug: 'sleeping-bags' },
          { name: 'Self-Inflating Camp Mattresses', slug: 'camping-mattresses' },
          { name: 'Folding Camp Chairs & Tables', slug: 'camping-chairs' },
        ],
      },
      {
        title: 'Hiking & Footwear',
        items: [
          { name: 'Technical Hiking Backpacks', slug: 'hiking-backpacks' },
          { name: 'Waterproof Trail Hiking Shoes', slug: 'hiking-shoes' },
          { name: 'Carbon Fiber Trekking Poles', slug: 'trekking-poles' },
        ],
      },
      {
        title: 'Camp Kitchen & Power',
        items: [
          { name: 'Portable Camping Stoves', slug: 'portable-stoves' },
          { name: 'Nesting Cookware Sets', slug: 'camping-cookware' },
          { name: 'Heavy-Duty Roto Coolers', slug: 'coolers' },
          { name: 'Portable Power Stations', slug: 'power-stations' },
        ],
      },
      {
        title: 'Lighting & Survival',
        items: [
          { name: 'Rechargeable LED Headlamps', slug: 'headlamps' },
          { name: 'High-Lumen Camping Lanterns', slug: 'lanterns' },
          { name: 'Multi-Tools & Water Filters', slug: 'survival-gear' },
        ],
      },
    ],
  },
};

export default function DepartmentDirectDropdown({
  activeDepartment,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: DepartmentDirectDropdownProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const current = activeDepartment ? CONCISE_DEPARTMENTS[activeDepartment] : null;

  useEffect(() => {
    if (!current || !cardRef.current) return;
    if (isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: -6, scale: 0.995 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'power3.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeDepartment]);

  if (!current) return null;

  const IconComponent = current.icon;

  return (
    <div
      ref={containerRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 'var(--z-search-dropdown, 200)' as unknown as number,
        backgroundColor: 'rgba(28, 25, 23, 0.3)',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      }}
      onClick={onClose}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '2px solid var(--green-accent)',
          borderTop: '1px solid var(--border)',
          boxShadow: 'var(--shadow-hover)',
          padding: '1.25rem 0 1.5rem 0',
          maxHeight: '75vh',
          overflowY: 'auto',
          transformOrigin: 'top center',
        }}
      >
        <div className="container">
          {/* Compact Department Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '0.65rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconComponent size={16} color="var(--green-accent)" />
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontFamily: 'var(--font-serif)',
                  margin: 0,
                  color: 'var(--text-primary)',
                }}
              >
                {current.label}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                — {current.tagline}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                href={current.overviewSlug}
                onClick={onClose}
                style={{
                  fontSize: '0.78125rem',
                  fontWeight: 700,
                  color: 'var(--green-accent)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  textDecoration: 'none',
                }}
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </Link>

              <button
                onClick={onClose}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                }}
              >
                <X size={12} />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Clean 4-Column Short & Concise Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(current.clusters.length, 4)}, minmax(180px, 1fr))`,
              gap: '1.25rem 1.5rem',
            }}
          >
            {current.clusters.map((cluster, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Column Title */}
                <div
                  style={{
                    fontSize: '0.78125rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '0.25rem',
                    marginBottom: '0.4rem',
                    letterSpacing: '0.01em',
                  }}
                >
                  {cluster.title}
                </div>

                {/* Subcategory Links */}
                <ul
                  style={{
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                  }}
                >
                  {cluster.items.map((sub, sIdx) => (
                    <li key={sIdx}>
                      <Link
                        href={`/category/${sub.slug}`}
                        onClick={onClose}
                        style={{
                          fontSize: '0.78125rem',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          display: 'inline-block',
                          padding: '0.1rem 0',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--green-accent)';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

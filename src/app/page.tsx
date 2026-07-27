'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Navigator from '@/components/ai/Navigator';
import { Plane, Hotel, Car, TramFront as Train, Search, Star, ShieldCheck, Globe, Zap, ArrowRight, MapPin, Users, Calendar, Sparkles } from 'lucide-react';

function HomeContent() {
  const [activeTab, setActiveTab] = useState('flights');
  const [destination, setDestination] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (!destination) return;
    router.push(`/${activeTab}?destination=${encodeURIComponent(destination)}`);
  };

  const TABS = [
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'hotels',  label: 'Hotels',  icon: Hotel },
    { id: 'trains',  label: 'Trains',  icon: Train },
    { id: 'cabs',    label: 'Cabs',    icon: Car },
  ];

  const DESTINATIONS = [
    { name: 'Swiss Alps', price: '45,200', rating: 4.9, img: 'https://images.unsplash.com/photo-1531210483974-4f8c1f33fd35?auto=format&fit=crop&q=80&w=400' },
    { name: 'Tokyo District', price: '12,800', rating: 4.8, img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400' },
    { name: 'Bali Shores', price: '3,400', rating: 4.7, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400' },
    { name: 'Mumbai Harbor', price: '9,100', rating: 4.9, img: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <section className="relative bg-[#192024] pt-24 pb-48 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#FF690F] blur-[150px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600 blur-[150px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full mb-8">
            <Sparkles size={16} className="text-[#FF690F]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF690F]">Institutional Ecosystem v4.0</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">Where to <span className="text-[#FF690F]">next</span>?</h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-16 font-bold leading-relaxed">Book flights, hotels, trains, and cabs. Settle group debts instantly with Min-Cash-Flow logic.</p>
          
          <div className="max-w-5xl mx-auto bg-white rounded-[40px] p-3 md:p-6 shadow-2xl text-slate-900 border border-slate-200">
            <div className="flex flex-wrap gap-4 border-b border-slate-100 mb-6 px-4">
              {TABS.map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className={`pb-4 px-2 flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'text-[#FF690F] border-b-4 border-[#FF690F]' : 'text-slate-300 hover:text-slate-600'}`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-5 relative">
                <MapPin className="absolute left-5 top-5 text-slate-300" size={20} />
                <input 
                  value={destination} 
                  onChange={e => setDestination(e.target.value)} 
                  placeholder="Enter Destination (Goa, Tokyo...)" 
                  className="w-full p-5 pl-14 bg-slate-50 rounded-3xl border-none outline-none font-black text-lg placeholder:text-slate-300 focus:ring-2 focus:ring-orange-100" 
                />
              </div>
              <div className="md:col-span-3 relative">
                 <Calendar className="absolute left-5 top-5 text-slate-300" size={18} />
                 <input type="date" className="w-full p-5 pl-14 bg-slate-50 rounded-3xl border-none outline-none font-bold text-sm" />
              </div>
              <div className="md:col-span-2 relative">
                 <Users className="absolute left-5 top-5 text-slate-300" size={18} />
                 <select className="w-full p-5 pl-14 bg-slate-50 rounded-3xl border-none outline-none font-bold text-sm appearance-none"><option>1 Traveller</option><option>2 Travellers</option></select>
              </div>
              <div className="md:col-span-2">
                <button 
                  onClick={handleSearch} 
                  className="w-full h-16 bg-[#FF690F] text-white rounded-3xl font-black text-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                >
                  <Search size={24} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Secure Ledger', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-500', desc: 'Real-time group debt settlement.' },
            { title: 'Global Logistics', icon: Globe, color: 'bg-blue-50 text-blue-500', desc: 'Flights, Trains, and Cabs.' },
            { title: 'Safe API', icon: Zap, color: 'bg-orange-50 text-orange-500', desc: 'Direct portal redirection layer.' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-10 rounded-[45px] shadow-xl border border-slate-100 hover:scale-105 transition-all">
              <div className={`w-16 h-16 ${item.color} rounded-3xl flex items-center justify-center mb-6`}>
                <item.icon size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#192024]">{item.title}</h3>
              <p className="text-slate-400 font-bold mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-32">
        <div className="flex justify-between items-end mb-12">
          <div>
             <h2 className="text-4xl font-black text-[#192024] tracking-tighter">Trending Expeditions</h2>
             <p className="text-slate-400 font-bold mt-2">Curated by travel experts.</p>
          </div>
          <button className="text-[#FF690F] font-black flex items-center gap-2 hover:underline">VIEW ALL <ArrowRight size={20} /></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {DESTINATIONS.map((dest, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative h-80 rounded-[40px] overflow-hidden mb-6 shadow-2xl border-4 border-white">
                <img src={dest.img} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1 shadow-lg">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" /> {dest.rating}
                </div>
              </div>
              <h4 className="text-xl font-black text-[#192024] mb-1">{dest.name}</h4>
              <p className="text-[#FF690F] font-black text-sm tracking-widest uppercase">Start From ₹{dest.price}</p>
            </div>
          ))}
        </div>
      </section>

      <Navigator />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#192024] flex items-center justify-center font-black text-3xl text-[#FF690F] tracking-[0.5em] animate-pulse">TRAVELO. INITIALIZING CORE...</div>}>
      <HomeContent />
    </Suspense>
  );
}

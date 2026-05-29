import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCars } from '../api/carAPI';
import { getAllSlots } from '../api/parkingSlotAPI';
import { getAllRecords } from '../api/parkingRecordAPI';
import { getAllPayments } from '../api/paymentAPI';

function StatCard({ label, value, color, link }) {
  return (
    <Link to={link} className="bg-white rounded-2xl shadow hover:shadow-md transition-shadow p-6 flex items-center gap-4 group border border-gray-100">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <span className="text-white text-xl font-bold">{String(value).charAt(0)}</span>
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </Link>
  );
}

function Dashboard({ user }) {
  const [stats, setStats] = useState({ cars: 0, slots: 0, available: 0, occupied: 0, records: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllCars(), getAllSlots(), getAllRecords(), getAllPayments()])
      .then(([cars, slots, records, payments]) => {
        setStats({
          cars: cars.data.length,
          slots: slots.data.length,
          available: slots.data.filter(s => s.SlotStatus === 'Available').length,
          occupied: slots.data.filter(s => s.SlotStatus === 'Occupied').length,
          records: records.data.length,
          revenue: payments.data.reduce((s, p) => s + parseFloat(p.AmountPaid || 0), 0),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Registered Cars', value: stats.cars, color: 'bg-blue-600', link: '/cars' },
    { label: 'Total Slots', value: stats.slots, color: 'bg-indigo-600', link: '/parking-slots' },
    { label: 'Available Slots', value: stats.available, color: 'bg-green-600', link: '/parking-slots' },
    { label: 'Occupied Slots', value: stats.occupied, color: 'bg-red-500', link: '/parking-slots' },
    { label: 'Parking Records', value: stats.records, color: 'bg-yellow-500', link: '/parking-records' },
    { label: 'Total Revenue (Rwf)', value: stats.revenue.toLocaleString(), color: 'bg-purple-600', link: '/payments' },
  ];

  const actions = [
    { to: '/cars', label: 'Add Car', color: 'bg-blue-600 hover:bg-blue-700' },
    { to: '/parking-slots', label: 'Add Slot', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { to: '/parking-records', label: 'Record Entry', color: 'bg-green-600 hover:bg-green-700' },
    { to: '/payments', label: 'Record Payment', color: 'bg-purple-600 hover:bg-purple-700' },
    { to: '/reports', label: 'View Reports', color: 'bg-orange-500 hover:bg-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Welcome back, <span className="font-semibold text-blue-700">{user?.username}</span>
          </p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow p-6 animate-pulse border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {cards.map(c => <StatCard key={c.label} {...c} />)}
          </div>
        )}

        {/* Quick actions */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-700 mb-4 uppercase tracking-wide text-xs">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {actions.map(a => (
              <Link
                key={a.to}
                to={a.to}
                className={`${a.color} text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200`}
              >
                {a.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;

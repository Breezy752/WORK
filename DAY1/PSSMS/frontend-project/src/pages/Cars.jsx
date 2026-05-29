import { useState, useEffect } from 'react';
import { getAllCars, addCar, updateCar, deleteCar } from '../api/carAPI';

function Cars() {
  const [cars, setCars] = useState([]);
  const [form, setForm] = useState({ plateNumber: '', driverName: '', phoneNumber: '' });
  const [editMode, setEditMode] = useState(false);
  const [editPlate, setEditPlate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCars = async () => {
    try { const res = await getAllCars(); setCars(res.data); }
    catch { setError('Failed to load cars.'); }
  };

  useEffect(() => { fetchCars(); }, []);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.plateNumber || !form.driverName || !form.phoneNumber) { setError('All fields are required.'); return; }
    setLoading(true);
    try {
      if (editMode) {
        await updateCar(editPlate, { driverName: form.driverName, phoneNumber: form.phoneNumber });
        setSuccess('Car updated successfully.');
      } else {
        await addCar(form);
        setSuccess('Car added successfully.');
      }
      setForm({ plateNumber: '', driverName: '', phoneNumber: '' });
      setEditMode(false); setEditPlate('');
      fetchCars();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleEdit = (car) => {
    setForm({ plateNumber: car.PlateNumber, driverName: car.DriverName, phoneNumber: car.PhoneNumber });
    setEditMode(true); setEditPlate(car.PlateNumber); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (plate) => {
    if (!window.confirm(`Delete car ${plate}?`)) return;
    try { await deleteCar(plate); setSuccess('Car deleted.'); fetchCars(); }
    catch (err) { setError(err.response?.data?.message || 'Delete failed.'); }
    finally { setTimeout(() => setSuccess(''), 3000); }
  };

  const handleCancel = () => {
    setForm({ plateNumber: '', driverName: '', phoneNumber: '' });
    setEditMode(false); setEditPlate(''); setError('');
  };

  const filtered = cars.filter(c =>
    c.PlateNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.DriverName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Car Management</h1>
          <p className="text-gray-500 text-sm mt-1">Register and manage vehicles</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-1 h-6 rounded-full ${editMode ? 'bg-yellow-400' : 'bg-blue-600'}`}></div>
            <h2 className="text-base font-bold text-gray-800">{editMode ? 'Edit Car' : 'Add New Car'}</h2>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">{success}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Plate Number *</label>
              <input
                type="text" name="plateNumber" value={form.plateNumber} onChange={handleChange}
                placeholder="e.g. RAB 123 A" disabled={editMode}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Driver Name *</label>
              <input
                type="text" name="driverName" value={form.driverName} onChange={handleChange}
                placeholder="Full name"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Phone Number *</label>
              <input
                type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
                placeholder="e.g. 0788000000"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button
                type="submit" disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold px-7 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                {loading ? 'Saving...' : editMode ? 'Update Car' : 'Add Car'}
              </button>
              {editMode && (
                <button type="button" onClick={handleCancel}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-7 py-2.5 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-800">Registered Cars</h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{filtered.length}</span>
            </div>
            <input
              type="text" placeholder="Search plate or driver..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full sm:w-60 transition-colors"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-600 text-white text-left">
                  <th className="px-4 py-3 font-semibold rounded-tl-xl">#</th>
                  <th className="px-4 py-3 font-semibold">Plate Number</th>
                  <th className="px-4 py-3 font-semibold">Driver Name</th>
                  <th className="px-4 py-3 font-semibold">Phone Number</th>
                  <th className="px-4 py-3 font-semibold rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-12 text-gray-400 text-sm">No cars found.</td></tr>
                ) : filtered.map((car, i) => (
                  <tr key={car.PlateNumber} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 text-gray-400 font-medium">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 font-bold text-xs px-2.5 py-1 rounded-lg">{car.PlateNumber}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{car.DriverName}</td>
                    <td className="px-4 py-3 text-gray-600">{car.PhoneNumber}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(car)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(car.PlateNumber)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Cars;

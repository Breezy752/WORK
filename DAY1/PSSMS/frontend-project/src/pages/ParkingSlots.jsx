import { useState, useEffect } from 'react';
import { getAllSlots, addSlot, updateSlot, deleteSlot } from '../api/parkingSlotAPI';
import { Link } from 'react-router-dom';

function ParkingSlots() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ slotNumber: '', slotStatus: 'Available' });
  const [editMode, setEditMode] = useState(false);
  const [editSlot, setEditSlot] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('grid'); // 'grid' | 'table'

  const fetchSlots = async () => {
    try { const res = await getAllSlots(); setSlots(res.data); }
    catch { setError('Failed to load slots.'); }
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.slotNumber) { setError('Slot number is required.'); return; }
    setLoading(true);
    try {
      if (editMode) {
        await updateSlot(editSlot, { slotStatus: form.slotStatus });
        setSuccess('Slot updated successfully.');
      } else {
        await addSlot(form);
        setSuccess('Slot added successfully.');
      }
      setForm({ slotNumber: '', slotStatus: 'Available' });
      setEditMode(false); setEditSlot('');
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleEdit = (slot) => {
    setForm({ slotNumber: slot.SlotNumber, slotStatus: slot.SlotStatus });
    setEditMode(true); setEditSlot(slot.SlotNumber); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (slotNumber) => {
    if (!window.confirm(`Delete slot ${slotNumber}?`)) return;
    try { await deleteSlot(slotNumber); setSuccess('Slot deleted.'); fetchSlots(); }
    catch (err) { setError(err.response?.data?.message || 'Delete failed.'); }
    finally { setTimeout(() => setSuccess(''), 3000); }
  };

  const handleCancel = () => {
    setForm({ slotNumber: '', slotStatus: 'Available' });
    setEditMode(false); setEditSlot(''); setError('');
  };

  const available = slots.filter(s => s.SlotStatus === 'Available').length;
  const occupied = slots.filter(s => s.SlotStatus === 'Occupied').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parking Slot Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and monitor parking slot availability</p>
          </div>
          <Link
            to="/parking-records"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            + Record Car Entry
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Slots', value: slots.length, bg: 'bg-blue-600' },
            { label: 'Available', value: available, bg: 'bg-green-600' },
            { label: 'Occupied', value: occupied, bg: 'bg-red-500' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} text-white rounded-2xl p-5 text-center shadow`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm mt-1 text-white">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-1 h-6 rounded-full ${editMode ? 'bg-yellow-400' : 'bg-indigo-600'}`}></div>
            <h2 className="text-base font-bold text-gray-800">{editMode ? 'Edit Slot Status' : 'Add New Parking Slot'}</h2>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">{success}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Slot Number *</label>
              <input
                type="text" name="slotNumber" value={form.slotNumber} onChange={handleChange}
                placeholder="e.g. A1, B2, C3" disabled={editMode}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Status</label>
              <select
                name="slotStatus" value={form.slotStatus} onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
              </select>
            </div>
            <div className="flex items-end gap-3">
              <button type="submit" disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold px-7 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-200">
                {loading ? 'Saving...' : editMode ? 'Update Slot' : 'Add Slot'}
              </button>
              {editMode && (
                <button type="button" onClick={handleCancel}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Slots Display */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-800">All Parking Slots</h2>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">{slots.length}</span>
            </div>
            {/* View toggle */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setView('grid')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'grid' ? 'bg-white text-indigo-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'table' ? 'bg-white text-indigo-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Table
              </button>
            </div>
          </div>

          {slots.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-sm">No parking slots found. Add your first slot above.</p>
          ) : view === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {slots.map(slot => (
                <div key={slot.SlotNumber}
                  className={`rounded-xl border-2 p-3 text-center transition-colors ${
                    slot.SlotStatus === 'Available' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                  }`}
                >
                  <p className="font-bold text-gray-800 text-sm">{slot.SlotNumber}</p>
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                    slot.SlotStatus === 'Available' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {slot.SlotStatus}
                  </span>
                  <div className="flex gap-1 justify-center mt-2">
                    <button onClick={() => handleEdit(slot)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-lg transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(slot.SlotNumber)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg transition-colors">
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-indigo-600 text-white text-left">
                    <th className="px-4 py-3 font-semibold rounded-tl-xl">#</th>
                    <th className="px-4 py-3 font-semibold">Slot Number</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot, i) => (
                    <tr key={slot.SlotNumber} className={`border-b border-gray-100 hover:bg-indigo-50 transition-colors ${i % 2 !== 0 ? 'bg-gray-50' : ''}`}>
                      <td className="px-4 py-3 text-gray-400 font-medium">{i + 1}</td>
                      <td className="px-4 py-3 font-bold text-gray-800">{slot.SlotNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                          slot.SlotStatus === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {slot.SlotStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(slot)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(slot.SlotNumber)}
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
          )}
        </div>

      </div>
    </div>
  );
}

export default ParkingSlots;

import { useState, useEffect } from 'react';
import { getAllRecords, addRecord, updateRecord, deleteRecord } from '../api/parkingRecordAPI';
import { getAllCars } from '../api/carAPI';
import { getAvailableSlots, getAllSlots } from '../api/parkingSlotAPI';
import { addPayment, getAllPayments } from '../api/paymentAPI';

const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '—';

function ParkingRecords() {
  const [records, setRecords] = useState([]);
  const [cars, setCars] = useState([]);
  const [slots, setSlots] = useState([]);        // available slots for entry form
  const [allSlots, setAllSlots] = useState([]);  // all slots for edit form
  const [payments, setPayments] = useState([]);

  // Entry form
  const [form, setForm] = useState({ entryTime: '', plateNumber: '', slotNumber: '' });

  // Edit record modal (update entry time / slot before exit)
  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm] = useState({ entryTime: '', slotNumber: '' });

  // Exit modal
  const [exitRecordId, setExitRecordId] = useState(null);
  const [exitRecord, setExitRecord] = useState(null);
  const [exitTime, setExitTime] = useState('');

  // Bill modal
  const [bill, setBill] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [rec, carList, slotList, allSlotList, payList] = await Promise.all([
        getAllRecords(), getAllCars(), getAvailableSlots(), getAllSlots(), getAllPayments()
      ]);
      setRecords(rec.data);
      setCars(carList.data);
      setSlots(slotList.data);
      setAllSlots(allSlotList.data);
      setPayments(payList.data);
    } catch { setError('Failed to load data.'); }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Entry ──────────────────────────────────────────────
  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    if (!form.entryTime || !form.plateNumber || !form.slotNumber) { setError('All fields are required.'); return; }
    setLoading(true);
    try {
      await addRecord(form);
      setSuccess('Car entry recorded successfully.');
      setForm({ entryTime: '', plateNumber: '', slotNumber: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create record.');
    } finally { setLoading(false); setTimeout(() => setSuccess(''), 3000); }
  };

  // ── Edit record ────────────────────────────────────────
  const openEdit = (rec) => {
    const dt = rec.EntryTime ? new Date(rec.EntryTime).toISOString().slice(0, 16) : '';
    setEditRecord(rec);
    setEditForm({ entryTime: dt, slotNumber: rec.SlotNumber });
    setError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.entryTime) { setError('Entry time is required.'); return; }
    setLoading(true);
    try {
      await updateRecord(editRecord.RecordID, { entryTime: editForm.entryTime, slotNumber: editForm.slotNumber });
      setSuccess('Record updated successfully.');
      setEditRecord(null);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally { setLoading(false); setTimeout(() => setSuccess(''), 3000); }
  };

  // ── Exit ───────────────────────────────────────────────
  const handleExitSubmit = async (e) => {
    e.preventDefault();
    if (!exitTime) { setError('Exit time is required.'); return; }
    setLoading(true);
    try {
      const res = await updateRecord(exitRecordId, { exitTime });
      const { duration, fee } = res.data;
      const paymentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await addPayment({ amountPaid: fee, paymentDate, recordId: exitRecordId });
      setBill({
        plateNumber: exitRecord?.PlateNumber,
        driverName: exitRecord?.DriverName,
        slotNumber: exitRecord?.SlotNumber,
        entryTime: exitRecord?.EntryTime,
        exitTime, duration, amountPaid: fee, paymentDate
      });
      setSuccess(`Exit recorded. Duration: ${duration} hrs. Fee: ${fee} Rwf`);
      setExitRecordId(null); setExitRecord(null); setExitTime('');
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record exit.');
    } finally { setLoading(false); }
  };

  // ── Delete ─────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this parking record? This cannot be undone.')) return;
    try { await deleteRecord(id); setSuccess('Record deleted.'); fetchAll(); }
    catch (err) { setError(err.response?.data?.message || 'Delete failed.'); }
    finally { setTimeout(() => setSuccess(''), 3000); }
  };

  // ── View bill for completed record ─────────────────────
  const viewBill = (rec) => {
    const payment = payments.find(p => p.RecordID === rec.RecordID);
    if (!payment) { setError('No payment found for this record.'); return; }
    setBill({
      plateNumber: rec.PlateNumber,
      driverName: rec.DriverName,
      slotNumber: rec.SlotNumber,
      entryTime: rec.EntryTime,
      exitTime: rec.ExitTime,
      duration: rec.Duration,
      amountPaid: payment.AmountPaid,
      paymentDate: payment.PaymentDate,
      paymentId: payment.PaymentID,
    });
  };

  const active = records.filter(r => !r.ExitTime).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Parking Records</h1>
          <p className="text-gray-500 text-sm mt-1">Record car entries, exits, and auto-generate payments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Records', value: records.length, bg: 'bg-blue-600' },
            { label: 'Active (Parked)', value: active, bg: 'bg-yellow-500' },
            { label: 'Completed', value: records.length - active, bg: 'bg-green-600' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} text-white rounded-2xl p-5 text-center shadow`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">{success}</div>}

        {/* Entry Form */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-green-600"></div>
            <h2 className="text-base font-bold text-gray-800">Record Car Entry</h2>
          </div>
          <form onSubmit={handleEntrySubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Plate Number *</label>
              <select
                value={form.plateNumber}
                onChange={e => { setForm({ ...form, plateNumber: e.target.value }); setError(''); }}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-500 transition-colors"
                required
              >
                <option value="">Select car...</option>
                {cars.map(c => <option key={c.PlateNumber} value={c.PlateNumber}>{c.PlateNumber} — {c.DriverName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Available Slot *</label>
              <select
                value={form.slotNumber}
                onChange={e => { setForm({ ...form, slotNumber: e.target.value }); setError(''); }}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-500 transition-colors"
                required
              >
                <option value="">Select slot...</option>
                {slots.map(s => <option key={s.SlotNumber} value={s.SlotNumber}>{s.SlotNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Entry Time *</label>
              <input
                type="datetime-local" value={form.entryTime}
                onChange={e => { setForm({ ...form, entryTime: e.target.value }); setError(''); }}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-500 transition-colors"
                required
              />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-4 focus:ring-green-200">
                {loading ? 'Saving...' : 'Record Entry'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Edit Record Modal ── */}
        {editRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Edit Parking Record</h3>
              <p className="text-sm text-gray-500 mb-4">
                Car: <strong className="text-gray-800">{editRecord.PlateNumber}</strong> — {editRecord.DriverName}
              </p>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Entry Time *</label>
                  <input
                    type="datetime-local" value={editForm.entryTime}
                    onChange={e => setEditForm({ ...editForm, entryTime: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Slot Number</label>
                  <select
                    value={editForm.slotNumber}
                    onChange={e => setEditForm({ ...editForm, slotNumber: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-yellow-500"
                  >
                    {allSlots.map(s => (
                      <option key={s.SlotNumber} value={s.SlotNumber}>
                        {s.SlotNumber} — {s.SlotStatus}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => { setEditRecord(null); setError(''); }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Exit Modal ── */}
        {exitRecordId && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Record Car Exit</h3>
              <p className="text-sm text-gray-500 mb-1">
                Car: <strong className="text-gray-800">{exitRecord?.PlateNumber}</strong> — {exitRecord?.DriverName}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Entry: {fmt(exitRecord?.EntryTime)} | Slot: {exitRecord?.SlotNumber}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 text-xs text-blue-700 font-medium">
                Fee: 500 Rwf/hour (minimum 1 hour). Payment will be auto-recorded.
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
              <form onSubmit={handleExitSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Exit Time *</label>
                  <input
                    type="datetime-local" value={exitTime}
                    onChange={e => setExitTime(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                    {loading ? 'Processing...' : 'Confirm Exit & Pay'}
                  </button>
                  <button type="button" onClick={() => { setExitRecordId(null); setExitRecord(null); setError(''); }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Bill Modal ── */}
        {bill && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-blue-900 px-6 py-6 text-center text-white">
                <p className="text-3xl font-black mb-1">SP</p>
                <h3 className="text-xl font-bold">SmartPark — Parking Bill</h3>
                <p className="text-blue-300 text-xs mt-1">Rubavu District, Western Province, Rwanda</p>
                {bill.paymentId && <p className="text-blue-400 text-xs mt-0.5">Bill #{bill.paymentId}</p>}
              </div>
              <div className="p-6 space-y-3">
                {[
                  ['Plate Number', bill.plateNumber],
                  ['Driver Name', bill.driverName],
                  ['Slot Number', bill.slotNumber],
                  ['Entry Time', fmt(bill.entryTime)],
                  ['Exit Time', fmt(bill.exitTime)],
                  ['Duration', `${bill.duration} hour(s)`],
                  ['Rate', '500 Rwf/hour (min. 1 hour)'],
                  ['Payment Date', fmt(bill.paymentDate)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center border-b border-gray-100 pb-2 text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center bg-blue-50 rounded-xl px-4 py-3 mt-2">
                  <span className="font-bold text-gray-700">Total Amount Paid</span>
                  <span className="text-2xl font-bold text-blue-700">{bill.amountPaid} Rwf</span>
                </div>
              </div>
              <div className="px-6 pb-6">
                <button onClick={() => setBill(null)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                  Close Bill
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Records Table */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-base font-bold text-gray-800">All Parking Records</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{records.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-600 text-white text-left">
                  <th className="px-3 py-3 font-semibold rounded-tl-xl">#</th>
                  <th className="px-3 py-3 font-semibold">Plate</th>
                  <th className="px-3 py-3 font-semibold">Driver</th>
                  <th className="px-3 py-3 font-semibold">Slot</th>
                  <th className="px-3 py-3 font-semibold">Entry Time</th>
                  <th className="px-3 py-3 font-semibold">Exit Time</th>
                  <th className="px-3 py-3 font-semibold">Duration</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan="9" className="text-center py-12 text-gray-400 text-sm">No records found. Record a car entry above.</td></tr>
                ) : records.map((rec, i) => (
                  <tr key={rec.RecordID} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${i % 2 !== 0 ? 'bg-gray-50' : ''}`}>
                    <td className="px-3 py-3 text-gray-400 font-medium">{i + 1}</td>
                    <td className="px-3 py-3">
                      <span className="bg-blue-100 text-blue-800 font-bold text-xs px-2 py-0.5 rounded-lg">{rec.PlateNumber}</span>
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-800">{rec.DriverName}</td>
                    <td className="px-3 py-3">
                      <span className="bg-indigo-100 text-indigo-700 font-semibold text-xs px-2 py-0.5 rounded-lg">{rec.SlotNumber}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{fmt(rec.EntryTime)}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{rec.ExitTime ? fmt(rec.ExitTime) : '—'}</td>
                    <td className="px-3 py-3 text-gray-600">{rec.Duration != null ? `${rec.Duration} hrs` : '—'}</td>
                    <td className="px-3 py-3">
                      {rec.ExitTime
                        ? <span className="bg-green-100 text-green-700 font-semibold text-xs px-2 py-0.5 rounded-full">Done</span>
                        : <span className="bg-yellow-100 text-yellow-700 font-semibold text-xs px-2 py-0.5 rounded-full">Active</span>
                      }
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {!rec.ExitTime && (
                          <>
                            <button
                              onClick={() => openEdit(rec)}
                              className="bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors">
                              Edit
                            </button>
                            <button
                              onClick={() => { setExitRecordId(rec.RecordID); setExitRecord(rec); setExitTime(''); setError(''); }}
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors">
                              Exit
                            </button>
                          </>
                        )}
                        {rec.ExitTime && (
                          <button
                            onClick={() => viewBill(rec)}
                            className="bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors">
                            Bill
                          </button>
                        )}
                        <button onClick={() => handleDelete(rec.RecordID)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors">
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

export default ParkingRecords;

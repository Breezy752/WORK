import { useState, useEffect } from 'react';
import { getAllPayments, addPayment, updatePayment, deletePayment } from '../api/paymentAPI';
import { getAllRecords } from '../api/parkingRecordAPI';

const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '—';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [records, setRecords] = useState([]);

  // Add form
  const [form, setForm] = useState({ amountPaid: '', paymentDate: '', recordId: '' });

  // Edit modal
  const [editPayment, setEditPayment] = useState(null);
  const [editForm, setEditForm] = useState({ amountPaid: '', paymentDate: '' });

  // Bill modal
  const [bill, setBill] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [pay, rec] = await Promise.all([getAllPayments(), getAllRecords()]);
      setPayments(pay.data);
      const paidIds = pay.data.map(p => p.RecordID);
      setRecords(rec.data.filter(r => !paidIds.includes(r.RecordID) && r.ExitTime));
    } catch { setError('Failed to load data.'); }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Auto-calculate amount when record selected ──
  const handleRecordSelect = (e) => {
    const recordId = e.target.value;
    if (recordId) {
      const rec = records.find(r => r.RecordID === parseInt(recordId));
      if (rec && rec.Duration != null) {
        const hours = rec.Duration < 1 ? 1 : Math.ceil(rec.Duration);
        setForm(prev => ({ ...prev, recordId, amountPaid: hours * 500 }));
        return;
      }
    }
    setForm(prev => ({ ...prev, recordId, amountPaid: '' }));
  };

  // ── Add payment ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amountPaid || !form.recordId) { setError('Amount and record are required.'); return; }
    setLoading(true);
    try {
      await addPayment(form);
      setSuccess('Payment recorded successfully.');
      setForm({ amountPaid: '', paymentDate: '', recordId: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment.');
    } finally { setLoading(false); setTimeout(() => setSuccess(''), 3000); }
  };

  // ── Edit payment ──
  const openEdit = (pay) => {
    const dt = pay.PaymentDate ? new Date(pay.PaymentDate).toISOString().slice(0, 16) : '';
    setEditPayment(pay);
    setEditForm({ amountPaid: pay.AmountPaid, paymentDate: dt });
    setError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.amountPaid) { setError('Amount is required.'); return; }
    setLoading(true);
    try {
      await updatePayment(editPayment.PaymentID, editForm);
      setSuccess('Payment updated successfully.');
      setEditPayment(null);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally { setLoading(false); setTimeout(() => setSuccess(''), 3000); }
  };

  // ── Delete payment ──
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await deletePayment(id);
      setSuccess('Payment deleted.');
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    } finally { setTimeout(() => setSuccess(''), 3000); }
  };

  const totalRevenue = payments.reduce((s, p) => s + parseFloat(p.AmountPaid || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-500 text-sm mt-1">Record, update, and track parking payments</p>
        </div>

        {/* Revenue Banner */}
        <div className="bg-purple-700 text-white rounded-2xl p-6 mb-6 shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-purple-200 text-sm font-medium">Total Revenue Collected</p>
            <p className="text-4xl font-bold mt-1">{totalRevenue.toLocaleString()} Rwf</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl px-6 py-3 text-center">
            <p className="text-2xl font-bold">{payments.length}</p>
            <p className="text-purple-200 text-xs">Payments</p>
          </div>
        </div>

        {/* Alerts */}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">{success}</div>}

        {/* Add Payment Form */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-purple-600"></div>
            <h2 className="text-base font-bold text-gray-800">Record Manual Payment</h2>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Parking Record *</label>
              <select
                value={form.recordId} onChange={handleRecordSelect}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-purple-500 transition-colors"
                required
              >
                <option value="">Select completed record...</option>
                {records.map(r => (
                  <option key={r.RecordID} value={r.RecordID}>
                    #{r.RecordID} — {r.PlateNumber} ({r.Duration} hrs)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Amount (Rwf) *</label>
              <input
                type="number" value={form.amountPaid}
                onChange={e => setForm({ ...form, amountPaid: e.target.value })}
                placeholder="Auto-calculated or enter manually" min="0"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Payment Date</label>
              <input
                type="datetime-local" value={form.paymentDate}
                onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-4 focus:ring-purple-200">
                {loading ? 'Saving...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Edit Payment Modal ── */}
        {editPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Edit Payment</h3>
              <p className="text-sm text-gray-500 mb-4">
                Payment #{editPayment.PaymentID} — <strong>{editPayment.PlateNumber}</strong>
              </p>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Amount (Rwf) *</label>
                  <input
                    type="number" value={editForm.amountPaid}
                    onChange={e => setEditForm({ ...editForm, amountPaid: e.target.value })}
                    min="0"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Payment Date</label>
                  <input
                    type="datetime-local" value={editForm.paymentDate}
                    onChange={e => setEditForm({ ...editForm, paymentDate: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => { setEditPayment(null); setError(''); }}
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
                <p className="text-blue-400 text-xs mt-0.5">Bill #{bill.PaymentID}</p>
              </div>
              <div className="p-6 space-y-3">
                {[
                  ['Plate Number', bill.PlateNumber],
                  ['Driver Name', bill.DriverName],
                  ['Slot Number', bill.SlotNumber],
                  ['Entry Time', fmt(bill.EntryTime)],
                  ['Exit Time', fmt(bill.ExitTime)],
                  ['Duration', `${bill.Duration} hour(s)`],
                  ['Rate', '500 Rwf/hour (min. 1 hour)'],
                  ['Payment Date', fmt(bill.PaymentDate)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center border-b border-gray-100 pb-2 text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center bg-blue-50 rounded-xl px-4 py-3 mt-2">
                  <span className="font-bold text-gray-700">Total Amount Paid</span>
                  <span className="text-2xl font-bold text-blue-700">{parseFloat(bill.AmountPaid).toLocaleString()} Rwf</span>
                </div>
              </div>
              <div className="px-6 pb-6">
                <button onClick={() => setBill(null)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-base font-bold text-gray-800">Payment History</h2>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">{payments.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-600 text-white text-left">
                  <th className="px-3 py-3 font-semibold rounded-tl-xl">#</th>
                  <th className="px-3 py-3 font-semibold">Plate Number</th>
                  <th className="px-3 py-3 font-semibold">Driver</th>
                  <th className="px-3 py-3 font-semibold">Entry Time</th>
                  <th className="px-3 py-3 font-semibold">Exit Time</th>
                  <th className="px-3 py-3 font-semibold">Duration</th>
                  <th className="px-3 py-3 font-semibold">Amount (Rwf)</th>
                  <th className="px-3 py-3 font-semibold">Payment Date</th>
                  <th className="px-3 py-3 font-semibold rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan="9" className="text-center py-12 text-gray-400 text-sm">No payments found.</td></tr>
                ) : payments.map((pay, i) => (
                  <tr key={pay.PaymentID} className={`border-b border-gray-100 hover:bg-purple-50 transition-colors ${i % 2 !== 0 ? 'bg-gray-50' : ''}`}>
                    <td className="px-3 py-3 text-gray-400 font-medium">{i + 1}</td>
                    <td className="px-3 py-3">
                      <span className="bg-blue-100 text-blue-800 font-bold text-xs px-2 py-0.5 rounded-lg">{pay.PlateNumber}</span>
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-800">{pay.DriverName}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{fmt(pay.EntryTime)}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{fmt(pay.ExitTime)}</td>
                    <td className="px-3 py-3 text-gray-600">{pay.Duration} hrs</td>
                    <td className="px-3 py-3">
                      <span className="bg-green-100 text-green-800 font-bold text-xs px-2.5 py-1 rounded-lg">
                        {parseFloat(pay.AmountPaid).toLocaleString()} Rwf
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{fmt(pay.PaymentDate)}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => setBill(pay)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors">
                          Bill
                        </button>
                        <button onClick={() => openEdit(pay)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(pay.PaymentID)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {payments.length > 0 && (
                <tfoot>
                  <tr className="bg-purple-50">
                    <td colSpan="6" className="px-3 py-3 text-right font-bold text-purple-800 text-sm">Total Revenue:</td>
                    <td className="px-3 py-3 font-bold text-purple-700">{totalRevenue.toLocaleString()} Rwf</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Payments;

import { useState, useEffect } from 'react';
import { getDailyReport, getAllPayments } from '../api/paymentAPI';

const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '—';

function Reports() {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bill, setBill] = useState(null);

  useEffect(() => {
    getAllPayments().then(r => setAllPayments(r.data)).catch(() => {});
    fetchReport(new Date().toISOString().split('T')[0]);
  }, []);

  const fetchReport = async (date) => {
    setLoading(true); setError('');
    try { const res = await getDailyReport(date); setReportData(res.data); }
    catch { setError('Failed to load report.'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); fetchReport(reportDate); };

  const totalRevenue = reportData.reduce((s, p) => s + parseFloat(p.AmountPaid || 0), 0);
  const allTimeRevenue = allPayments.reduce((s, p) => s + parseFloat(p.AmountPaid || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Daily parking payment reports and analytics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'All-Time Revenue', value: `${allTimeRevenue.toLocaleString()} Rwf`, sub: `${allPayments.length} total payments`, bg: 'bg-blue-700' },
            { label: `Daily Revenue (${reportDate})`, value: `${totalRevenue.toLocaleString()} Rwf`, sub: `${reportData.length} payments`, bg: 'bg-green-600' },
            { label: 'Avg. Per Transaction', value: `${reportData.length > 0 ? Math.round(totalRevenue / reportData.length).toLocaleString() : 0} Rwf`, sub: 'For selected date', bg: 'bg-orange-500' },
          ].map(c => (
            <div key={c.label} className={`${c.bg} text-white rounded-2xl p-5 shadow`}>
              <p className="text-sm text-white text-opacity-80">{c.label}</p>
              <p className="text-3xl font-bold mt-1">{c.value}</p>
              <p className="text-xs text-white text-opacity-60 mt-1">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Daily Report */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-800">Daily Parking Payment Report</h2>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">{reportData.length}</span>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="date" value={reportDate} onChange={e => setReportDate(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:border-green-500 transition-colors"
              />
              <button type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors focus:outline-none focus:ring-4 focus:ring-green-200">
                {loading ? '...' : 'Search'}
              </button>
            </form>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-600 text-white text-left">
                  <th className="px-3 py-3 font-semibold rounded-tl-xl">#</th>
                  <th className="px-3 py-3 font-semibold">Plate Number</th>
                  <th className="px-3 py-3 font-semibold">Driver</th>
                  <th className="px-3 py-3 font-semibold">Entry Time</th>
                  <th className="px-3 py-3 font-semibold">Exit Time</th>
                  <th className="px-3 py-3 font-semibold">Duration</th>
                  <th className="px-3 py-3 font-semibold">Amount (Rwf)</th>
                  <th className="px-3 py-3 font-semibold rounded-tr-xl">Bill</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-gray-400 text-sm">
                      No payments found for <strong>{reportDate}</strong>.
                    </td>
                  </tr>
                ) : reportData.map((row, i) => (
                  <tr key={row.PaymentID} className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${i % 2 !== 0 ? 'bg-gray-50' : ''}`}>
                    <td className="px-3 py-3 text-gray-400 font-medium">{i + 1}</td>
                    <td className="px-3 py-3">
                      <span className="bg-blue-100 text-blue-800 font-bold text-xs px-2 py-0.5 rounded-lg">{row.PlateNumber}</span>
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-800">{row.DriverName}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{fmt(row.EntryTime)}</td>
                    <td className="px-3 py-3 text-gray-600 text-xs">{fmt(row.ExitTime)}</td>
                    <td className="px-3 py-3 text-gray-600">{row.Duration} hrs</td>
                    <td className="px-3 py-3">
                      <span className="bg-green-100 text-green-800 font-bold text-xs px-2.5 py-1 rounded-lg">
                        {parseFloat(row.AmountPaid).toLocaleString()} Rwf
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => setBill(row)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                        View Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {reportData.length > 0 && (
                <tfoot>
                  <tr className="bg-green-50">
                    <td colSpan="6" className="px-3 py-3 text-right font-bold text-green-800 text-sm">Total Revenue:</td>
                    <td className="px-3 py-3 font-bold text-green-700">{totalRevenue.toLocaleString()} Rwf</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Bill Modal */}
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

      </div>
    </div>
  );
}

export default Reports;

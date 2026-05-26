import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const card = { background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '12px', marginBottom: '24px', overflow: 'hidden' };

const Reports = () => {
  const [report, setReport] = useState([]);
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchReport(); }, []);

  const fetchReport = async (selectedMonth = '') => {
    setLoading(true); setError('');
    try {
      const params = selectedMonth ? `?month=${selectedMonth}` : '';
      const res = await api.get(`/salaries/report/monthly${params}`);
      setReport(res.data);
    } catch { setError('Failed to load report'); }
    finally { setLoading(false); }
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    fetchReport(e.target.value);
  };

  const formatRwf = (n) => `${Number(n).toLocaleString()} RWF`;
  const totalGross = report.reduce((s, r) => s + r.grossSalary, 0);
  const totalDeduction = report.reduce((s, r) => s + r.totalDeduction, 0);
  const totalNet = report.reduce((s, r) => s + r.netSalary, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold" style={{color: '#f97316'}}>Monthly Payroll Report</h1>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{color: '#9ca3af'}}>Filter by Month</label>
            <input type="month" value={month} onChange={handleMonthChange}
              className="rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{background: '#1f1f1f', border: '1px solid #374151', color: '#f3f4f6'}}
              onFocus={e => e.target.style.borderColor = '#f97316'}
              onBlur={e => e.target.style.borderColor = '#374151'} />
          </div>
          <button onClick={() => window.print()}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-all print:hidden"
            style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
            🖨 Print
          </button>
        </div>
      </div>

      {error && <div className="px-4 py-3 rounded-lg text-sm mb-4" style={{background: '#2d0000', border: '1px solid #ef4444', color: '#fca5a5'}}>{error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 print:hidden">
        <div className="rounded-xl p-4" style={{background: '#1a1a1a', border: '1px solid #f97316'}}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{color: '#f97316'}}>Total Employees</p>
          <p className="text-3xl font-bold text-white mt-1">{report.length}</p>
        </div>
        <div className="rounded-xl p-4" style={{background: '#1a1a1a', border: '1px solid #ef4444'}}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{color: '#ef4444'}}>Total Deductions</p>
          <p className="text-2xl font-bold mt-1" style={{color: '#fca5a5'}}>{formatRwf(totalDeduction)}</p>
        </div>
        <div className="rounded-xl p-4" style={{background: '#1a1a1a', border: '1px solid #22c55e'}}>
          <p className="text-xs font-medium uppercase tracking-wide" style={{color: '#22c55e'}}>Total Net Salary</p>
          <p className="text-2xl font-bold mt-1" style={{color: '#86efac'}}>{formatRwf(totalNet)}</p>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-6">
        <h2 className="text-xl font-bold">SmartPark — Employee Payroll Management System</h2>
        <p className="text-sm text-gray-600">Rubavu District, Western Province, Rwanda</p>
        <p className="text-sm font-semibold mt-1">Monthly Payroll Report {month ? `— ${month}` : '(All Months)'}</p>
      </div>

      {/* Table */}
      <div style={card}>
        <div className="px-6 py-4 flex items-center justify-between" style={{borderBottom: '1px solid #2d2d2d'}}>
          <h2 className="text-base font-semibold text-white">
            Payroll Details {month && <span style={{color: '#f97316'}}>— {month}</span>}
          </h2>
          {loading && <span className="text-sm" style={{color: '#6b7280'}}>Loading...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{background: '#f97316'}}>
                {['#', 'First Name', 'Last Name', 'Position', 'Department', 'Month', 'Gross Salary', 'Deduction', 'Net Salary'].map(h => (
                  <th key={h} className={`px-4 py-3 font-semibold text-white ${['Gross Salary','Deduction','Net Salary'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-10" style={{color: '#6b7280'}}>
                  {loading ? 'Loading...' : 'No payroll records found'}
                </td></tr>
              ) : (
                report.map((row, idx) => (
                  <tr key={row._id} style={{borderBottom: '1px solid #2d2d2d', background: idx % 2 === 0 ? '#1a1a1a' : '#141414'}}>
                    <td className="px-4 py-3" style={{color: '#6b7280'}}>{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-white">{row.firstName}</td>
                    <td className="px-4 py-3 font-medium text-white">{row.lastName}</td>
                    <td className="px-4 py-3" style={{color: '#d1d5db'}}>{row.position}</td>
                    <td className="px-4 py-3" style={{color: '#d1d5db'}}>{row.department}</td>
                    <td className="px-4 py-3" style={{color: '#d1d5db'}}>{row.month}</td>
                    <td className="px-4 py-3 text-right" style={{color: '#d1d5db'}}>{formatRwf(row.grossSalary)}</td>
                    <td className="px-4 py-3 text-right" style={{color: '#ef4444'}}>{formatRwf(row.totalDeduction)}</td>
                    <td className="px-4 py-3 text-right font-bold" style={{color: '#22c55e'}}>{formatRwf(row.netSalary)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {report.length > 0 && (
              <tfoot>
                <tr style={{borderTop: '2px solid #f97316', background: '#1f1f1f'}}>
                  <td colSpan="6" className="px-4 py-3 font-bold text-right" style={{color: '#f97316'}}>TOTALS:</td>
                  <td className="px-4 py-3 text-right font-bold text-white">{formatRwf(totalGross)}</td>
                  <td className="px-4 py-3 text-right font-bold" style={{color: '#ef4444'}}>{formatRwf(totalDeduction)}</td>
                  <td className="px-4 py-3 text-right font-bold" style={{color: '#22c55e'}}>{formatRwf(totalNet)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

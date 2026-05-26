import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const card = { background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '12px', padding: '24px', marginBottom: '24px' };
const inputStyle = { background: '#0f0f0f', border: '1px solid #374151', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', color: '#f3f4f6', width: '100%', outline: 'none' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#d1d5db', marginBottom: '4px' };

const Salaries = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employee: '', grossSalary: '', totalDeduction: '', month: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchSalaries(); fetchEmployees(); }, []);

  const fetchSalaries = async () => {
    try { const res = await api.get('/salaries'); setSalaries(res.data); }
    catch { setError('Failed to load salaries'); }
  };

  const fetchEmployees = async () => {
    try { const res = await api.get('/employees'); setEmployees(res.data); }
    catch { setError('Failed to load employees'); }
  };

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    if (e.target.name === 'employee') {
      const emp = employees.find(em => em._id === e.target.value);
      if (emp?.department) {
        updated.grossSalary = emp.department.grossSalary;
        updated.totalDeduction = emp.department.totalDeduction;
      }
    }
    setForm(updated);
    setError(''); setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      if (editId) {
        await api.put(`/salaries/${editId}`, form);
        setSuccess('Salary updated successfully!');
        setEditId(null);
      } else {
        await api.post('/salaries', form);
        setSuccess('Salary record created successfully!');
      }
      setForm({ employee: '', grossSalary: '', totalDeduction: '', month: '' });
      fetchSalaries();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally { setLoading(false); }
  };

  const handleEdit = (salary) => {
    setEditId(salary._id);
    setForm({ employee: salary.employee?._id || '', grossSalary: salary.grossSalary, totalDeduction: salary.totalDeduction, month: salary.month });
    setError(''); setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this salary record?')) return;
    try {
      await api.delete(`/salaries/${id}`);
      setSuccess('Salary record deleted.');
      fetchSalaries();
    } catch (err) { setError(err.response?.data?.message || 'Delete failed'); }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm({ employee: '', grossSalary: '', totalDeduction: '', month: '' });
    setError(''); setSuccess('');
  };

  const formatRwf = (n) => `${Number(n).toLocaleString()} RWF`;
  const netPreview = form.grossSalary && form.totalDeduction ? Number(form.grossSalary) - Number(form.totalDeduction) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{color: '#f97316'}}>Salary Management</h1>

      {/* Form */}
      <div style={card}>
        <h2 className="text-base font-semibold mb-4 pb-2" style={{color: '#f97316', borderBottom: '1px solid #2d2d2d'}}>
          {editId ? 'Edit Salary Record' : 'Add Salary Record'}
        </h2>

        {error && <div className="px-4 py-3 rounded-lg text-sm mb-4" style={{background: '#2d0000', border: '1px solid #ef4444', color: '#fca5a5'}}>{error}</div>}
        {success && <div className="px-4 py-3 rounded-lg text-sm mb-4" style={{background: '#052e16', border: '1px solid #16a34a', color: '#86efac'}}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Employee *</label>
              <select name="employee" value={form.employee} onChange={handleChange} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'}>
                <option value="">Select employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.employeeNumber} - {emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Month *</label>
              <input type="month" name="month" value={form.month} onChange={handleChange} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'} />
            </div>
            <div>
              <label style={labelStyle}>Gross Salary (RWF) *</label>
              <input type="number" name="grossSalary" value={form.grossSalary} onChange={handleChange} required min="0"
                placeholder="Auto-filled from department" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'} />
            </div>
            <div>
              <label style={labelStyle}>Total Deduction (RWF) *</label>
              <input type="number" name="totalDeduction" value={form.totalDeduction} onChange={handleChange} required min="0"
                placeholder="Auto-filled from department" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'} />
            </div>
          </div>

          {netPreview !== null && (
            <div className="mt-4 px-4 py-3 rounded-lg text-sm" style={{background: '#1a2e1a', border: '1px solid #16a34a'}}>
              <span style={{color: '#86efac'}}>Net Salary Preview: </span>
              <span className="font-bold text-base" style={{color: '#22c55e'}}>{formatRwf(netPreview)}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            {editId && (
              <button type="button" onClick={handleCancelEdit}
                className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all"
                style={{background: '#1f1f1f', border: '1px solid #374151', color: '#d1d5db'}}>
                Cancel
              </button>
            )}
            <button type="submit" disabled={loading}
              className="px-8 py-2.5 rounded-lg font-medium text-sm text-white transition-all"
              style={{background: loading ? '#9a3412' : 'linear-gradient(135deg, #f97316, #ea580c)'}}>
              {loading ? 'Saving...' : editId ? 'Update Salary' : 'Add Salary'}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div style={{...card, padding: 0, overflow: 'hidden'}}>
        <div className="px-6 py-4" style={{borderBottom: '1px solid #2d2d2d'}}>
          <h2 className="text-base font-semibold text-white">Salary Records ({salaries.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{background: '#1f1f1f'}}>
                {['Employee', 'Department', 'Month', 'Gross Salary', 'Deduction', 'Net Salary', 'Actions'].map(h => (
                  <th key={h} className={`px-4 py-3 font-semibold ${h === 'Actions' ? 'text-center' : h === 'Gross Salary' || h === 'Deduction' || h === 'Net Salary' ? 'text-right' : 'text-left'}`}
                    style={{color: '#f97316'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salaries.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10" style={{color: '#6b7280'}}>No salary records found</td></tr>
              ) : (
                salaries.map((sal, i) => (
                  <tr key={sal._id} style={{borderBottom: '1px solid #2d2d2d', background: i % 2 === 0 ? '#1a1a1a' : '#141414'}}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{sal.employee?.firstName} {sal.employee?.lastName}</div>
                      <div className="text-xs" style={{color: '#6b7280'}}>{sal.employee?.employeeNumber}</div>
                    </td>
                    <td className="px-4 py-3" style={{color: '#d1d5db'}}>{sal.employee?.department?.departmentName || '-'}</td>
                    <td className="px-4 py-3" style={{color: '#d1d5db'}}>{sal.month}</td>
                    <td className="px-4 py-3 text-right" style={{color: '#d1d5db'}}>{formatRwf(sal.grossSalary)}</td>
                    <td className="px-4 py-3 text-right" style={{color: '#ef4444'}}>{formatRwf(sal.totalDeduction)}</td>
                    <td className="px-4 py-3 text-right font-bold" style={{color: '#22c55e'}}>{formatRwf(sal.netSalary)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(sal)}
                          className="px-3 py-1 rounded text-xs font-medium transition-colors"
                          style={{background: '#2d2000', color: '#fbbf24', border: '1px solid #f59e0b'}}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(sal._id)}
                          className="px-3 py-1 rounded text-xs font-medium transition-colors"
                          style={{background: '#2d0000', color: '#fca5a5', border: '1px solid #ef4444'}}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Salaries;

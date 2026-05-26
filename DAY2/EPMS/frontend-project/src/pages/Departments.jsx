import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const card = { background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '12px', padding: '24px', marginBottom: '24px' };
const inputStyle = { background: '#0f0f0f', border: '1px solid #374151', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', color: '#f3f4f6', width: '100%', outline: 'none' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#d1d5db', marginBottom: '4px' };

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ departmentCode: '', departmentName: '', grossSalary: '', totalDeduction: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch { setError('Failed to load departments'); }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await api.post('/departments', form);
      setSuccess('Department created successfully!');
      setForm({ departmentCode: '', departmentName: '', grossSalary: '', totalDeduction: '' });
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department');
    } finally { setLoading(false); }
  };

  const formatRwf = (n) => `${Number(n).toLocaleString()} RWF`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{color: '#f97316'}}>Department Management</h1>

      {/* Form */}
      <div style={card}>
        <h2 className="text-base font-semibold mb-4 pb-2" style={{color: '#f97316', borderBottom: '1px solid #2d2d2d'}}>Add New Department</h2>

        {error && <div className="px-4 py-3 rounded-lg text-sm mb-4" style={{background: '#2d0000', border: '1px solid #ef4444', color: '#fca5a5'}}>{error}</div>}
        {success && <div className="px-4 py-3 rounded-lg text-sm mb-4" style={{background: '#052e16', border: '1px solid #16a34a', color: '#86efac'}}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Department Code *</label>
              <input type="text" name="departmentCode" value={form.departmentCode} onChange={handleChange} required
                placeholder="e.g. CW" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'} />
            </div>
            <div>
              <label style={labelStyle}>Department Name *</label>
              <input type="text" name="departmentName" value={form.departmentName} onChange={handleChange} required
                placeholder="e.g. Carwash" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'} />
            </div>
            <div>
              <label style={labelStyle}>Gross Salary (RWF) *</label>
              <input type="number" name="grossSalary" value={form.grossSalary} onChange={handleChange} required min="0"
                placeholder="e.g. 300000" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'} />
            </div>
            <div>
              <label style={labelStyle}>Total Deduction (RWF) *</label>
              <input type="number" name="totalDeduction" value={form.totalDeduction} onChange={handleChange} required min="0"
                placeholder="e.g. 20000" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" disabled={loading}
              className="px-8 py-2.5 rounded-lg font-medium text-sm text-white transition-all"
              style={{background: loading ? '#9a3412' : 'linear-gradient(135deg, #f97316, #ea580c)'}}>
              {loading ? 'Saving...' : 'Add Department'}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div style={{...card, padding: 0, overflow: 'hidden'}}>
        <div className="px-6 py-4" style={{borderBottom: '1px solid #2d2d2d'}}>
          <h2 className="text-base font-semibold text-white">All Departments ({departments.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{background: '#1f1f1f'}}>
                <th className="px-4 py-3 text-left font-semibold" style={{color: '#f97316'}}>Code</th>
                <th className="px-4 py-3 text-left font-semibold" style={{color: '#f97316'}}>Department Name</th>
                <th className="px-4 py-3 text-right font-semibold" style={{color: '#f97316'}}>Gross Salary</th>
                <th className="px-4 py-3 text-right font-semibold" style={{color: '#f97316'}}>Total Deduction</th>
                <th className="px-4 py-3 text-right font-semibold" style={{color: '#f97316'}}>Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10" style={{color: '#6b7280'}}>No departments found</td></tr>
              ) : (
                departments.map((dept, i) => (
                  <tr key={dept._id} style={{borderBottom: '1px solid #2d2d2d', background: i % 2 === 0 ? '#1a1a1a' : '#141414'}}>
                    <td className="px-4 py-3 font-mono font-bold" style={{color: '#f97316'}}>{dept.departmentCode}</td>
                    <td className="px-4 py-3 font-medium text-white">{dept.departmentName}</td>
                    <td className="px-4 py-3 text-right" style={{color: '#d1d5db'}}>{formatRwf(dept.grossSalary)}</td>
                    <td className="px-4 py-3 text-right" style={{color: '#ef4444'}}>{formatRwf(dept.totalDeduction)}</td>
                    <td className="px-4 py-3 text-right font-semibold" style={{color: '#22c55e'}}>{formatRwf(dept.grossSalary - dept.totalDeduction)}</td>
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

export default Departments;

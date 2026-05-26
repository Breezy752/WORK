import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const card = { background: '#1a1a1a', border: '1px solid #2d2d2d', borderRadius: '12px', padding: '24px', marginBottom: '24px' };
const inputStyle = { background: '#0f0f0f', border: '1px solid #374151', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', color: '#f3f4f6', width: '100%', outline: 'none' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#d1d5db', marginBottom: '4px' };

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    employeeNumber: '', firstName: '', lastName: '', position: '',
    address: '', telephone: '', gender: '', hiredDate: '', department: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEmployees(); fetchDepartments(); }, []);

  const fetchEmployees = async () => {
    try { const res = await api.get('/employees'); setEmployees(res.data); }
    catch { setError('Failed to load employees'); }
  };

  const fetchDepartments = async () => {
    try { const res = await api.get('/departments'); setDepartments(res.data); }
    catch { setError('Failed to load departments'); }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await api.post('/employees', form);
      setSuccess('Employee registered successfully!');
      setForm({ employeeNumber: '', firstName: '', lastName: '', position: '', address: '', telephone: '', gender: '', hiredDate: '', department: '' });
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register employee');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{color: '#f97316'}}>Employee Management</h1>

      {/* Form */}
      <div style={card}>
        <h2 className="text-base font-semibold mb-4 pb-2" style={{color: '#f97316', borderBottom: '1px solid #2d2d2d'}}>Register New Employee</h2>

        {error && <div className="px-4 py-3 rounded-lg text-sm mb-4" style={{background: '#2d0000', border: '1px solid #ef4444', color: '#fca5a5'}}>{error}</div>}
        {success && <div className="px-4 py-3 rounded-lg text-sm mb-4" style={{background: '#052e16', border: '1px solid #16a34a', color: '#86efac'}}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'employeeNumber', label: 'Employee Number', placeholder: 'e.g. EMP001', type: 'text' },
              { name: 'firstName', label: 'First Name', placeholder: 'First name', type: 'text' },
              { name: 'lastName', label: 'Last Name', placeholder: 'Last name', type: 'text' },
              { name: 'position', label: 'Position', placeholder: 'e.g. Manager', type: 'text' },
              { name: 'address', label: 'Address', placeholder: 'Address', type: 'text' },
              { name: 'telephone', label: 'Telephone', placeholder: 'e.g. 0788000000', type: 'text' },
            ].map(f => (
              <div key={f.name}>
                <label style={labelStyle}>{f.label} *</label>
                <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} required
                  placeholder={f.placeholder} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#f97316'}
                  onBlur={e => e.target.style.borderColor = '#374151'} />
              </div>
            ))}

            <div>
              <label style={labelStyle}>Gender *</label>
              <select name="gender" value={form.gender} onChange={handleChange} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Hired Date *</label>
              <input type="date" name="hiredDate" value={form.hiredDate} onChange={handleChange} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'} />
            </div>

            <div>
              <label style={labelStyle}>Department *</label>
              <select name="department" value={form.department} onChange={handleChange} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = '#374151'}>
                <option value="">Select department</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.departmentCode} - {d.departmentName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button type="submit" disabled={loading}
              className="px-8 py-2.5 rounded-lg font-medium text-sm text-white transition-all"
              style={{background: loading ? '#9a3412' : 'linear-gradient(135deg, #f97316, #ea580c)'}}>
              {loading ? 'Saving...' : 'Register Employee'}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div style={{...card, padding: 0, overflow: 'hidden'}}>
        <div className="px-6 py-4" style={{borderBottom: '1px solid #2d2d2d'}}>
          <h2 className="text-base font-semibold text-white">All Employees ({employees.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{background: '#1f1f1f'}}>
                {['Emp No.', 'Full Name', 'Position', 'Gender', 'Telephone', 'Department', 'Hired Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold" style={{color: '#f97316'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10" style={{color: '#6b7280'}}>No employees found</td></tr>
              ) : (
                employees.map((emp, i) => (
                  <tr key={emp._id} style={{borderBottom: '1px solid #2d2d2d', background: i % 2 === 0 ? '#1a1a1a' : '#141414'}}>
                    <td className="px-4 py-3 font-mono font-bold" style={{color: '#f97316'}}>{emp.employeeNumber}</td>
                    <td className="px-4 py-3 font-medium text-white">{emp.firstName} {emp.lastName}</td>
                    <td className="px-4 py-3" style={{color: '#d1d5db'}}>{emp.position}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium"
                        style={emp.gender === 'Male'
                          ? {background: '#1e3a5f', color: '#93c5fd'}
                          : {background: '#3d1a2e', color: '#f9a8d4'}}>
                        {emp.gender}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{color: '#d1d5db'}}>{emp.telephone}</td>
                    <td className="px-4 py-3" style={{color: '#d1d5db'}}>{emp.department?.departmentName || '-'}</td>
                    <td className="px-4 py-3" style={{color: '#d1d5db'}}>{new Date(emp.hiredDate).toLocaleDateString()}</td>
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

export default Employees;

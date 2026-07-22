import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './Register.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    rollNumber: '',
    department: '',
    semester: '',
    batch: '',
    accessCode: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const selectRole = (role) => {
    setFormData({ ...formData, role });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Student-only required fields
    if (formData.role === 'student') {
      if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
      if (!formData.department.trim()) newErrors.department = 'Department is required';
      if (!formData.semester.trim()) newErrors.semester = 'Semester is required';
      if (!formData.batch.trim()) newErrors.batch = 'Batch is required';
    }

    // Supervisor/Admin require the access code
    if (formData.role === 'supervisor' || formData.role === 'admin') {
      if (!formData.accessCode.trim()) {
        newErrors.accessCode = 'Access code is required for this role';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      // Registration successful — redirect to login
      navigate('/', { state: { registered: true } });
    } catch (error) {
      setServerError(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-main">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Your Account</h1>
          <p>Fill in your details to get started</p>
        </div>

        {serverError && <div className="error-banner">{serverError}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Role selector */}
          <div className="role-selector">
            {['student', 'supervisor', 'admin'].map((role) => (
              <div
                key={role}
                className={`role-option ${formData.role === role ? 'active' : ''}`}
                onClick={() => selectRole(role)}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="error-text">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Only show these fields when role is 'student' */}
          {formData.role === 'student' && (
            <div className="student-fields">
              <div className="form-row">
                <div className="form-group">
                  <label>Roll Number</label>
                  <input
                    type="text"
                    name="rollNumber"
                    placeholder="e.g. B25-112"
                    value={formData.rollNumber}
                    onChange={handleChange}
                  />
                  {errors.rollNumber && <p className="error-text">{errors.rollNumber}</p>}
                </div>

                <div className="form-group">
                  <label>Batch</label>
                  <input
                    type="text"
                    name="batch"
                    placeholder="e.g. Batch 25"
                    value={formData.batch}
                    onChange={handleChange}
                  />
                  {errors.batch && <p className="error-text">{errors.batch}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChange={handleChange}
                  />
                  {errors.department && <p className="error-text">{errors.department}</p>}
                </div>

                <div className="form-group">
                  <label>Semester</label>
                  <input
                    type="text"
                    name="semester"
                    placeholder="e.g. 8th"
                    value={formData.semester}
                    onChange={handleChange}
                  />
                  {errors.semester && <p className="error-text">{errors.semester}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Only show access code field for Supervisor/Admin */}
          {(formData.role === 'supervisor' || formData.role === 'admin') && (
            <div className="form-group">
              <label>Access Code</label>
              <input
                type="password"
                name="accessCode"
                placeholder={`Enter the ${formData.role} access code`}
                value={formData.accessCode}
                onChange={handleChange}
              />
              {errors.accessCode && <p className="error-text">{errors.accessCode}</p>}
            </div>
          )}

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/">Login Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
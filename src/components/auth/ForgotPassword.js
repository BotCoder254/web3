import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import { auth } from '../../config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import AuthLayout from './AuthLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Check your email for password reset instructions.');
      setEmail('');
    } catch (error) {
      setError('Failed to reset password. Please check your email address.');
      console.error('Password reset error:', error);
    }

    setLoading(false);
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive reset instructions"
    >
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 text-green-500 p-3 rounded-lg text-sm">
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primaryDark transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <p className="text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-primary hover:text-primaryDark font-medium">
            Log in
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
};

export default ForgotPassword; 
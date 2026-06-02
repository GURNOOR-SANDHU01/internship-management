/*
  @author Gurnoor SINGH (102316101) 
*/
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // TODO: Call API to update password with token
    console.log('Resetting password for token:', token);
    setSubmitted(true);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100 text-center">
        {!submitted ? (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-gray-500 mb-8">Please enter your new password below.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 transition-all shadow-md"
              >
                Reset Password
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
            <p className="text-gray-500 mb-8">You can now log in with your new password.</p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 transition-all shadow-md"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

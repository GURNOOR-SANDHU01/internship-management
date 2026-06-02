import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Call API to send reset link
    console.log('Sending reset link to:', email);
    setSubmitted(true);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-12">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100 text-center">
        {!submitted ? (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
            <p className="text-gray-500 mb-8">Enter your email address and we'll send you a link to reset your password.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="you@example.com"
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 transition-all shadow-md"
              >
                Send Reset Link
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-500 mb-8">We've sent a password reset link to <span className="font-semibold">{email}</span>.</p>
            <button 
              onClick={() => navigate('/login')}
              className="text-primary font-semibold hover:underline"
            >
              Return to login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

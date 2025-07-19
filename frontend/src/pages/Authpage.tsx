// import React, { useState } from 'react';
// import { Zap } from 'lucide-react';

// const AuthPage = () => {
//   const [isLogin, setIsLogin] = useState(true); // true for login, false for signup

//   const authStyles = {
//     container: {
//       minHeight: '100vh',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
//       fontFamily: 'system-ui, -apple-system, sans-serif',
//       padding: '1rem',
//     },
//     card: {
//       backgroundColor: 'white',
//       borderRadius: '1rem',
//       boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
//       padding: '2.5rem',
//       width: '100%',
//       maxWidth: '400px',
//       textAlign: 'center',
//       position: 'relative',
//       overflow: 'hidden',
//     },
//     logo: {
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       gap: '0.5rem',
//       marginBottom: '2rem',
//     },
//     logoIcon: {
//       width: '2.5rem',
//       height: '2.5rem',
//       background: 'linear-gradient(135deg, #22c55e, #059669)',
//       borderRadius: '0.5rem',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       color: 'white',
//     },
//     logoText: {
//       fontSize: '1.8rem',
//       fontWeight: 'bold',
//       background: 'linear-gradient(90deg, #166534, #059669)',
//       WebkitBackgroundClip: 'text',
//       WebkitTextFillColor: 'transparent',
//     },
//     title: {
//       fontSize: '1.75rem',
//       fontWeight: 'bold',
//       color: '#1f2937',
//       marginBottom: '1.5rem',
//     },
//     form: {
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '1rem',
//     },
//     input: {
//       width: '100%',
//       padding: '0.8rem 1rem',
//       borderRadius: '0.5rem',
//       border: '1px solid #d1d5db',
//       fontSize: '1rem',
//       transition: 'border-color 0.3s, box-shadow 0.3s',
//       outline: 'none',
//     },
//     button: {
//       padding: '0.8rem 1.5rem',
//       borderRadius: '0.5rem',
//       fontSize: '1rem',
//       fontWeight: '600',
//       cursor: 'pointer',
//       border: 'none',
//       transition: 'all 0.3s ease',
//     },
//     primaryButton: {
//       background: 'linear-gradient(90deg, #22c55e, #059669)',
//       color: 'white',
//       boxShadow: '0 5px 15px rgba(34, 197, 94, 0.3)',
//     },
//     toggleText: {
//       marginTop: '1.5rem',
//       color: '#4b5563',
//       fontSize: '0.9rem',
//     },
//     toggleLink: {
//       color: '#059669',
//       fontWeight: '600',
//       cursor: 'pointer',
//       textDecoration: 'none',
//       marginLeft: '0.3rem',
//     },
//   };

//   const handleLoginSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Implement login logic here
//     alert('Login form submitted!');
//     // Example: Call an API, handle authentication
//   };

//   const handleSignupSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Implement signup logic here
//     alert('Signup form submitted!');
//     // Example: Call an API, create user
//   };

//   return (
//     <div style={authStyles.container}>
//       <div style={authStyles.card}>
//         <div style={authStyles.logo}>
//           <div style={authStyles.logoIcon}>
//             <Zap style={{ width: '1.5rem', height: '1.5rem' }} />
//           </div>
//           <span style={authStyles.logoText}>GreenGrid</span>
//         </div>

//         <h2 style={authStyles.title}>
//           {isLogin ? 'Login to Your Account' : 'Create Your Account'}
//         </h2>

//         {isLogin ? (
//           <form style={authStyles.form} onSubmit={handleLoginSubmit}>
//             <input
//               type="email"
//               placeholder="Email Address"
//               required
//               style={authStyles.input}
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               required
//               style={authStyles.input}
//             />
//             <button type="submit" style={{ ...authStyles.button, ...authStyles.primaryButton }}>
//               Login
//             </button>
//           </form>
//         ) : (
//           <form style={authStyles.form} onSubmit={handleSignupSubmit}>
//             <input
//               type="text"
//               placeholder="Full Name"
//               required
//               style={authStyles.input}
//             />
//             <input
//               type="email"
//               placeholder="Email Address"
//               required
//               style={authStyles.input}
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               required
//               style={authStyles.input}
//             />
//             <input
//               type="password"
//               placeholder="Confirm Password"
//               required
//               style={authStyles.input}
//             />
//             <button type="submit" style={{ ...authStyles.button, ...authStyles.primaryButton }}>
//               Sign Up
//             </button>
//           </form>
//         )}

//         <p style={authStyles.toggleText}>
//           {isLogin ? "Don't have an account?" : "Already have an account?"}
//           <a
//             href="#"
//             onClick={(e) => {
//               e.preventDefault();
//               setIsLogin(!isLogin);
//             }}
//             style={authStyles.toggleLink}
//           >
//             {isLogin ? 'Sign Up' : 'Login'}
//           </a>
//         </p>
//       </div>
//     </div>
//   );

// };

// export default AuthPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

type AuthPageProps = {
  onLogin: () => void;
  onSignup: () => void;
};

const AuthPage = ({ onLogin, onSignup }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      // Login logic
      onLogin();
      navigate('/profile');
    } else {
      // Signup logic
      onSignup();
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-lg mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Login to SolarConnect' : 'Create Account'}
          </h1>
        </div>

        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 font-medium ${isLogin ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 font-medium ${!isLogin ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="fullName" className="block text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="aadhaar" className="block text-gray-700 mb-2">
                Aadhaar Number
              </label>
              <input
                type="text"
                id="aadhaar"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                pattern="\d{12}"
                title="12-digit Aadhaar number"
              />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-blue-600 hover:underline w-full text-center"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;

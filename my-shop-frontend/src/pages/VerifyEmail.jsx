import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api'; 

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();
  const hasCalled = useRef(false);

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        return;
      }

      if (hasCalled.current) return;
      hasCalled.current = true;

      try {
        // DEBUG: If this shows, your component is working!
        console.log("Attempting to hit backend...");
        
        // We use the full endpoint string with a leading slash
        const response = await API.get(`/auth/verify-email?token=${token}`);
        
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        // If the request hits port 5173, this will likely be a 404
        console.error("Connection failed:", err.response?.status, err.message);
        setStatus('error');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>{status === 'verifying' ? 'Checking your token...' : 
           status === 'success' ? '✅ Verified! Redirecting...' : 
           '❌ Verification Link Failed'}</h2>
    </div>
  );
};

export default VerifyEmail;
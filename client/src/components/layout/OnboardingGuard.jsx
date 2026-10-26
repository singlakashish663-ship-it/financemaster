import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function OnboardingGuard({ children }) {
  const { needsOnboarding } = useAuth();
  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

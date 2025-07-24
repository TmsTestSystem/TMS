import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Projects from './pages/Projects.tsx';
import ProjectDetail from './pages/ProjectDetail.tsx';
import TestCases from './pages/TestCases.tsx';
import TestPlans from './pages/TestPlans.tsx';
import TestRuns from './pages/TestRuns.tsx';
import Login from './pages/Login.tsx';
import TestPlanDetail from './pages/TestPlanDetail.tsx';
import TestRunDetail from './pages/TestRunDetail.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:projectId/test-cases" element={<TestCases />} />
          <Route path="test-cases" element={<TestCases />} />
          <Route path="test-plans" element={<TestPlans />} />
          <Route path="test-plans/:id" element={<TestPlanDetail />} />
          <Route path="test-runs" element={<TestRuns />} />
          <Route path="test-runs/:id" element={<TestRunDetail />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App; 
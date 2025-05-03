'use client';

import { useState } from 'react';
import { ProjectList } from '@/components/ProjectList';
import { ProjectForm } from '@/components/ProjectForm';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to trigger a refresh of the project list
  const handleProjectAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Time Tracker</h1>
        
        <ProjectForm onProjectAdded={handleProjectAdded} />
        
        <div key={refreshKey}>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Your Projects</h2>
          <ProjectList />
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { ProjectList } from '@/components/ProjectList';
import { ProjectForm } from '@/components/ProjectForm';
import { QuickAddButton } from '@/components/QuickAddButton';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to trigger a refresh of the project list
  const handleProjectAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Function to handle when a time entry is added via the QuickAddButton
  const handleTimeEntryAdded = () => {
    // We don't need to refresh the project list when a time entry is added,
    // but we could add additional logic here if needed in the future
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
      
      <QuickAddButton onTimeEntryAdded={handleTimeEntryAdded} />
    </main>
  );
}
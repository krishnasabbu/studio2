import React from 'react';

const DashboardPage: React.FC = () => {
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
            Template Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your notification templates
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
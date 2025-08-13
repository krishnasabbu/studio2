import React from 'react';
import { Chatbot } from '../components/chatbot';

const DashboardPage: React.FC = () => {
  const handleTemplateOnboard = () => {
    console.log('Template onboarding initiated from dashboard');
    // In production, this would navigate to template onboarding flow
  };

  const handleAlertOnboard = () => {
    console.log('Alert onboarding initiated from dashboard');
    // In production, this would navigate to alert onboarding flow
  };
  
  return (
    <>
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

        {/* Dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Email Templates
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Create and manage email notification templates
            </p>
            <div className="text-2xl font-bold text-primary-600">24</div>
            <div className="text-xs text-gray-500">Active templates</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Push Notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Manage push notification templates
            </p>
            <div className="text-2xl font-bold text-accent-600">12</div>
            <div className="text-xs text-gray-500">Active templates</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              SMS Templates
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Create and manage SMS templates
            </p>
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-xs text-gray-500">Active templates</div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Welcome Email Template
                </div>
                <div className="text-xs text-gray-500">Updated 2 hours ago</div>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Password Reset SMS
                </div>
                <div className="text-xs text-gray-500">Created 1 day ago</div>
              </div>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Draft
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Order Confirmation Push
                </div>
                <div className="text-xs text-gray-500">Updated 3 days ago</div>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot
        onTemplateOnboard={handleTemplateOnboard}
        onAlertOnboard={handleAlertOnboard}
      />
    </>
  );
};

export default DashboardPage;
import React from 'react';
import { User } from 'lucide-react';

const Navbar: React.FC = () => {

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-primary-700 dark:text-white">
            Notification Templates
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-primary-50 dark:bg-gray-700 rounded-lg px-3 py-2">
              <User className="h-5 w-5 text-primary-600 dark:text-gray-400" />
              <div className="text-sm">
                <div className="text-primary-700 dark:text-gray-300 font-medium">
                  Sabbu
                </div>
                <div className="text-xs text-primary-500 dark:text-gray-400">
                  Administrator
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
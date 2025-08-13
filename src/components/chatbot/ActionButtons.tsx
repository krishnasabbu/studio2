import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { ActionButtonsProps } from './types';

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onTemplateOnboard, 
  onAlertOnboard 
}) => {
  return (
    <div className="flex flex-col space-y-3 p-4">
      <button
        onClick={onTemplateOnboard}
        className="flex items-center justify-center space-x-3 w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200"
        aria-label="Start template onboarding process"
      >
        <FileText className="w-5 h-5" />
        <span>Template Onboard</span>
      </button>
      
      <button
        onClick={onAlertOnboard}
        className="flex items-center justify-center space-x-3 w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent-200"
        aria-label="Start alert onboarding process"
      >
        <AlertTriangle className="w-5 h-5" />
        <span>Alert Onboard</span>
      </button>
    </div>
  );
};

export default ActionButtons;
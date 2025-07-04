import React from 'react';
import { DiffViewerProps } from '../types';

const DiffViewer: React.FC<DiffViewerProps> = ({ originalText, newText }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      <h4 className="font-semibold text-gray-700 mb-2">Changes Made:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-red-600 font-medium mb-1">Previous Version</div>
          <div className="bg-red-50 border border-red-200 rounded p-2 text-sm whitespace-pre-wrap">
            {originalText}
          </div>
        </div>
        <div>
          <div className="text-sm text-green-600 font-medium mb-1">Improved Version</div>
          <div className="bg-green-50 border border-green-200 rounded p-2 text-sm whitespace-pre-wrap">
            {newText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;
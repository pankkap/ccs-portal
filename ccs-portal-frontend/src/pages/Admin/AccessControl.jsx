import React from 'react';
import { Layout } from '../../components/Layout';
import { Shield } from 'lucide-react';

const AccessControl = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Access Control</h1>
            <p className="text-gray-500 mt-2">Manage roles, permissions, and system access.</p>
          </div>
        </header>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-500">Access Control Module</h3>
          <p className="text-gray-400 mt-2">This module is under construction.</p>
        </div>
      </div>
    </Layout>
  );
};

export default AccessControl;

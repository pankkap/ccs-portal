import React from 'react';
import { Layout } from '../../components/Layout';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UnderConstruction = ({ pageName }) => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-yellow-200">
          <Construction className="w-12 h-12 text-yellow-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          {pageName} Under Construction
        </h1>
        <p className="text-lg text-gray-500 max-w-lg mb-8">
          We are currently working hard to bring the {pageName} module to life. 
          This feature will be available in the upcoming release.
        </p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>
    </Layout>
  );
};

export default UnderConstruction;

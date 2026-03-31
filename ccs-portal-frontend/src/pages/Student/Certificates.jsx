import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Award, Eye, Download, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../lib/utils';

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const q = query(collection(db, 'certificates'), where('studentId', '==', user.uid));
        const snap = await getDocs(q);
        setCertificates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
          <p className="text-gray-500 mt-2">View and download your earned certificates.</p>
        </header>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group">
                <div className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2"></div>
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-yellow-600 shadow-xl mb-6 relative z-10">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">{cert.courseTitle}</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider relative z-10">Certificate of Completion</p>
                </div>
                
                <div className="p-8">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Issued to</span>
                      <span className="font-bold text-gray-900">{cert.studentName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Issued on</span>
                      <span className="font-bold text-gray-900">{formatDate(cert.issuedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">ID</span>
                      <span className="font-mono text-xs font-bold text-gray-400">{cert.certificateNumber}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
                
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verified by IILM University</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No certificates earned yet</h3>
            <p className="text-gray-500">Complete courses and pass assessments to earn certificates.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Certificates;

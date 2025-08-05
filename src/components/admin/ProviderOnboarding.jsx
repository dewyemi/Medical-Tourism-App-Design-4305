import { useState, useEffect } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getProviderApplications, approveProviderApplication, rejectProviderApplication } from '../../services/adminService';
import { formatDate } from '../../utils/dataUtils';
import Modal from '../Modal';

const { FiUserPlus, FiCheck, FiX, FiEye, FiMail, FiPhone } = FiIcons;

const ProviderOnboarding = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getProviderApplications();
      setApplications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load provider applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    try {
      setProcessing(true);
      await approveProviderApplication(applicationId);
      await fetchApplications();
      setIsViewModalOpen(false);
    } catch (err) {
      setError('Failed to approve application');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (applicationId, reason) => {
    try {
      setProcessing(true);
      await rejectProviderApplication(applicationId, reason);
      await fetchApplications();
      setIsViewModalOpen(false);
    } catch (err) {
      setError('Failed to reject application');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Healthcare Provider Applications</h2>
        <p className="text-gray-600">Review and approve healthcare provider registrations</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-8">
          <SafeIcon icon={FiUserPlus} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications</h3>
          <p className="text-gray-600">No healthcare provider applications to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(application => (
            <div key={application.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <SafeIcon icon={FiUserPlus} className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Dr. {application.first_name} {application.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{application.specialization}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                  {application.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <SafeIcon icon={FiMail} className="w-4 h-4 mr-2" />
                  {application.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <SafeIcon icon={FiPhone} className="w-4 h-4 mr-2" />
                  {application.phone_number}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <SafeIcon icon={FiIcons.FiCalendar} className="w-4 h-4 mr-2" />
                  Applied {formatDate(application.created_at)}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedApplication(application);
                    setIsViewModalOpen(true);
                  }}
                  className="flex items-center px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <SafeIcon icon={FiEye} className="w-4 h-4 mr-2" />
                  View Details
                </button>
                
                {application.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(application.id)}
                      disabled={processing}
                      className="flex items-center px-3 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 disabled:bg-gray-100"
                    >
                      <SafeIcon icon={FiCheck} className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(application.id, 'Application rejected')}
                      disabled={processing}
                      className="flex items-center px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:bg-gray-100"
                    >
                      <SafeIcon icon={FiX} className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        {selectedApplication && (
          <div className="bg-white rounded-xl p-6 max-w-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Provider Application Details
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <p className="text-gray-900">{selectedApplication.first_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <p className="text-gray-900">{selectedApplication.last_name}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{selectedApplication.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{selectedApplication.phone_number}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <p className="text-gray-900">{selectedApplication.specialization}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <p className="text-gray-900">{selectedApplication.license_number}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <p className="text-gray-900">{selectedApplication.years_experience} years</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <p className="text-gray-900">{selectedApplication.institution}</p>
              </div>
              
              {selectedApplication.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <p className="text-gray-900">{selectedApplication.bio}</p>
                </div>
              )}
            </div>
            
            {selectedApplication.status === 'pending' && (
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleApprove(selectedApplication.id)}
                  disabled={processing}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {processing ? 'Processing...' : 'Approve Application'}
                </button>
                <button
                  onClick={() => handleReject(selectedApplication.id, 'Application rejected')}
                  disabled={processing}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  {processing ? 'Processing...' : 'Reject Application'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProviderOnboarding;
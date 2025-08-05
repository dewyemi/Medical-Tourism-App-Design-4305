import { useState } from 'react';
import { usePatientJourney } from '../contexts/PatientJourneyContext';
import JourneyProgressBar from '../components/journey/JourneyProgressBar';
import MilestonesCard from '../components/journey/MilestonesCard';
import MedicalHistoryForm from '../components/medical/MedicalHistoryForm';
import SupportTicketForm from '../components/support/SupportTicketForm';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMessageSquare, FiFileText, FiUser, FiCalendar } = FiIcons;

const PatientJourney = () => {
  const { currentJourney, getCurrentStageInfo, getNextStage, advanceJourney } = usePatientJourney();
  const [activeTab, setActiveTab] = useState('overview');
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);

  const currentStage = getCurrentStageInfo();
  const nextStage = getNextStage();

  const handleMedicalHistoryComplete = () => {
    setShowMedicalForm(false);
    // Journey advancement is handled in the form component
  };

  const handleTicketCreated = (ticket) => {
    setShowSupportForm(false);
    // You could show a success message here
  };

  const quickActions = [
    {
      id: 'medical_history',
      title: 'Complete Medical History',
      description: 'Provide your medical background',
      icon: FiFileText,
      color: 'bg-blue-50 text-blue-600',
      action: () => setShowMedicalForm(true),
      available: currentJourney?.journey_stage === 'medical_history_collection'
    },
    {
      id: 'support',
      title: 'Get Support',
      description: 'Contact our support team',
      icon: FiMessageSquare,
      color: 'bg-green-50 text-green-600',
      action: () => setShowSupportForm(true),
      available: true
    },
    {
      id: 'profile',
      title: 'Update Profile',
      description: 'Keep your information current',
      icon: FiUser,
      color: 'bg-purple-50 text-purple-600',
      action: () => window.location.href = '/profile/edit',
      available: true
    },
    {
      id: 'appointments',
      title: 'View Appointments',
      description: 'Check your scheduled appointments',
      icon: FiCalendar,
      color: 'bg-orange-50 text-orange-600',
      action: () => window.location.href = '/appointments',
      available: true
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Healthcare Journey</h1>
        {nextStage && (
          <button
            onClick={() => advanceJourney(nextStage.id)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Continue to {nextStage.title}
          </button>
        )}
      </div>

      {/* Journey Progress */}
      <JourneyProgressBar />

      {/* Current Stage Actions */}
      {currentStage && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Stage: {currentStage.title}
          </h3>
          <p className="text-gray-600 mb-4">{currentStage.description}</p>
          
          {currentJourney?.journey_stage === 'medical_history_collection' && (
            <button
              onClick={() => setShowMedicalForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Complete Medical History
            </button>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.filter(action => action.available).map(action => (
          <button
            key={action.id}
            onClick={action.action}
            className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
          >
            <div className={`p-3 rounded-lg ${action.color} w-fit mb-3`}>
              <SafeIcon icon={action.icon} className="w-6 h-6" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
            <p className="text-sm text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Milestones */}
      <MilestonesCard />

      {/* Medical History Form Modal */}
      {showMedicalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Medical History</h2>
              <button
                onClick={() => setShowMedicalForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <SafeIcon icon={FiIcons.FiX} className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <MedicalHistoryForm onComplete={handleMedicalHistoryComplete} />
            </div>
          </div>
        </div>
      )}

      {/* Support Form Modal */}
      {showSupportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Contact Support</h2>
              <button
                onClick={() => setShowSupportForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <SafeIcon icon={FiIcons.FiX} className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <SupportTicketForm onTicketCreated={handleTicketCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientJourney;
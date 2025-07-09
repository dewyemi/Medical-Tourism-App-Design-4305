import React from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { usePatientJourney } from '../../contexts/PatientJourneyContext';
import { formatDate } from '../../utils/dataUtils';

const { FiCheck, FiCircle, FiClock } = FiIcons;

const MilestonesCard = () => {
  const { journeyMilestones, completeMilestone, loading } = usePatientJourney();

  const handleCompleteMilestone = async (milestoneId) => {
    await completeMilestone(milestoneId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center">
                <div className="w-6 h-6 bg-gray-200 rounded-full mr-3"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pendingMilestones = journeyMilestones.filter(m => !m.completed);
  const completedMilestones = journeyMilestones.filter(m => m.completed);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Milestones</h3>

      {/* Pending Milestones */}
      {pendingMilestones.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Pending Tasks</h4>
          <div className="space-y-3">
            {pendingMilestones.map((milestone) => (
              <div key={milestone.id} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                <button
                  onClick={() => handleCompleteMilestone(milestone.id)}
                  className="w-6 h-6 rounded-full border-2 border-yellow-400 flex items-center justify-center mr-3 mt-0.5 hover:bg-yellow-100 transition-colors"
                >
                  <SafeIcon icon={FiCircle} className="w-3 h-3 text-yellow-400" />
                </button>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{milestone.milestone_title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{milestone.milestone_description}</p>
                  {milestone.due_date && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <SafeIcon icon={FiClock} className="w-3 h-3 mr-1" />
                      Due: {formatDate(milestone.due_date)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Milestones */}
      {completedMilestones.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Completed</h4>
          <div className="space-y-2">
            {completedMilestones.slice(-3).map((milestone) => (
              <div key={milestone.id} className="flex items-center p-2 bg-green-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-3">
                  <SafeIcon icon={FiCheck} className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{milestone.milestone_title}</h5>
                  <p className="text-xs text-gray-500">
                    Completed on {formatDate(milestone.completed_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {journeyMilestones.length === 0 && (
        <div className="text-center py-6">
          <SafeIcon icon={FiCircle} className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No milestones yet</p>
        </div>
      )}
    </div>
  );
};

export default MilestonesCard;
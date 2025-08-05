import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { usePatientJourney } from '../../contexts/PatientJourneyContext';

const JourneyProgressBar = () => {
  const { currentJourney, journeyStages, getCurrentStageInfo, getProgressPercentage } = usePatientJourney();

  if (!currentJourney) return null;

  const currentStageInfo = getCurrentStageInfo();
  const progressPercentage = getProgressPercentage();
  const currentStageIndex = journeyStages.findIndex(stage => stage.id === currentJourney.journey_stage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Healthcare Journey</h3>
        <span className="text-sm text-gray-500">
          Step {currentJourney.current_step} of {currentJourney.total_steps}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Current Stage Info */}
      {currentStageInfo && (
        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
          <div className={`p-3 rounded-full ${currentStageInfo.color} mr-4`}>
            <SafeIcon 
              icon={FiIcons[currentStageInfo.icon] || FiIcons.FiCircle} 
              className="w-6 h-6"
            />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{currentStageInfo.title}</h4>
            <p className="text-sm text-gray-600">{currentStageInfo.description}</p>
          </div>
        </div>
      )}

      {/* Journey Timeline */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Journey Timeline</h4>
        <div className="space-y-2">
          {journeyStages.slice(0, Math.min(currentStageIndex + 3, journeyStages.length)).map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isUpcoming = index > currentStageIndex;

            return (
              <div key={stage.id} className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  isCompleted ? 'bg-green-500' :
                  isCurrent ? 'bg-primary-600' :
                  'bg-gray-300'
                }`}></div>
                <span className={`text-sm ${
                  isCompleted ? 'text-green-600' :
                  isCurrent ? 'text-primary-600 font-medium' :
                  'text-gray-500'
                }`}>
                  {stage.title}
                </span>
                {isCompleted && (
                  <SafeIcon icon={FiIcons.FiCheck} className="w-4 h-4 text-green-500 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JourneyProgressBar;
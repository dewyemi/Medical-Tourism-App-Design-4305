import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { useAuth } from './AuthContext';

const PatientJourneyContext = createContext(null);

export const usePatientJourney = () => {
  const context = useContext(PatientJourneyContext);
  if (!context) {
    throw new Error('usePatientJourney must be used within a PatientJourneyProvider');
  }
  return context;
};

export const PatientJourneyProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentJourney, setCurrentJourney] = useState(null);
  const [journeyMilestones, setJourneyMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Journey stages configuration
  const journeyStages = [
    {
      id: 'initial_inquiry',
      title: 'Initial Inquiry',
      description: 'Welcome! Let\'s start your healthcare journey',
      icon: 'MessageCircle',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'medical_history_collection',
      title: 'Medical History',
      description: 'Provide your medical background and history',
      icon: 'FileText',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'preliminary_assessment',
      title: 'Health Assessment',
      description: 'Initial evaluation of your health needs',
      icon: 'Stethoscope',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'treatment_selection',
      title: 'Treatment Selection',
      description: 'Choose the best treatment option for you',
      icon: 'Heart',
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'provider_matching',
      title: 'Provider Matching',
      description: 'Find the right healthcare provider',
      icon: 'Users',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 'payment_processing',
      title: 'Payment Processing',
      description: 'Secure payment for your treatment',
      icon: 'CreditCard',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'appointment_booking',
      title: 'Appointment Booking',
      description: 'Schedule your medical appointments',
      icon: 'Calendar',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 'pre_travel_preparation',
      title: 'Travel Preparation',
      description: 'Prepare for your medical journey',
      icon: 'Luggage',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'visa_accommodation',
      title: 'Visa & Accommodation',
      description: 'Arrange travel documents and lodging',
      icon: 'Passport',
      color: 'bg-teal-100 text-teal-600'
    },
    {
      id: 'arrival_orientation',
      title: 'Arrival & Orientation',
      description: 'Welcome to your destination',
      icon: 'MapPin',
      color: 'bg-cyan-100 text-cyan-600'
    },
    {
      id: 'treatment_execution',
      title: 'Treatment Execution',
      description: 'Receive your medical treatment',
      icon: 'Activity',
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      id: 'recovery_monitoring',
      title: 'Recovery Monitoring',
      description: 'Track your recovery progress',
      icon: 'TrendingUp',
      color: 'bg-lime-100 text-lime-600'
    },
    {
      id: 'discharge_planning',
      title: 'Discharge Planning',
      description: 'Prepare for discharge and next steps',
      icon: 'CheckCircle',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'return_travel',
      title: 'Return Travel',
      description: 'Safe journey back home',
      icon: 'Home',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'follow_up_care',
      title: 'Follow-up Care',
      description: 'Continued care and monitoring',
      icon: 'RefreshCw',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'outcome_assessment',
      title: 'Outcome Assessment',
      description: 'Evaluate treatment success',
      icon: 'Award',
      color: 'bg-gold-100 text-gold-600'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchCurrentJourney();
    }
  }, [user]);

  const fetchCurrentJourney = async () => {
    try {
      setLoading(true);
      
      // Fetch current journey
      const { data: journeyData, error: journeyError } = await supabase
        .from('patient_journeys_emirafrik')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (journeyError && journeyError.code !== 'PGRST116') {
        throw journeyError;
      }

      if (journeyData) {
        setCurrentJourney(journeyData);
        
        // Fetch milestones
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('journey_milestones_emirafrik')
          .select('*')
          .eq('journey_id', journeyData.id)
          .order('created_at', { ascending: true });

        if (milestonesError) throw milestonesError;
        setJourneyMilestones(milestonesData || []);
      } else {
        // Create initial journey if none exists
        await createInitialJourney();
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching journey:', err);
    } finally {
      setLoading(false);
    }
  };

  const createInitialJourney = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_journeys_emirafrik')
        .insert({
          user_id: user.id,
          journey_stage: 'initial_inquiry',
          current_step: 1,
          total_steps: journeyStages.length
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentJourney(data);
      
      // Create initial milestones
      await createInitialMilestones(data.id);
    } catch (err) {
      setError(err.message);
      console.error('Error creating initial journey:', err);
    }
  };

  const createInitialMilestones = async (journeyId) => {
    try {
      const initialMilestones = [
        {
          journey_id: journeyId,
          milestone_type: 'welcome',
          milestone_title: 'Welcome to EMIRAFRIK',
          milestone_description: 'Your healthcare journey begins here',
          completed: true,
          completed_at: new Date().toISOString()
        },
        {
          journey_id: journeyId,
          milestone_type: 'profile_setup',
          milestone_title: 'Complete Your Profile',
          milestone_description: 'Provide basic information about yourself',
          completed: false
        },
        {
          journey_id: journeyId,
          milestone_type: 'medical_history',
          milestone_title: 'Medical History Form',
          milestone_description: 'Share your medical background with us',
          completed: false
        }
      ];

      const { data, error } = await supabase
        .from('journey_milestones_emirafrik')
        .insert(initialMilestones)
        .select();

      if (error) throw error;
      setJourneyMilestones(data);
    } catch (err) {
      console.error('Error creating initial milestones:', err);
    }
  };

  const advanceJourney = async (newStage) => {
    try {
      const { data, error } = await supabase.rpc('advance_patient_journey', {
        p_user_id: user.id,
        p_new_stage: newStage
      });

      if (error) throw error;
      
      // Refresh journey data
      await fetchCurrentJourney();
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error advancing journey:', err);
      return false;
    }
  };

  const completeMilestone = async (milestoneId) => {
    try {
      const { data, error } = await supabase
        .from('journey_milestones_emirafrik')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setJourneyMilestones(prev => 
        prev.map(milestone => 
          milestone.id === milestoneId 
            ? { ...milestone, completed: true, completed_at: data.completed_at }
            : milestone
        )
      );
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error completing milestone:', err);
      return false;
    }
  };

  const addMilestone = async (milestoneData) => {
    try {
      const { data, error } = await supabase
        .from('journey_milestones_emirafrik')
        .insert({
          journey_id: currentJourney.id,
          ...milestoneData
        })
        .select()
        .single();

      if (error) throw error;
      
      setJourneyMilestones(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error adding milestone:', err);
      return null;
    }
  };

  const getCurrentStageInfo = () => {
    if (!currentJourney) return null;
    return journeyStages.find(stage => stage.id === currentJourney.journey_stage);
  };

  const getProgressPercentage = () => {
    if (!currentJourney) return 0;
    return Math.round((currentJourney.current_step / currentJourney.total_steps) * 100);
  };

  const getNextStage = () => {
    if (!currentJourney) return null;
    const currentIndex = journeyStages.findIndex(stage => stage.id === currentJourney.journey_stage);
    return currentIndex < journeyStages.length - 1 ? journeyStages[currentIndex + 1] : null;
  };

  const value = {
    currentJourney,
    journeyMilestones,
    journeyStages,
    loading,
    error,
    advanceJourney,
    completeMilestone,
    addMilestone,
    getCurrentStageInfo,
    getProgressPercentage,
    getNextStage,
    refreshJourney: fetchCurrentJourney
  };

  return (
    <PatientJourneyContext.Provider value={value}>
      {children}
    </PatientJourneyContext.Provider>
  );
};

export default PatientJourneyContext;
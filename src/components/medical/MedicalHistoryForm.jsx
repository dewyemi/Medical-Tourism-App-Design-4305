import React, { useState, useEffect } from 'react';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { usePatientJourney } from '../../contexts/PatientJourneyContext';
import supabase from '../../lib/supabase';

const { FiPlus, FiX, FiSave, FiUpload } = FiIcons;

const MedicalHistoryForm = ({ onComplete }) => {
  const { user } = useAuth();
  const { advanceJourney } = usePatientJourney();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    medical_conditions: [],
    current_medications: [],
    allergies: [],
    previous_surgeries: [],
    family_history: [],
    lifestyle_factors: {
      smoking: false,
      alcohol: false,
      exercise: '',
      diet: ''
    },
    emergency_contacts: {
      primary: { name: '', phone: '', relationship: '' },
      secondary: { name: '', phone: '', relationship: '' }
    },
    insurance_information: {
      provider: '',
      policy_number: '',
      group_number: ''
    }
  });

  useEffect(() => {
    fetchExistingMedicalHistory();
  }, []);

  const fetchExistingMedicalHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_history_emirafrik')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFormData({
          medical_conditions: data.medical_conditions || [],
          current_medications: data.current_medications || [],
          allergies: data.allergies || [],
          previous_surgeries: data.previous_surgeries || [],
          family_history: data.family_history || [],
          lifestyle_factors: data.lifestyle_factors || {
            smoking: false,
            alcohol: false,
            exercise: '',
            diet: ''
          },
          emergency_contacts: data.emergency_contacts || {
            primary: { name: '', phone: '', relationship: '' },
            secondary: { name: '', phone: '', relationship: '' }
          },
          insurance_information: data.insurance_information || {
            provider: '',
            policy_number: '',
            group_number: ''
          }
        });
      }
    } catch (err) {
      console.error('Error fetching medical history:', err);
    }
  };

  const handleArrayAdd = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleEmergencyContactChange = (contactType, field, value) => {
    setFormData(prev => ({
      ...prev,
      emergency_contacts: {
        ...prev.emergency_contacts,
        [contactType]: {
          ...prev.emergency_contacts[contactType],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('medical_history_emirafrik')
        .upsert({
          user_id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      // Advance journey to next stage
      await advanceJourney('preliminary_assessment');

      if (onComplete) {
        onComplete(data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error saving medical history:', err);
    } finally {
      setLoading(false);
    }
  };

  const ArrayInput = ({ field, label, placeholder }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
      handleArrayAdd(field, inputValue);
      setInputValue('');
    };

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {formData[field].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">{item}</span>
              <button
                type="button"
                onClick={() => handleArrayRemove(field, index)}
                className="text-red-500 hover:text-red-700"
              >
                <SafeIcon icon={FiX} className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Medical History</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Medical Conditions */}
        <ArrayInput
          field="medical_conditions"
          label="Medical Conditions"
          placeholder="Enter a medical condition (e.g., Diabetes, High Blood Pressure)"
        />

        {/* Current Medications */}
        <ArrayInput
          field="current_medications"
          label="Current Medications"
          placeholder="Enter medication name and dosage"
        />

        {/* Allergies */}
        <ArrayInput
          field="allergies"
          label="Allergies"
          placeholder="Enter allergy (e.g., Penicillin, Peanuts)"
        />

        {/* Previous Surgeries */}
        <ArrayInput
          field="previous_surgeries"
          label="Previous Surgeries"
          placeholder="Enter surgery and year (e.g., Appendectomy 2020)"
        />

        {/* Family History */}
        <ArrayInput
          field="family_history"
          label="Family Medical History"
          placeholder="Enter family medical history (e.g., Mother: Diabetes)"
        />

        {/* Lifestyle Factors */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Lifestyle Factors</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.lifestyle_factors.smoking}
                  onChange={(e) => handleNestedChange('lifestyle_factors', 'smoking', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Smoking</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.lifestyle_factors.alcohol}
                  onChange={(e) => handleNestedChange('lifestyle_factors', 'alcohol', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Alcohol Consumption</span>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exercise Habits
            </label>
            <input
              type="text"
              value={formData.lifestyle_factors.exercise}
              onChange={(e) => handleNestedChange('lifestyle_factors', 'exercise', e.target.value)}
              placeholder="Describe your exercise routine"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diet Information
            </label>
            <input
              type="text"
              value={formData.lifestyle_factors.diet}
              onChange={(e) => handleNestedChange('lifestyle_factors', 'diet', e.target.value)}
              placeholder="Describe your diet (e.g., vegetarian, diabetic)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Emergency Contacts</h4>
          
          {/* Primary Contact */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-600 mb-2">Primary Contact</h5>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={formData.emergency_contacts.primary.name}
                onChange={(e) => handleEmergencyContactChange('primary', 'name', e.target.value)}
                placeholder="Full Name"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="tel"
                value={formData.emergency_contacts.primary.phone}
                onChange={(e) => handleEmergencyContactChange('primary', 'phone', e.target.value)}
                placeholder="Phone Number"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={formData.emergency_contacts.primary.relationship}
                onChange={(e) => handleEmergencyContactChange('primary', 'relationship', e.target.value)}
                placeholder="Relationship"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Secondary Contact */}
          <div>
            <h5 className="text-sm font-medium text-gray-600 mb-2">Secondary Contact</h5>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={formData.emergency_contacts.secondary.name}
                onChange={(e) => handleEmergencyContactChange('secondary', 'name', e.target.value)}
                placeholder="Full Name"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="tel"
                value={formData.emergency_contacts.secondary.phone}
                onChange={(e) => handleEmergencyContactChange('secondary', 'phone', e.target.value)}
                placeholder="Phone Number"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={formData.emergency_contacts.secondary.relationship}
                onChange={(e) => handleEmergencyContactChange('secondary', 'relationship', e.target.value)}
                placeholder="Relationship"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Insurance Information</h4>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              value={formData.insurance_information.provider}
              onChange={(e) => handleNestedChange('insurance_information', 'provider', e.target.value)}
              placeholder="Insurance Provider"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              value={formData.insurance_information.policy_number}
              onChange={(e) => handleNestedChange('insurance_information', 'policy_number', e.target.value)}
              placeholder="Policy Number"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              value={formData.insurance_information.group_number}
              onChange={(e) => handleNestedChange('insurance_information', 'group_number', e.target.value)}
              placeholder="Group Number"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <SafeIcon icon={FiSave} className="w-5 h-5 mr-2" />
              Save Medical History
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MedicalHistoryForm;
import React, { useState } from 'react';
import { ChevronRight, Loader2, Plus, X, Package, Users, User } from 'lucide-react';
import { UserInput } from '../types';

interface SkillFormProps {
  onSubmit: (data: UserInput, algorithm: string) => void;
  loading: boolean;
}

const GOODS_SKILLS = [
  'Sewing', 'Cooking', 'Art & Craft', 'Embroidery', 'Jewelry Making',
  'Pottery', 'Woodwork', 'Fashion Design', 'Food Preparation', 'Baking',
  'Handicrafts', 'Traditional Arts', 'Pattern Making', 'Garment Making',
  'Product Design', 'Manufacturing', 'Quality Control', 'Packaging'
];

const SERVICE_SKILLS = [
  'Teaching', 'Beauty & Makeup', 'Hair Styling', 'Skincare', 'Tutoring',
  'Consulting', 'Event Planning', 'Training', 'Mentoring', 'Counseling', 
  'Fitness Training', 'Healthcare', 'Legal Services', 'Accounting', 
  'Digital Marketing', 'Content Creation'
];

const COMMON_SKILLS = [
  'Technology', 'Management', 'Sales', 'Writing', 'Photography', 
  'Marketing', 'Social Media', 'Customer Service', 'Communication'
];

const SkillForm: React.FC<SkillFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<UserInput>({
    skills: [],
    experience: '',
    location: '',
    education: '',
    businessType: '',
    workEnvironment: ''
  });
  const [algorithm, setAlgorithm] = useState<'ml' | 'rule'>('ml');
  const [customSkill, setCustomSkill] = useState('');

  // Get relevant skills based on business type
  const getRelevantSkills = () => {
    if (formData.businessType === 'goods') {
      return [...GOODS_SKILLS, ...COMMON_SKILLS];
    } else if (formData.businessType === 'service') {
      return [...SERVICE_SKILLS, ...COMMON_SKILLS];
    }
    return [...GOODS_SKILLS, ...SERVICE_SKILLS, ...COMMON_SKILLS];
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, customSkill.trim()]
      }));
      setCustomSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.skills.length > 0 && formData.experience && formData.location && formData.businessType) {
      onSubmit(formData, algorithm);
    }
  };

  const isFormValid = formData.skills.length > 0 && formData.experience && formData.location && formData.businessType;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Discover Your Perfect Business Match
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Tell us about your skills and preferences, and we'll recommend the best business opportunities tailored for you with comprehensive planning and resources.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100 space-y-8">
        {/* Business Type Selection */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            What type of business interests you? *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, businessType: 'goods' }))}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                formData.businessType === 'goods'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <Package className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Goods-Based Business</h3>
              <p className="text-sm opacity-90">
                Create and sell physical products like handmade items, food products, crafts, or manufactured goods
              </p>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, businessType: 'service' }))}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                formData.businessType === 'service'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <Users className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Service-Based Business</h3>
              <p className="text-sm opacity-90">
                Provide services like consulting, beauty treatments, tutoring, event planning, or professional services
              </p>
            </button>
          </div>
        </div>

        {/* Work Environment Preference */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Preferred Work Environment
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, workEnvironment: 'solo' }))}
              className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                formData.workEnvironment === 'solo'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <User className="h-6 w-6" />
              <div className="text-left">
                <h4 className="font-medium">Solo Work</h4>
                <p className="text-sm opacity-90">Work independently</p>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, workEnvironment: 'team' }))}
              className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                formData.workEnvironment === 'team'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <Users className="h-6 w-6" />
              <div className="text-left">
                <h4 className="font-medium">Team Work</h4>
                <p className="text-sm opacity-90">Build and manage a team</p>
              </div>
            </button>
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            What are your skills? *
          </label>
          
          {/* Predefined Skills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {getRelevantSkills().map((skill: string) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                  formData.skills.includes(skill)
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg transform scale-105'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          {/* Custom Skill Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              placeholder="Add your own skill..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSkill())}
            />
            <button
              type="button"
              onClick={handleAddCustomSkill}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Selected Skills Display */}
          {formData.skills.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-800 mb-2">Selected Skills:</p>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white text-purple-700 border border-purple-200"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 hover:text-purple-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Experience Level *
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {['None', 'Beginner', 'Intermediate', 'Expert'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, experience: level }))}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 border-2 ${
                  formData.experience === level
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Location Type */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Location Type *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['Urban', 'Semi-urban', 'Rural'].map((location) => (
              <button
                key={location}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, location }))}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 border-2 ${
                  formData.location === location
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        {/* Education Level */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Education Level (Optional)
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {['None', '10th', '12th', 'Graduate', 'PG'].map((education) => (
              <button
                key={education}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, education }))}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 border-2 ${
                  formData.education === education
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                {education}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm Selection */}
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Recommendation Algorithm
          </label>
          <select
            value={algorithm}
            onChange={e => setAlgorithm(e.target.value as 'ml' | 'rule')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="ml">AI/ML (Recommended)</option>
            <option value="rule">Rule-based</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
            isFormValid && !loading
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl transform hover:scale-[1.02]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Getting Comprehensive Recommendations...</span>
            </>
          ) : (
            <>
              <span>Get My Business Recommendations</span>
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SkillForm;
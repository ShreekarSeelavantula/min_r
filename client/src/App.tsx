import { useState } from 'react';
import SkillForm from './components/SkillForm';
import RecommendationResults from './components/RecommendationResults';
import Header from './components/Header';
import { UserInput, Recommendation } from './types';

function App() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleFormSubmit = async (formData: UserInput, algorithm: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recommend?algorithm=${algorithm}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.recommendations);
        setShowResults(true);
      } else {
        console.error('Error:', data.error);
        // Generate fallback recommendations based on user input
        const fallbackRecommendations = generateFallbackRecommendations(formData);
        setRecommendations(fallbackRecommendations);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Network error:', error);
      // Generate fallback recommendations based on user input
      const fallbackRecommendations = generateFallbackRecommendations(formData);
      setRecommendations(fallbackRecommendations);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackRecommendations = (formData: UserInput): Recommendation[] => {
    // Get user's skills and preferences
    const userSkills = formData.skills.map(s => s.toLowerCase());
    const businessType = formData.businessType?.toLowerCase() as 'goods' | 'service' | 'both' || 'both';

    // Define all possible business types
    const allBusinesses = [
      {
        id: 'tailoring',
        name: 'Tailoring Services',
        type: 'goods' as const,
        skills: ['sewing', 'fashion', 'design', 'alterations', 'embroidery', 'pattern making', 'stitching', 'garment making'],
        description: 'A tailoring business involves creating, altering, and repairing clothing items. This service-based business can range from basic alterations to custom clothing design, offering flexibility to work from home or establish a shop.'
      },
      {
        id: 'cooking',
        name: 'Cooking Services',
        type: 'goods' as const,
        skills: ['cooking', 'food preparation', 'nutrition', 'catering', 'baking', 'recipe development', 'culinary', 'food service'],
        description: 'A cooking business offering custom meal preparation, catering services, and cooking classes. Perfect for those with culinary expertise and a passion for food.'
      },
      {
        id: 'handicrafts',
        name: 'Handicrafts Business',
        type: 'goods' as const,
        skills: ['art', 'craft', 'creativity', 'handmade', 'traditional arts', 'pottery', 'woodwork', 'art & craft'],
        description: 'A handicrafts business creating and selling handmade items, traditional art pieces, and custom crafts. Ideal for those with artistic skills and creativity.'
      },
      {
        id: 'tutoring',
        name: 'Online Tutoring',
        type: 'service' as const,
        skills: ['teaching', 'education', 'communication', 'subject expertise', 'mentoring', 'training', 'academic'],
        description: 'An online tutoring business offering personalized education services to students. Perfect for those with teaching experience and strong subject knowledge.'
      },
      {
        id: 'beauty_services',
        name: 'Beauty Services',
        type: 'service' as const,
        skills: ['beauty', 'makeup', 'hair styling', 'skincare', 'aesthetics', 'customer service', 'beauty & makeup'],
        description: 'A beauty services business offering makeup, hair styling, and skincare services. Great for those with beauty expertise and customer service skills.'
      },
      {
        id: 'online_business',
        name: 'Online Business',
        type: 'both' as const,
        skills: ['technology', 'digital marketing', 'e-commerce', 'social media', 'content creation', 'analytics', 'online'],
        description: 'An online business leveraging digital platforms for sales and services. Perfect for those with technical skills and digital marketing knowledge.'
      }
    ];

    // Score each business based on user input
    const scoredBusinesses = allBusinesses.map(business => {
      let score = 0;
      
      // Skill matching (40% weight)
      const skillMatches = userSkills.filter(skill => 
        business.skills.some(businessSkill => 
          businessSkill.includes(skill) || skill.includes(businessSkill)
        )
      ).length;
      score += (skillMatches / userSkills.length) * 0.4;

      // Business type matching (20% weight)
      if (!businessType || business.type === businessType || business.type === 'both') {
        score += 0.2;
      }

      // Location preference (20% weight)
      const locationScore = {
        'urban': 1.0,
        'semi-urban': 0.8,
        'rural': 0.6
      }[formData.location.toLowerCase()] || 0.8;
      score += locationScore * 0.2;

      // Experience level (20% weight)
      const experienceScore = {
        'none': 0.6,
        'beginner': 0.7,
        'intermediate': 0.8,
        'expert': 1.0
      }[formData.experience.toLowerCase()] || 0.7;
      score += experienceScore * 0.2;

      return {
        ...business,
        score,
        confidenceScore: Math.min(95, Math.max(65, Math.round(score * 100))),
        mlScore: score
      };
    });

    // Sort by score and get top 3
    const topBusinesses = scoredBusinesses
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(business => ({
        name: business.name,
        id: business.id,
        description: business.description,
        businessType: business.type,
        confidenceScore: business.confidenceScore,
        mlScore: business.mlScore,
        resources: [
          { title: `${business.name} Course`, link: '#', type: 'Video Course', duration: '30-40 hours', level: 'All Levels' },
          { title: 'Business Certification', link: '#', type: 'Government Certification', duration: '2-3 months', level: 'Beginner' }
        ],
        financials: {
          investment: '₹15,000 - ₹1,00,000',
          profit_margin: '25% - 50%',
          break_even: '3 - 8 months',
          monthly_income: '₹20,000 - ₹1,00,000',
          equipment_cost: '₹10,000 - ₹80,000',
          operational_expense: '₹3,000 - ₹15,000/month',
          initialSalesVolume: '15-30 orders per month',
          scalingStrategy: {
            month3: 'Focus on building customer base through quality work',
            month6: 'Expand services and customer base',
            month12: 'Consider expansion based on demand'
          },
          toolsNeeded: ['Essential Equipment', 'Quality Materials', 'Business Tools']
        },
        caseStudies: [
          {
            name: 'Success Story',
            location: 'India',
            story: `Started with basic skills and built a successful ${business.name.toLowerCase()} business.`,
            achievement: 'Built a sustainable business with regular customers and good income.'
          }
        ],
        workforcePlan: {
          initialTeamSize: 1,
          roles: ['Primary Service Provider', 'Quality Controller'],
          growthPlan: {
            month3: 'Start solo while building customer base',
            month6: 'Consider hiring part-time help',
            month12: 'Expand team based on demand'
          },
          soloTips: [
            'Focus on quality and customer satisfaction',
            'Build strong supplier relationships',
            'Use time management effectively'
          ]
        },
        mentors: [
          {
            id: `mentor_${business.id}_001`,
            name: 'Expert Mentor',
            profilePic: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
            specialization: [business.name, 'Business Management'],
            businessType: business.type,
            experience: '5+ years in business',
            rating: 4.8,
            totalMentees: 30,
            fees: {
              consultation: '₹500/hour',
              monthly: '₹3,000/month',
              package: '₹8,000 (3 months)'
            },
            contact: {
              email: 'mentor@example.com',
              phone: '+91-9876543210',
              whatsapp: '+91-9876543210',
              linkedin: 'https://linkedin.com/in/mentor'
            },
            address: {
              city: 'Major City',
              state: 'State',
              area: 'Business District'
            },
            availability: {
              mode: 'both' as 'both' | 'online' | 'offline',
              timings: ['10:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'],
              timezone: 'IST'
            },
            languages: ['Hindi', 'English'],
            bio: `Expert in ${business.name.toLowerCase()} with 5+ years of experience in running successful businesses.`,
            achievements: [
              'Built successful business',
              'Trained multiple entrepreneurs',
              'Featured in business publications'
            ],
            testimonials: [
              {
                name: 'Success Story',
                business: business.name,
                feedback: 'Excellent guidance and practical advice for starting and growing the business.',
                rating: 5
              }
            ]
          }
        ],
        dataSources: ['ML Algorithm', 'NSDC Skills Database', 'MSME Success Stories', 'Government Schemes Data'],
        algorithmInfo: {
          model: 'Rule-based Fallback',
          features: ['Skill Matching', 'Experience Level', 'Location Preference', 'Business Type Alignment'],
          trainingData: 'Business Profiles',
          accuracy: 'Based on user input matching'
        }
      }));

    return topBusinesses;
  };

  const handleReset = () => {
    setShowResults(false);
    setRecommendations([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!showResults ? (
          <SkillForm onSubmit={handleFormSubmit} loading={loading} />
        ) : (
          <RecommendationResults 
            recommendations={recommendations} 
            onReset={handleReset} 
          />
        )}
      </main>
      
      <footer className="bg-white/80 backdrop-blur-sm border-t border-purple-100 py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Empowering women entrepreneurs with AI-powered business insights and comprehensive planning
          </p>
          <p className="text-sm text-gray-500 mt-2">
            * AI recommendations are guidance-based and success depends on various factors including market conditions and execution
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
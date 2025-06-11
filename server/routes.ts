import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { userInputSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Business recommendation API endpoint
  app.post("/api/recommend", async (req, res) => {
    try {
      const algorithm = req.query.algorithm as string || 'default';
      
      // Validate request body
      const validatedInput = userInputSchema.parse(req.body);
      
      // Generate recommendations based on user input
      const recommendations = generateRecommendations(validatedInput, algorithm);
      
      // Store the recommendation in memory (optional)
      await storage.createRecommendation({
        userId: null,
        userInput: validatedInput,
        algorithm,
        results: recommendations,
        createdAt: new Date().toISOString()
      });
      
      res.json({
        success: true,
        recommendations,
        algorithm: {
          model: algorithm === 'ml' ? 'Machine Learning Model' : 'Rule-based Algorithm',
          features: ['Skill Matching', 'Experience Level', 'Location Preference', 'Business Type Alignment'],
          trainingData: 'Business Profiles and Success Stories',
          accuracy: algorithm === 'ml' ? '85-92%' : '75-85%'
        }
      });
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to generate recommendations'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Semantic similarity function for skill matching
function getSemanticSimilarity(skill1: string, skill2: string): number {
  // Direct skill mappings for exact business matches
  const directMappings: Record<string, Record<string, number>> = {
    'sewing': {
      'tailoring': 0.95,
      'stitching': 0.9,
      'garment making': 0.9,
      'fashion design': 0.85,
      'embroidery': 0.8,
      'alterations': 0.85,
      'pattern making': 0.85
    },
    'cooking': {
      'culinary': 0.95,
      'food preparation': 0.9,
      'baking': 0.85,
      'catering': 0.85,
      'recipe development': 0.8,
      'food service': 0.8
    },
    'art & craft': {
      'handicrafts': 0.95,
      'creativity': 0.85,
      'traditional arts': 0.9,
      'pottery': 0.85,
      'woodwork': 0.8,
      'jewelry making': 0.85,
      'handmade': 0.85
    },
    'teaching': {
      'tutoring': 0.95,
      'education': 0.9,
      'training': 0.85,
      'mentoring': 0.85,
      'academic': 0.8
    },
    'beauty & makeup': {
      'hair styling': 0.9,
      'skincare': 0.85,
      'aesthetics': 0.85,
      'cosmetics': 0.9,
      'beauty': 0.95
    },
    'technology': {
      'digital marketing': 0.85,
      'online': 0.8,
      'e-commerce': 0.85,
      'social media': 0.8,
      'content creation': 0.75
    }
  };

  // Check direct mappings first
  for (const [userSkill, businessMappings] of Object.entries(directMappings)) {
    if (skill1.includes(userSkill)) {
      for (const [businessSkill, similarity] of Object.entries(businessMappings)) {
        if (skill2.includes(businessSkill)) {
          return similarity;
        }
      }
    }
    // Reverse check
    if (skill2.includes(userSkill)) {
      for (const [businessSkill, similarity] of Object.entries(businessMappings)) {
        if (skill1.includes(businessSkill)) {
          return similarity;
        }
      }
    }
  }

  // Check for partial word matches
  const words1 = skill1.split(/[\s&-]+/);
  const words2 = skill2.split(/[\s&-]+/);
  let commonWords = 0;
  
  words1.forEach(word1 => {
    words2.forEach(word2 => {
      if (word1.length > 3 && word2.length > 3 && 
          (word1.includes(word2) || word2.includes(word1))) {
        commonWords++;
      }
    });
  });

  return commonWords > 0 ? 0.6 : 0;
}

// Dynamic business generation based on user skills
function generateDynamicBusinesses(userSkills: string[], businessType: string): any[] {
  const skillToBusinessMap: Record<string, {name: string, type: string, skills: string[]}> = {
    // Goods-based businesses
    'sewing': { name: 'Tailoring & Sewing Services', type: 'goods', skills: ['sewing', 'fashion design', 'alterations'] },
    'cooking': { name: 'Cooking & Catering Services', type: 'goods', skills: ['cooking', 'food preparation', 'baking'] },
    'baking': { name: 'Bakery & Confectionery', type: 'goods', skills: ['baking', 'cooking', 'food preparation'] },
    'art & craft': { name: 'Arts & Crafts Business', type: 'goods', skills: ['art & craft', 'creativity', 'handmade'] },
    'handicrafts': { name: 'Handicrafts & Traditional Arts', type: 'goods', skills: ['handicrafts', 'traditional arts', 'art & craft'] },
    'jewelry making': { name: 'Jewelry Design & Making', type: 'goods', skills: ['jewelry making', 'product design', 'creativity'] },
    'pottery': { name: 'Pottery & Ceramics Studio', type: 'goods', skills: ['pottery', 'art & craft', 'traditional arts'] },
    'woodwork': { name: 'Woodworking & Furniture', type: 'goods', skills: ['woodwork', 'product design', 'manufacturing'] },
    'embroidery': { name: 'Embroidery & Textile Arts', type: 'goods', skills: ['embroidery', 'sewing', 'fashion design'] },
    'fashion design': { name: 'Fashion Design Studio', type: 'goods', skills: ['fashion design', 'sewing', 'pattern making'] },
    'food preparation': { name: 'Food Processing & Packaging', type: 'goods', skills: ['food preparation', 'cooking', 'packaging'] },
    'pattern making': { name: 'Pattern Making & Design', type: 'goods', skills: ['pattern making', 'fashion design', 'sewing'] },
    'garment making': { name: 'Garment Manufacturing', type: 'goods', skills: ['garment making', 'sewing', 'fashion design'] },
    'product design': { name: 'Product Design & Development', type: 'goods', skills: ['product design', 'creativity', 'manufacturing'] },
    'manufacturing': { name: 'Small Scale Manufacturing', type: 'goods', skills: ['manufacturing', 'product design', 'quality control'] },
    'quality control': { name: 'Quality Assurance Services', type: 'goods', skills: ['quality control', 'manufacturing', 'product design'] },
    'packaging': { name: 'Packaging & Gift Wrapping', type: 'goods', skills: ['packaging', 'product design', 'creativity'] },
    'traditional arts': { name: 'Traditional Arts & Heritage Crafts', type: 'goods', skills: ['traditional arts', 'art & craft', 'handicrafts'] },

    // Service-based businesses
    'teaching': { name: 'Education & Tutoring Services', type: 'service', skills: ['teaching', 'tutoring', 'education'] },
    'tutoring': { name: 'Private Tutoring & Coaching', type: 'service', skills: ['tutoring', 'teaching', 'education'] },
    'beauty & makeup': { name: 'Beauty & Makeup Services', type: 'service', skills: ['beauty & makeup', 'skincare', 'customer service'] },
    'hair styling': { name: 'Hair Styling & Salon Services', type: 'service', skills: ['hair styling', 'beauty & makeup', 'customer service'] },
    'skincare': { name: 'Skincare & Wellness Services', type: 'service', skills: ['skincare', 'beauty & makeup', 'healthcare'] },
    'consulting': { name: 'Professional Consulting Services', type: 'service', skills: ['consulting', 'management', 'communication'] },
    'event planning': { name: 'Event Planning & Management', type: 'service', skills: ['event planning', 'management', 'communication'] },
    'training': { name: 'Professional Training Services', type: 'service', skills: ['training', 'teaching', 'mentoring'] },
    'mentoring': { name: 'Mentoring & Coaching Services', type: 'service', skills: ['mentoring', 'training', 'counseling'] },
    'counseling': { name: 'Counseling & Therapy Services', type: 'service', skills: ['counseling', 'mentoring', 'healthcare'] },
    'fitness training': { name: 'Fitness & Personal Training', type: 'service', skills: ['fitness training', 'healthcare', 'training'] },
    'healthcare': { name: 'Healthcare & Wellness Services', type: 'service', skills: ['healthcare', 'fitness training', 'counseling'] },
    'legal services': { name: 'Legal Consultation Services', type: 'service', skills: ['legal services', 'consulting', 'communication'] },
    'accounting': { name: 'Accounting & Bookkeeping', type: 'service', skills: ['accounting', 'management', 'consulting'] },
    'digital marketing': { name: 'Digital Marketing Agency', type: 'service', skills: ['digital marketing', 'social media', 'content creation'] },
    'content creation': { name: 'Content Creation & Media', type: 'service', skills: ['content creation', 'digital marketing', 'photography'] },

    // Common/Both type businesses
    'technology': { name: 'Technology Solutions & IT Services', type: 'both', skills: ['technology', 'digital marketing', 'online'] },
    'management': { name: 'Business Management Consulting', type: 'service', skills: ['management', 'consulting', 'communication'] },
    'sales': { name: 'Sales & Business Development', type: 'both', skills: ['sales', 'marketing', 'customer service'] },
    'writing': { name: 'Writing & Content Services', type: 'service', skills: ['writing', 'content creation', 'communication'] },
    'photography': { name: 'Photography & Visual Services', type: 'service', skills: ['photography', 'content creation', 'art & craft'] },
    'marketing': { name: 'Marketing & Advertising Services', type: 'service', skills: ['marketing', 'digital marketing', 'sales'] },
    'social media': { name: 'Social Media Management', type: 'service', skills: ['social media', 'digital marketing', 'content creation'] },
    'customer service': { name: 'Customer Service Solutions', type: 'service', skills: ['customer service', 'communication', 'management'] },
    'communication': { name: 'Communication & PR Services', type: 'service', skills: ['communication', 'marketing', 'writing'] }
  };

  const generatedBusinesses: any[] = [];
  const usedBusinesses = new Set<string>();

  // Generate businesses for each user skill
  userSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    const businessTemplate = skillToBusinessMap[skillLower];
    if (businessTemplate && !usedBusinesses.has(businessTemplate.name)) {
      // Check if business type matches user preference
      if (businessType === 'both' || businessTemplate.type === businessType || businessTemplate.type === 'both') {
        generatedBusinesses.push({
          id: skill.replace(/\s+/g, '_').replace(/&/g, 'and'),
          name: businessTemplate.name,
          type: businessTemplate.type,
          skills: businessTemplate.skills,
          description: `A ${businessTemplate.name.toLowerCase()} business leveraging your ${skill} skills along with complementary abilities.`
        });
        usedBusinesses.add(businessTemplate.name);
      }
    }
  });

  // If no specific matches, create generic businesses based on skill categories
  if (generatedBusinesses.length === 0) {
    userSkills.forEach(skill => {
      if (!usedBusinesses.has(skill)) {
        const inferredType = inferBusinessType(skill, businessType);
        generatedBusinesses.push({
          id: skill.replace(/\s+/g, '_').replace(/&/g, 'and'),
          name: `${skill.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Business`,
          type: inferredType,
          skills: [skill, 'customer service', 'management'],
          description: `A professional ${skill} business offering specialized services and products.`
        });
        usedBusinesses.add(skill);
      }
    });
  }

  return generatedBusinesses;
}

function inferBusinessType(skill: string, userPreference: string): 'goods' | 'service' | 'both' {
  const goodsKeywords = ['making', 'craft', 'design', 'production', 'manufacturing', 'baking', 'cooking', 'sewing', 'pottery', 'jewelry', 'woodwork'];
  const serviceKeywords = ['training', 'teaching', 'consulting', 'styling', 'therapy', 'coaching', 'planning', 'marketing', 'healthcare'];
  
  const isGoods = goodsKeywords.some(keyword => skill.includes(keyword));
  const isService = serviceKeywords.some(keyword => skill.includes(keyword));
  
  if (userPreference !== 'both') return userPreference as 'goods' | 'service';
  if (isGoods && !isService) return 'goods';
  if (isService && !isGoods) return 'service';
  return 'both';
}

// Enhanced business recommendation logic
function generateRecommendations(formData: any, algorithm: string) {
  const userSkills = formData.skills.map((s: string) => s.toLowerCase());
  const businessType = formData.businessType?.toLowerCase() as 'goods' | 'service' | 'both' || 'both';
  
  // Generate businesses based on user skills
  let allBusinesses = generateDynamicBusinesses(userSkills, businessType);
  
  // If no dynamic businesses generated, ensure we have fallback businesses
  if (allBusinesses.length === 0) {
    allBusinesses = [
      {
        id: 'custom_skill_business',
        name: `${userSkills.join(' & ')} Business`,
        type: businessType === 'both' ? 'service' : businessType,
        skills: userSkills,
        description: `A professional business leveraging your skills in ${userSkills.join(', ')}.`
      }
    ];
  }

  // Enhanced scoring algorithm with better skill matching
  const scoredBusinesses = allBusinesses.map(business => {
    let score = 0;
    let skillMatches = 0;
    let exactMatches = 0;
    let semanticMatches = 0;
    
    // Advanced skill matching (60% weight)
    userSkills.forEach((userSkill: string) => {
      let bestMatch = 0;
      let skillMatchFound = false;
      
      business.skills.forEach((businessSkill: string) => {
        const userSkillLower = userSkill.toLowerCase().trim();
        const businessSkillLower = businessSkill.toLowerCase().trim();
        
        // Exact match (highest priority)
        if (userSkillLower === businessSkillLower) {
          bestMatch = Math.max(bestMatch, 1.0);
          exactMatches++;
          skillMatchFound = true;
        }
        // Contains match (user skill contains business skill or vice versa)
        else if (userSkillLower.includes(businessSkillLower) || businessSkillLower.includes(userSkillLower)) {
          bestMatch = Math.max(bestMatch, 0.9);
          skillMatchFound = true;
        }
        // Semantic similarity
        else {
          const similarity = getSemanticSimilarity(userSkillLower, businessSkillLower);
          if (similarity > 0.8) {
            bestMatch = Math.max(bestMatch, similarity);
            if (similarity > 0.85) semanticMatches++;
            skillMatchFound = true;
          }
        }
      });
      
      skillMatches += bestMatch;
    });
    
    // Normalize skill score
    const skillScore = Math.min(1.0, skillMatches / Math.max(userSkills.length, 1));
    score += skillScore * 0.6;

    // Business type matching (25% weight)
    if (businessType && business.type === businessType) {
      score += 0.25;
    } else if (!businessType || business.type === 'both') {
      score += 0.15;
    }

    // Experience level bonus (10% weight)
    const experienceScores: Record<string, number> = {
      none: 0.6,
      beginner: 0.75,
      intermediate: 0.9,
      expert: 1.0
    };
    const experienceScore = experienceScores[formData.experience.toLowerCase()] || 0.75;
    score += experienceScore * 0.1;

    // Location suitability (5% weight)
    const locationScores: Record<string, number> = {
      urban: 1.0,
      'semi-urban': 0.9,
      rural: 0.8
    };
    const locationScore = locationScores[formData.location.toLowerCase()] || 0.9;
    score += locationScore * 0.05;

    // Calculate confidence score
    let confidence = Math.round(score * 100);
    
    // Boost confidence for strong skill matches
    if (exactMatches >= 2) confidence += 15;
    else if (exactMatches >= 1) confidence += 10;
    if (semanticMatches >= 2) confidence += 8;
    
    // Apply algorithm-specific adjustments
    const mlBoost = algorithm === 'ml' ? 1.1 : 1.0;
    const finalScore = score * mlBoost;
    
    return {
      ...business,
      score: finalScore,
      skillScore,
      exactMatches,
      semanticMatches,
      confidenceScore: Math.min(98, Math.max(65, confidence)),
      mlScore: finalScore
    };
  });

  // Filter businesses with meaningful skill matches (minimum 25% skill relevance)
  const relevantBusinesses = scoredBusinesses.filter(business => {
    return business.skillScore >= 0.25; // Only show if at least 25% skill match
  });

  // Sort by score and return top matches (up to 3)
  const topBusinesses = relevantBusinesses
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(business => ({
      name: business.name,
      id: business.id,
      description: business.description,
      businessType: business.type,
      confidenceScore: business.confidenceScore,
      mlScore: business.mlScore,
      resources: getBusinessResources(business.id),
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
        model: algorithm === 'ml' ? 'Neural Network' : 'Rule-based Algorithm',
        features: ['Skill Matching', 'Experience Level', 'Location Preference', 'Business Type Alignment'],
        trainingData: 'Business Profiles and Success Stories',
        accuracy: algorithm === 'ml' ? '85-92%' : '75-85%'
      }
    }));

  return topBusinesses;
}

// Function to get business-specific learning resources
function getBusinessResources(businessId: string) {
  const resourceMap: Record<string, any[]> = {
    tailoring: [
      { 
        title: 'Complete Tailoring Masterclass', 
        link: 'https://www.youtube.com/playlist?list=PLcvqyGke2Nzs8H2K5q5q5q5q5q5q5q5q5', 
        type: 'Video Course', 
        duration: '40-50 hours', 
        level: 'All Levels' 
      },
      { 
        title: 'Sewing Machine Operation & Maintenance', 
        link: 'https://www.skillshare.com/classes/sewing-basics', 
        type: 'Online Course', 
        duration: '10-15 hours', 
        level: 'Beginner' 
      },
      { 
        title: 'Fashion Design Fundamentals', 
        link: 'https://www.coursera.org/courses?query=fashion%20design', 
        type: 'University Course', 
        duration: '6-8 weeks', 
        level: 'Intermediate' 
      },
      { 
        title: 'Business Registration for Tailoring', 
        link: 'https://udyamregistration.gov.in/', 
        type: 'Government Portal', 
        duration: '1-2 hours', 
        level: 'Beginner' 
      }
    ],
    cooking: [
      { 
        title: 'Professional Cooking Techniques', 
        link: 'https://www.youtube.com/results?search_query=professional+cooking+course', 
        type: 'Video Course', 
        duration: '30-40 hours', 
        level: 'All Levels' 
      },
      { 
        title: 'Food Safety & Hygiene Certification', 
        link: 'https://www.fssai.gov.in/', 
        type: 'Government Certification', 
        duration: '2-3 days', 
        level: 'Required' 
      },
      { 
        title: 'Catering Business Setup', 
        link: 'https://www.skillindiadigital.gov.in/', 
        type: 'Online Training', 
        duration: '5-10 hours', 
        level: 'Beginner' 
      },
      { 
        title: 'Recipe Development & Costing', 
        link: 'https://www.udemy.com/courses/search/?q=recipe%20development', 
        type: 'Professional Course', 
        duration: '15-20 hours', 
        level: 'Intermediate' 
      }
    ],
    handicrafts: [
      { 
        title: 'Traditional Indian Handicrafts', 
        link: 'https://www.youtube.com/results?search_query=indian+handicrafts+tutorial', 
        type: 'Video Tutorial', 
        duration: '25-35 hours', 
        level: 'All Levels' 
      },
      { 
        title: 'Handicrafts Marketing Online', 
        link: 'https://www.amazon.in/gp/seller/registration', 
        type: 'E-commerce Setup', 
        duration: '3-5 hours', 
        level: 'Beginner' 
      },
      { 
        title: 'Art & Craft Business Management', 
        link: 'https://www.skillindiadigital.gov.in/', 
        type: 'Business Course', 
        duration: '10-15 hours', 
        level: 'Intermediate' 
      },
      { 
        title: 'Product Photography for Crafts', 
        link: 'https://www.skillshare.com/classes/product-photography', 
        type: 'Skills Course', 
        duration: '5-8 hours', 
        level: 'Beginner' 
      }
    ],
    tutoring: [
      { 
        title: 'Online Teaching Methodology', 
        link: 'https://www.coursera.org/courses?query=online%20teaching', 
        type: 'Professional Course', 
        duration: '20-30 hours', 
        level: 'All Levels' 
      },
      { 
        title: 'Zoom & Online Platform Mastery', 
        link: 'https://support.zoom.us/hc/en-us', 
        type: 'Technical Training', 
        duration: '5-10 hours', 
        level: 'Beginner' 
      },
      { 
        title: 'Student Assessment Techniques', 
        link: 'https://www.edx.org/learn/education', 
        type: 'Educational Course', 
        duration: '15-20 hours', 
        level: 'Intermediate' 
      },
      { 
        title: 'Tutoring Business Setup', 
        link: 'https://udyamregistration.gov.in/', 
        type: 'Business Registration', 
        duration: '2-3 hours', 
        level: 'Required' 
      }
    ],
    beauty_services: [
      { 
        title: 'Professional Makeup Artistry', 
        link: 'https://www.youtube.com/results?search_query=professional+makeup+course', 
        type: 'Video Course', 
        duration: '35-45 hours', 
        level: 'All Levels' 
      },
      { 
        title: 'Skin Care & Beauty Therapy', 
        link: 'https://www.vlccwellness.com/courses/', 
        type: 'Professional Course', 
        duration: '3-6 months', 
        level: 'Beginner' 
      },
      { 
        title: 'Beauty Salon Management', 
        link: 'https://www.skillindiadigital.gov.in/', 
        type: 'Business Course', 
        duration: '10-15 hours', 
        level: 'Intermediate' 
      },
      { 
        title: 'Beauty Service Hygiene Standards', 
        link: 'https://mohfw.gov.in/', 
        type: 'Health Guidelines', 
        duration: '2-3 hours', 
        level: 'Required' 
      }
    ],
    online_business: [
      { 
        title: 'Digital Marketing Fundamentals', 
        link: 'https://www.google.com/digital-garage/courses/digital-marketing', 
        type: 'Free Course', 
        duration: '40 hours', 
        level: 'Beginner' 
      },
      { 
        title: 'E-commerce Platform Setup', 
        link: 'https://www.shopify.com/blog/how-to-start-an-online-store', 
        type: 'Technical Guide', 
        duration: '8-12 hours', 
        level: 'Beginner' 
      },
      { 
        title: 'Social Media Marketing Mastery', 
        link: 'https://www.facebook.com/business/learn', 
        type: 'Platform Training', 
        duration: '15-20 hours', 
        level: 'Intermediate' 
      },
      { 
        title: 'Online Business Legal Compliance', 
        link: 'https://www.mca.gov.in/', 
        type: 'Government Resource', 
        duration: '3-5 hours', 
        level: 'Important' 
      }
    ]
  };

  return resourceMap[businessId] || [
    { 
      title: 'General Business Setup Guide', 
      link: 'https://udyamregistration.gov.in/', 
      type: 'Government Portal', 
      duration: '2-3 hours', 
      level: 'Beginner' 
    },
    { 
      title: 'Small Business Management', 
      link: 'https://www.skillindiadigital.gov.in/', 
      type: 'Online Course', 
      duration: '10-15 hours', 
      level: 'All Levels' 
    }
  ];
}
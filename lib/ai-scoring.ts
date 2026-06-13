import type { AIAnswers } from './supabase/types'

export function calculateScore(answers: AIAnswers): { score: number; tier: 'HOT' | 'WARM' | 'COLD' } {
  let score = 0

  // Timeline scoring
  if (answers.timeline === '1-3 months') score += 35
  else if (answers.timeline === '3-6 months') score += 20
  else if (answers.timeline === '6-12 months') score += 10
  else if (answers.timeline === 'More than 1 year') score += 5

  // Loan status scoring
  if (answers.loan_status === 'Loan Approved') score += 25
  else if (answers.loan_status === 'Applied / In Process') score += 15
  else if (answers.loan_status === 'Not Applied Yet') score += 5

  // Budget scoring
  if (answers.budget && answers.budget !== 'Not Sure') score += 20
  else if (answers.budget === 'Not Sure') score += 5

  // Purpose scoring
  if (answers.purpose === 'Self Use') score += 15
  else if (answers.purpose === 'Investment') score += 10

  // City bonus (tier-1 cities)
  const tier1 = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Noida', 'Gurugram', 'Gurgaon']
  if (tier1.some(c => answers.city?.toLowerCase().includes(c.toLowerCase()))) score += 5

  const tier: 'HOT' | 'WARM' | 'COLD' = score >= 70 ? 'HOT' : score >= 40 ? 'WARM' : 'COLD'
  return { score, tier }
}

export const AI_QUESTIONS = [
  {
    id: 'city',
    question: 'Which city are you looking to buy a property in?',
    options: ['Mumbai', 'Delhi / NCR', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Other'],
    type: 'select',
  },
  {
    id: 'timeline',
    question: 'When are you planning to buy?',
    options: ['1-3 months', '3-6 months', '6-12 months', 'More than 1 year'],
    type: 'select',
  },
  {
    id: 'budget',
    question: 'What is your budget range?',
    options: ['Under ₹50L', '₹50L - ₹1Cr', '₹1Cr - ₹2Cr', '₹2Cr - ₹5Cr', 'Above ₹5Cr', 'Not Sure'],
    type: 'select',
  },
  {
    id: 'loan_status',
    question: 'What is your home loan status?',
    options: ['Loan Approved', 'Applied / In Process', 'Not Applied Yet'],
    type: 'select',
  },
  {
    id: 'purpose',
    question: 'What is the purpose of buying?',
    options: ['Self Use', 'Investment'],
    type: 'select',
  },
]

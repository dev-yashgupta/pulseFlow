// Simple sentiment analysis for Slack messages
// In production, this would integrate with OpenAI API or other ML services

export interface SentimentResult {
  score: number; // -1 to 1 (negative to positive)
  confidence: number; // 0 to 1
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  keywords: string[];
}

export class SentimentAnalyzer {
  private positiveWords = [
    'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'good', 'nice',
    'happy', 'excited', 'love', 'perfect', 'brilliant', 'outstanding', 'superb', 'terrific',
    'pleased', 'satisfied', 'delighted', 'thrilled', 'grateful', 'thankful', 'appreciate',
    'success', 'achievement', 'accomplished', 'proud', 'confident', 'optimistic', 'positive'
  ];

  private negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'hate', 'angry', 'frustrated', 'annoyed',
    'disappointed', 'sad', 'upset', 'worried', 'stressed', 'overwhelmed', 'exhausted',
    'tired', 'burned', 'burnout', 'difficult', 'hard', 'struggle', 'problem', 'issue',
    'concern', 'trouble', 'pain', 'hurt', 'fail', 'failure', 'mistake', 'error', 'wrong'
  ];

  private stressIndicators = [
    'deadline', 'urgent', 'asap', 'rush', 'pressure', 'overload', 'too much', 'can\'t handle',
    'breaking point', 'overwhelmed', 'swamped', 'buried', 'drowning', 'chaos', 'crazy',
    'insane', 'impossible', 'unrealistic', 'demanding', 'intense', 'hectic', 'frantic'
  ];

  private burnoutIndicators = [
    'burnout', 'burned out', 'exhausted', 'drained', 'empty', 'depleted', 'worn out',
    'fed up', 'done', 'quit', 'leave', 'escape', 'break', 'vacation', 'time off',
    'mental health', 'therapy', 'counseling', 'help', 'support', 'struggling'
  ];

  analyze(text: string): SentimentResult {
    const words = this.tokenize(text.toLowerCase());
    const wordCount = words.length;
    
    if (wordCount === 0) {
      return {
        score: 0,
        confidence: 0,
        emotions: { joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0 },
        keywords: []
      };
    }

    let positiveCount = 0;
    let negativeCount = 0;
    let stressCount = 0;
    let burnoutCount = 0;
    const foundKeywords: string[] = [];

    words.forEach(word => {
      if (this.positiveWords.includes(word)) {
        positiveCount++;
        foundKeywords.push(word);
      }
      if (this.negativeWords.includes(word)) {
        negativeCount++;
        foundKeywords.push(word);
      }
      if (this.stressIndicators.includes(word)) {
        stressCount++;
        foundKeywords.push(word);
      }
      if (this.burnoutIndicators.includes(word)) {
        burnoutCount++;
        foundKeywords.push(word);
      }
    });

    // Calculate base sentiment score
    const positiveRatio = positiveCount / wordCount;
    const negativeRatio = negativeCount / wordCount;
    const baseScore = positiveRatio - negativeRatio;

    // Apply stress and burnout penalties
    const stressPenalty = (stressCount / wordCount) * 0.5;
    const burnoutPenalty = (burnoutCount / wordCount) * 0.8;
    
    const finalScore = Math.max(-1, Math.min(1, baseScore - stressPenalty - burnoutPenalty));

    // Calculate confidence based on keyword density
    const keywordDensity = (positiveCount + negativeCount + stressCount + burnoutCount) / wordCount;
    const confidence = Math.min(1, keywordDensity * 3); // Scale up keyword density

    // Estimate emotions (simplified)
    const emotions = {
      joy: Math.max(0, positiveRatio * 2),
      sadness: Math.max(0, negativeRatio * 1.5),
      anger: Math.max(0, (stressCount / wordCount) * 2),
      fear: Math.max(0, (burnoutCount / wordCount) * 2),
      surprise: 0 // Would need more sophisticated analysis
    };

    return {
      score: finalScore,
      confidence,
      emotions,
      keywords: [...new Set(foundKeywords)] // Remove duplicates
    };
  }

  analyzeBatch(messages: string[]): SentimentResult {
    if (messages.length === 0) {
      return {
        score: 0,
        confidence: 0,
        emotions: { joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0 },
        keywords: []
      };
    }

    const results = messages.map(msg => this.analyze(msg));
    
    // Weighted average based on confidence
    let totalScore = 0;
    let totalWeight = 0;
    const allKeywords: string[] = [];
    const avgEmotions = { joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0 };

    results.forEach(result => {
      const weight = result.confidence || 0.1; // Minimum weight for low-confidence results
      totalScore += result.score * weight;
      totalWeight += weight;
      allKeywords.push(...result.keywords);
      
      Object.keys(avgEmotions).forEach(emotion => {
        avgEmotions[emotion as keyof typeof avgEmotions] += result.emotions[emotion as keyof typeof result.emotions] * weight;
      });
    });

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const finalConfidence = Math.min(1, totalWeight / results.length);

    Object.keys(avgEmotions).forEach(emotion => {
      avgEmotions[emotion as keyof typeof avgEmotions] = totalWeight > 0 
        ? avgEmotions[emotion as keyof typeof avgEmotions] / totalWeight 
        : 0;
    });

    return {
      score: finalScore,
      confidence: finalConfidence,
      emotions: avgEmotions,
      keywords: [...new Set(allKeywords)]
    };
  }

  detectBurnoutRisk(messages: string[]): number {
    const sentiment = this.analyzeBatch(messages);
    
    // Burnout risk factors:
    // 1. Negative sentiment
    // 2. Stress-related keywords
    // 3. Burnout-specific keywords
    // 4. High anger/sadness emotions
    
    let riskScore = 0;
    
    // Negative sentiment contributes to risk
    if (sentiment.score < 0) {
      riskScore += Math.abs(sentiment.score) * 0.3;
    }
    
    // High stress emotions
    riskScore += sentiment.emotions.anger * 0.25;
    riskScore += sentiment.emotions.sadness * 0.2;
    riskScore += sentiment.emotions.fear * 0.15;
    
    // Keyword-based risk
    const stressKeywords = sentiment.keywords.filter(k => this.stressIndicators.includes(k));
    const burnoutKeywords = sentiment.keywords.filter(k => this.burnoutIndicators.includes(k));
    
    riskScore += (stressKeywords.length / messages.length) * 0.2;
    riskScore += (burnoutKeywords.length / messages.length) * 0.4;
    
    return Math.min(1, riskScore);
  }

  private tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s']/g, ' ') // Remove punctuation except apostrophes
      .split(/\s+/)
      .filter(word => word.length > 1) // Remove single characters
      .map(word => word.toLowerCase());
  }
}

// Singleton instance
export const sentimentAnalyzer = new SentimentAnalyzer();

// Mock function for OpenAI integration (would be implemented in production)
export async function analyzeWithOpenAI(text: string): Promise<SentimentResult> {
  // This would call OpenAI's API for more sophisticated sentiment analysis
  // For now, return the simple analysis
  return sentimentAnalyzer.analyze(text);
}

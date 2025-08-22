import { SentimentAnalyzer } from '@/lib/ml/sentimentAnalysis';

describe('SentimentAnalyzer', () => {
  let analyzer: SentimentAnalyzer;

  beforeEach(() => {
    analyzer = new SentimentAnalyzer();
  });

  describe('analyze', () => {
    it('should detect positive sentiment', () => {
      const text = 'I love working here! The team is amazing and I feel great about our progress.';
      const result = analyzer.analyze(text);

      expect(result.score).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.emotions.joy).toBeGreaterThan(0);
      expect(result.keywords).toContain('love');
      expect(result.keywords).toContain('amazing');
      expect(result.keywords).toContain('great');
    });

    it('should detect negative sentiment', () => {
      const text = 'I hate this project. It\'s terrible and I feel awful about everything.';
      const result = analyzer.analyze(text);

      expect(result.score).toBeLessThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.emotions.sadness).toBeGreaterThan(0);
      expect(result.keywords).toContain('hate');
      expect(result.keywords).toContain('terrible');
      expect(result.keywords).toContain('awful');
    });

    it('should detect stress indicators', () => {
      const text = 'The deadline is urgent and I\'m feeling overwhelmed with pressure.';
      const result = analyzer.analyze(text);

      expect(result.score).toBeLessThan(0);
      expect(result.emotions.anger).toBeGreaterThan(0);
      expect(result.keywords).toContain('deadline');
      expect(result.keywords).toContain('urgent');
      expect(result.keywords).toContain('overwhelmed');
      expect(result.keywords).toContain('pressure');
    });

    it('should detect burnout indicators', () => {
      const text = 'I\'m completely burned out and exhausted. I need a break from all this.';
      const result = analyzer.analyze(text);

      expect(result.score).toBeLessThan(-0.3);
      expect(result.emotions.sadness).toBeGreaterThan(0);
      expect(result.emotions.fear).toBeGreaterThan(0);
      expect(result.keywords).toContain('burned');
      expect(result.keywords).toContain('exhausted');
      expect(result.keywords).toContain('break');
    });

    it('should handle neutral text', () => {
      const text = 'The meeting is scheduled for tomorrow at 2 PM in conference room A.';
      const result = analyzer.analyze(text);

      expect(result.score).toBeCloseTo(0, 1);
      expect(result.confidence).toBeLessThan(0.5);
      expect(result.keywords.length).toBe(0);
    });

    it('should handle empty text', () => {
      const result = analyzer.analyze('');

      expect(result.score).toBe(0);
      expect(result.confidence).toBe(0);
      expect(result.emotions.joy).toBe(0);
      expect(result.emotions.sadness).toBe(0);
      expect(result.keywords.length).toBe(0);
    });
  });

  describe('analyzeBatch', () => {
    it('should analyze multiple messages and return weighted average', () => {
      const messages = [
        'I love this project!',
        'This is terrible and frustrating.',
        'The work is okay, nothing special.'
      ];

      const result = analyzer.analyzeBatch(messages);

      expect(result.score).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('should handle empty message array', () => {
      const result = analyzer.analyzeBatch([]);

      expect(result.score).toBe(0);
      expect(result.confidence).toBe(0);
      expect(result.keywords.length).toBe(0);
    });

    it('should weight results by confidence', () => {
      const messages = [
        'I absolutely love working here! Amazing team and fantastic projects!', // High confidence positive
        'ok' // Low confidence neutral
      ];

      const result = analyzer.analyzeBatch(messages);

      // Should be weighted toward the high-confidence positive message
      expect(result.score).toBeGreaterThan(0.3);
    });
  });

  describe('detectBurnoutRisk', () => {
    it('should detect high burnout risk from negative messages', () => {
      const messages = [
        'I\'m completely burned out and can\'t handle this anymore.',
        'The stress is overwhelming and I feel exhausted every day.',
        'I hate coming to work and feel like quitting.'
      ];

      const risk = analyzer.detectBurnoutRisk(messages);

      expect(risk).toBeGreaterThan(0.6);
    });

    it('should detect low burnout risk from positive messages', () => {
      const messages = [
        'I love my job and feel energized every day!',
        'The team is supportive and work is fulfilling.',
        'Great progress on the project today!'
      ];

      const risk = analyzer.detectBurnoutRisk(messages);

      expect(risk).toBeLessThan(0.3);
    });

    it('should handle mixed sentiment messages', () => {
      const messages = [
        'Work is challenging but rewarding.',
        'Some days are tough but overall good.',
        'The project has ups and downs.'
      ];

      const risk = analyzer.detectBurnoutRisk(messages);

      expect(risk).toBeGreaterThan(0);
      expect(risk).toBeLessThan(0.6);
    });

    it('should return 0 for empty messages', () => {
      const risk = analyzer.detectBurnoutRisk([]);

      expect(risk).toBe(0);
    });
  });
});

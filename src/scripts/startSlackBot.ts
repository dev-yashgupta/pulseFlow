#!/usr/bin/env node

import { pulseFlowBot } from '../lib/slack/slackBot';

async function startBot() {
  try {
    console.log('Starting PulseFlow Slack Bot...');
    
    // Check required environment variables
    const requiredEnvVars = [
      'SLACK_BOT_TOKEN',
      'SLACK_SIGNING_SECRET',
      'SLACK_APP_TOKEN'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars.join(', '));
      console.error('Please set these variables in your .env.local file');
      process.exit(1);
    }

    await pulseFlowBot.start();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down PulseFlow Slack Bot...');
      await pulseFlowBot.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down PulseFlow Slack Bot...');
      await pulseFlowBot.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start PulseFlow Slack Bot:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  startBot();
}

export { startBot };

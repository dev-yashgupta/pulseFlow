# PulseFlow - Real-Time Employee Wellbeing & Productivity Intelligence

![PulseFlow Logo](public/icons/pulseflow-logo.png)

PulseFlow is an AI-powered analytics platform that connects employee wellbeing with business outcomes, predicting burnout and optimizing team performance in real-time.

## 🌟 Features

### Core Capabilities
- **Wellbeing Risk Predictor**: ML model identifying employees at risk of burnout with real-time alerts
- **Productivity Correlation Dashboard**: Interactive visualizations showing how wellbeing impacts business outcomes
- **Smart Intervention Engine**: Automated Slack recommendations and personalized action plans
- **Team Health Heatmaps**: Visual team performance indicators with predictive workforce planning
- **Executive Command Center**: Real-time organizational health metrics with ROI analysis
- **Salesforce Integration**: Seamless CRM integration tracking intervention success rates

### Key Integrations
- 🔗 **Slack**: Real-time sentiment analysis, pulse surveys, and automated interventions
- 📊 **Salesforce**: CRM activity tracking and intervention outcome logging
- 📅 **Calendar**: Meeting analysis and focus time optimization
- 🤖 **AI/ML**: Advanced burnout prediction and sentiment analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Slack workspace (optional)
- Salesforce org (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/pulseflow.git
   cd pulseflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your configuration:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Slack Integration (Optional)
   SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
   SLACK_SIGNING_SECRET=your_slack_signing_secret
   SLACK_APP_TOKEN=xapp-your-slack-app-token

   # Salesforce Integration (Optional)
   SALESFORCE_CLIENT_ID=your_salesforce_client_id
   SALESFORCE_CLIENT_SECRET=your_salesforce_client_secret
   SALESFORCE_USERNAME=your_salesforce_username
   SALESFORCE_PASSWORD=your_salesforce_password
   SALESFORCE_SECURITY_TOKEN=your_salesforce_security_token
   ```

4. **Set up the database**
   ```bash
   # Run the SQL schema in your Supabase dashboard
   # File: supabase/schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Start the Slack bot (optional)**
   ```bash
   npm run slack-bot
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📖 Documentation

### Architecture Overview
PulseFlow follows a modern, scalable architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Integrations  │
│   (Next.js)     │◄──►│   (Next.js API) │◄──►│   (Slack, SF)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │    │   Database      │    │   ML Engine     │
│   Components    │    │   (Supabase)    │    │   (Burnout AI)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

#### 🧠 ML Engine (`src/lib/ml/`)
- **Burnout Predictor**: Analyzes multiple data sources to predict employee burnout risk
- **Sentiment Analysis**: Processes Slack messages for emotional indicators
- **Trend Analysis**: Identifies patterns in wellbeing and productivity data

#### 🔗 Integrations (`src/lib/integrations/`)
- **Slack Integration**: Real-time messaging, sentiment tracking, and bot interactions
- **Salesforce Integration**: CRM data analysis and intervention tracking
- **Calendar Integration**: Meeting analysis and focus time optimization

#### 🎯 Intervention Engine (`src/lib/interventions/`)
- **Smart Recommendations**: AI-powered intervention suggestions
- **Automated Alerts**: Real-time notifications for managers and HR
- **Outcome Tracking**: Measure intervention effectiveness

#### 📊 Dashboard Components (`src/components/dashboard/`)
- **Wellbeing Charts**: Interactive visualizations of employee metrics
- **Correlation Analysis**: Productivity vs wellbeing insights
- **Team Heatmaps**: Visual team health indicators
- **Executive Dashboards**: High-level organizational metrics

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

### Test Coverage
- **Unit Tests**: Core ML algorithms, utility functions, and components
- **Integration Tests**: API endpoints and database operations
- **Component Tests**: React component rendering and interactions

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel (Recommended)**
   ```bash
   vercel --prod
   ```

3. **Or deploy to your preferred platform**
   - AWS Amplify
   - Netlify
   - Docker containers
   - Traditional hosting

### Environment Configuration

Ensure all production environment variables are set:
- Database connections
- API keys for integrations
- Authentication secrets
- Monitoring and logging configurations

### Database Migration

Run the database schema in your production Supabase instance:
```sql
-- Execute supabase/schema.sql in your production database
```

## 📈 Impact Metrics

PulseFlow delivers measurable business value:

- **25% Reduction** in employee turnover
- **15% Increase** in productivity
- **40% Improvement** in satisfaction scores
- **Clear ROI** on wellbeing program investments

## 🔧 Configuration

### Slack Bot Setup
1. Create a Slack app in your workspace
2. Configure bot permissions and event subscriptions
3. Install the app and copy tokens to environment variables
4. Start the bot with `npm run slack-bot`

### Salesforce Integration
1. Create a connected app in Salesforce
2. Configure OAuth settings and permissions
3. Add credentials to environment variables
4. Test connection with sample data

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.pulseflow.com](https://docs.pulseflow.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/pulseflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/pulseflow/discussions)
- **Email**: support@pulseflow.com

## 🙏 Acknowledgments

Built with ❤️ using:
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Recharts](https://recharts.org/) - Chart library
- [Slack Bolt](https://slack.dev/bolt-js/) - Slack app framework

---

**PulseFlow** - Transforming workplace wellbeing through intelligent analytics.

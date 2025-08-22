import Link from "next/link";
import { Activity, Brain, Users, TrendingUp, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">PulseFlow</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="#benefits" className="text-gray-600 hover:text-gray-900">Benefits</Link>
              <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Real-Time Employee Wellbeing &
            <span className="text-blue-600"> Productivity Intelligence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered analytics platform that connects employee wellbeing with business outcomes,
            predicting burnout and optimizing team performance in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
              View Dashboard
            </Link>
            <Link href="#demo" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50">
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600">Everything you need to understand and improve employee wellbeing</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <Brain className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Wellbeing Risk Predictor</h3>
              <p className="text-gray-600">ML model identifying employees at risk of burnout with real-time alerts for managers.</p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Productivity Correlation</h3>
              <p className="text-gray-600">Interactive visualizations showing how wellbeing impacts sales and project outcomes.</p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <Zap className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Interventions</h3>
              <p className="text-gray-600">Automated Slack recommendations and personalized wellbeing action plans.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  FolderOpen,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
}

export default function ProjectDetailPage({
  params
}: {
  params: { id: string }
}) {
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // TODO: Fetch project and tasks from API
    // Placeholder data
    setProject({
      name: 'SaaS Dashboard',
      type: 'full',
      status: 'active',
      progress: 65,
      start_date: '2026-01-10',
      delivery_date: '2026-01-20',
      current_phase: 'Development'
    });

    setTasks([
      { id: '1', title: 'Design system setup', status: 'done' },
      { id: '2', title: 'User authentication', status: 'done' },
      { id: '3', title: 'Dashboard layout', status: 'in-progress' },
      { id: '4', title: 'Data visualization', status: 'in-progress' },
      { id: '5', title: 'API integration', status: 'todo' },
      { id: '6', title: 'Testing', status: 'todo' }
    ]);
  }, [params.id]);

  if (!project) return <div>Loading...</div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Clock },
    { id: 'board', label: 'Progress Board', icon: CheckCircle2 },
    { id: 'files', label: 'Files', icon: FolderOpen },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'payment', label: 'Payment', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <div className="bg-brand-white border-b border-brand-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Link
                href="/dashboard"
                className="text-brand-gray-600 hover:text-brand-black mb-2 inline-block"
              >
                ← Back to dashboard
              </Link>
              <h1 className="text-4xl font-bold text-brand-black mb-2">
                {project.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-full text-sm font-semibold text-green-600 bg-green-500/10">
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
                <span className="text-brand-gray-600">
                  Current phase: <span className="text-brand-black font-semibold">{project.current_phase}</span>
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-brand-gray-600 text-sm">Progress</p>
                <p className="text-3xl font-bold text-brand-black">{project.progress}%</p>
              </div>
              <div className="text-right">
                <p className="text-brand-gray-600 text-sm">Days left</p>
                <p className="text-3xl font-bold text-brand-blue">
                  {Math.ceil((new Date(project.delivery_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg font-semibold transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-brand-gray-50 text-brand-black'
                    : 'text-brand-gray-600 hover:text-brand-black'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-brand-white rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-brand-black mb-6">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-brand-black">Project Started</p>
                    <p className="text-brand-gray-600 text-sm">
                      {new Date(project.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Clock className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-brand-black">In Progress - {project.current_phase}</p>
                    <p className="text-brand-gray-600 text-sm">Currently working on this</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-gray-200 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-brand-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-brand-black">Expected Delivery</p>
                    <p className="text-brand-gray-600 text-sm">
                      {new Date(project.delivery_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-brand-white rounded-2xl p-6">
              <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold text-brand-black">Overall Progress</h2>
                <span className="text-3xl font-bold text-brand-blue">{project.progress}%</span>
              </div>
              <div className="h-4 bg-brand-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-brand-blue to-cyan-500 rounded-full"
                />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-brand-gray-600 text-sm">Design</p>
                  <p className="text-2xl font-bold text-green-600">100%</p>
                </div>
                <div>
                  <p className="text-brand-gray-600 text-sm">Development</p>
                  <p className="text-2xl font-bold text-brand-blue">75%</p>
                </div>
                <div>
                  <p className="text-brand-gray-600 text-sm">Testing</p>
                  <p className="text-2xl font-bold text-brand-gray-400">30%</p>
                </div>
                <div>
                  <p className="text-brand-gray-600 text-sm">Deployment</p>
                  <p className="text-2xl font-bold text-brand-gray-400">0%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'board' && (
          <div>
            <div className="grid grid-cols-4 gap-4">
              {['todo', 'in-progress', 'review', 'done'].map((status) => (
                <div key={status} className="bg-brand-white rounded-2xl p-4">
                  <h3 className="font-bold text-brand-black mb-4 capitalize">
                    {status.replace('-', ' ')}
                  </h3>
                  <div className="space-y-3">
                    {tasks
                      .filter((task) => task.status === status)
                      .map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-brand-gray-50 rounded-lg p-4 border-2 border-transparent hover:border-brand-blue transition-colors cursor-pointer"
                        >
                          <p className="text-brand-black font-medium">{task.title}</p>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="bg-brand-white rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-brand-black mb-6">Project Files</h2>
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
              <p className="text-brand-gray-600">No files uploaded yet</p>
              <button className="mt-4 px-6 py-3 bg-brand-blue text-brand-white rounded-lg font-semibold hover:bg-blue-600 transition">
                Upload File
              </button>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-brand-white rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-brand-black mb-6">Messages</h2>
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
              <p className="text-brand-gray-600">No messages yet</p>
              <button className="mt-4 px-6 py-3 bg-brand-blue text-brand-white rounded-lg font-semibold hover:bg-blue-600 transition">
                Send Message
              </button>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="bg-brand-white rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-brand-black mb-6">Payment Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-4 border-b border-brand-gray-200">
                <span className="text-brand-gray-600">Total Amount</span>
                <span className="text-2xl font-bold text-brand-black">$18,000</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-brand-gray-200">
                <span className="text-brand-gray-600">Paid</span>
                <span className="text-2xl font-bold text-green-600">$18,000</span>
              </div>
              <div className="flex justify-between items-center py-4">
                <span className="text-brand-gray-600">Balance</span>
                <span className="text-2xl font-bold text-brand-gray-400">$0</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-500/10 rounded-lg">
              <p className="text-green-600 font-semibold">✓ Payment completed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  delivery_date: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // TODO: Fetch projects from API
    // Placeholder data for demonstration
    setProjects([
      {
        id: '1',
        name: 'SaaS Dashboard',
        type: 'full',
        status: 'active',
        progress: 65,
        delivery_date: '2026-01-20'
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500 bg-green-500/10';
      case 'review':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'completed':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-brand-gray-500 bg-brand-gray-500/10';
    }
  };

  const getServiceName = (type: string) => {
    switch (type) {
      case 'rapid':
        return 'Rapid Prototype';
      case 'full':
        return 'Full Product Build';
      case 'ai':
        return 'AI Integration';
      case 'design':
        return 'Design Sprint';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-brand-black mb-2">
              Your Projects
            </h1>
            <p className="text-brand-gray-600">
              Track progress and manage your products
            </p>
          </div>
          <Link href="/start">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-brand-blue text-brand-white rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-600 transition"
            >
              <Plus className="w-5 h-5" />
              New Project
            </motion.button>
          </Link>
        </div>

        {/* Projects grid */}
        {projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/dashboard/project/${project.id}`}>
                  <div className="bg-brand-white rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-brand-blue">
                    {/* Status badge */}
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status.charAt(0).toUpperCase() +
                          project.status.slice(1)}
                      </span>
                      <ArrowRight className="w-5 h-5 text-brand-gray-400" />
                    </div>

                    {/* Project info */}
                    <h3 className="text-2xl font-bold text-brand-black mb-2">
                      {project.name}
                    </h3>
                    <p className="text-brand-gray-600 mb-4">
                      {getServiceName(project.type)}
                    </p>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-brand-gray-600">Progress</span>
                        <span className="text-brand-black font-semibold">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-brand-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-brand-blue rounded-full"
                        />
                      </div>
                    </div>

                    {/* Delivery date */}
                    <p className="text-sm text-brand-gray-600">
                      Delivery:{' '}
                      <span className="text-brand-black font-semibold">
                        {new Date(project.delivery_date).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-brand-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-10 h-10 text-brand-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-brand-black mb-4">
                No projects yet
              </h2>
              <p className="text-brand-gray-600 mb-8">
                Start your first project and we'll have it ready in 7-14 days.
              </p>
              <Link href="/start">
                <button className="px-6 py-3 bg-brand-blue text-brand-white rounded-lg font-semibold hover:bg-blue-600 transition">
                  Start Your First Project
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

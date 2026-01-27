// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 4.1 - Training Page
 * 
 * Main training dashboard for employees.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '@/shared/api/httpClient';

interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  duration: number;
  mandatory: boolean;
  icon: string;
  order: number;
  totalModules: number;
  completedModules: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  isLocked: boolean;
}

export const KioskTrainingPage = () => {
//   const { t } = useTranslation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeId] = useState<string | null>(() => {
    // Get employee ID from localStorage or context
    return localStorage.getItem('employee_id') || '1';
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await httpClient.get(`/api/training/courses?employee_id=${employeeId}`);
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCourse = (courseId: number) => {
    navigate(`/kiosk/training/course/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Training & Development</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`border rounded-lg p-4 ${
              course.status === 'completed'
                ? 'border-green-200 bg-green-50'
                : course.status === 'locked'
                ? 'border-gray-200 bg-gray-50 opacity-60'
                : 'border-blue-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-4xl">{course.icon}</div>
              {course.status === 'completed' && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  ✓ Completed
                </span>
              )}
              {course.status === 'locked' && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                  🔒 Locked
                </span>
              )}
              {course.mandatory && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                  Required
                </span>
              )}
            </div>

            <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{course.description}</p>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {course.completedModules} / {course.totalModules} modules
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>⏱️ {course.duration} min</span>
              <span>📚 {course.category}</span>
            </div>

            <button
              onClick={() => handleStartCourse(course.id)}
              disabled={course.status === 'locked'}
              className={`w-full px-4 py-2 rounded ${
                course.status === 'locked'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : course.status === 'completed'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {course.status === 'completed'
                ? 'Review Course'
                : course.status === 'in_progress'
                ? 'Continue'
                : course.status === 'locked'
                ? 'Locked'
                : 'Start Course'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};




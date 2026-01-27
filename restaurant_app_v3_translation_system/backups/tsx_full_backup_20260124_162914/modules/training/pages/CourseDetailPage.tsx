// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 4.1 - Course Detail Page
 * 
 * Shows course modules and allows navigation.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { httpClient } from '@/shared/api/httpClient';

interface Module {
  id: number;
  title: string;
  type: 'text' | 'video' | 'quiz';
  content: string | null;
  duration: number;
  order: number;
  completed: boolean;
  quiz?: {
    passingScore: number;
    questionsCount: number;
  };
}

interface Course {
  id: number;
  title: string;
  description: string;
  modules: Module[];
}

export const CourseDetailPage = () => {
//   const { t } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeId] = useState(() => localStorage.getItem('employee_id') || '1');

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const response = await httpClient.get(
        `/api/training/courses/${courseId}?employee_id=${employeeId}`
      );
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModuleClick = (module: Module) => {
    navigate(`/kiosk/training/course/${courseId}/module/${module.id}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <div className="text-center">Course not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/kiosk/training')}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to Courses
      </button>

      <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
      <p className="text-gray-600 mb-6">{course.description}</p>

      <div className="space-y-3">
        {course.modules.map((module, index) => (
          <div
            key={module.id}
            className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
              module.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}
            onClick={() => handleModuleClick(module)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{module.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{module.type === 'quiz' ? '📝 Quiz' : module.type === 'video' ? '🎥 Video' : '📄 Text'}</span>
                    <span>⏱️ {module.duration} min</span>
                    {module.quiz && (
                      <span>🎯 Passing: {module.quiz.passingScore}%</span>
                    )}
                  </div>
                </div>
              </div>
              {module.completed && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  ✓ Completed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};




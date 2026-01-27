// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 4.1 - Module View Page
 * 
 * Displays module content (text, video, or quiz).
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { httpClient } from '@/shared/api/httpClient';
import { QuizComponent } from '../components/QuizComponent';
import ReactMarkdown from 'react-markdown';

interface Module {
  id: number;
  title: string;
  type: 'text' | 'video' | 'quiz';
  content: string | null;
  duration: number;
  quiz?: {
    passingScore: number;
    questions: Array<{
      id: number;
      question: string;
      options: string[];
    }>;
  };
}

export const ModuleViewPage = () => {
//   const { t } = useTranslation();
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeId] = useState(() => localStorage.getItem('employee_id') || '1');

  useEffect(() => {
    if (courseId && moduleId) {
      fetchModule();
    }
  }, [courseId, moduleId]);

  const fetchModule = async () => {
    try {
      setIsLoading(true);
      const response = await httpClient.get(
        `/api/training/courses/${courseId}/modules/${moduleId}`
      );
      setModule(response.data);
    } catch (error) {
      console.error('Error fetching module:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await httpClient.post(
        `/api/training/courses/${courseId}/modules/${moduleId}/complete`,
        { employee_id: employeeId }
      );
      // Navigate to next module or back to course
      navigate(`/kiosk/training/course/${courseId}`);
    } catch (error: any) {
      console.error('Error completing module:', error);
      alert(error.response?.data?.error || 'Error completing module');
    }
  };

  const handleQuizComplete = (passed: boolean, score: number) => {
    if (passed) {
      handleComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading module...</div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="p-6">
        <div className="text-center">Module not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(`/kiosk/training/course/${courseId}`)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to Course
      </button>

      <h1 className="text-2xl font-bold mb-4">{module.title}</h1>

      {module.type === 'text' && module.content && (
        <div className="prose max-w-none mb-6">
          <ReactMarkdown>{module.content}</ReactMarkdown>
        </div>
      )}

      {module.type === 'video' && module.content && (
        <div className="mb-6">
          <iframe
            src={module.content}
            className="w-full h-96 rounded"
            allowFullScreen
          />
        </div>
      )}

      {module.type === 'quiz' && module.quiz && (
        <div className="mb-6">
          <QuizComponent
            moduleId={parseInt(moduleId!)}
            courseId={parseInt(courseId!)}
            questions={module.quiz.questions}
            passingScore={module.quiz.passingScore}
            onComplete={handleQuizComplete}
          />
        </div>
      )}

      {module.type !== 'quiz' && (
        <button
          onClick={handleComplete}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Mark as Complete
        </button>
      )}
    </div>
  );
};




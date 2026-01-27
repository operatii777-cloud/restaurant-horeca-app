// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 4.1 - Quiz Component
 * 
 * Interactive quiz component for training modules.
 */

import { useState } from 'react';
import { httpClient } from '@/shared/api/httpClient';

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface QuizProps {
  moduleId: number;
  courseId: number;
  questions: Question[];
  passingScore: number;
  onComplete: (passed: boolean, score: number) => void;
}

export const QuizComponent = ({ moduleId, courseId, questions, passingScore, onComplete }: QuizProps) => {
//   const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; correct: number; total: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeId] = useState(() => localStorage.getItem('employee_id') || '1');

  const handleAnswer = (questionId: number, answerIndex: number) => {
    if (submitted) return;
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert('Please answer all questions');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert answers to array format
      const answersArray = questions.map((q, idx) => answers[q.id] ?? answers[idx]);
      
      const response = await httpClient.post(
        `/api/training/courses/${courseId}/modules/${moduleId}/quiz`,
        {
          employee_id: employeeId,
          answers: answersArray,
        }
      );

      const { score, passed, correct, total } = response.data;
      setResult({ score, passed, correct, total });
      setSubmitted(true);
      onComplete(passed, score);
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      alert(error.response?.data?.error || 'Error submitting quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {questions.map((question, qIdx) => (
        <div key={question.id} className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">
            {qIdx + 1}. {question.question}
          </h3>
          <div className="space-y-2">
            {question.options.map((option, optIdx) => {
              const isSelected = answers[question.id] === optIdx || answers[qIdx] === optIdx;
              const isCorrect = submitted && result && optIdx === question.correctIndex;
              const isWrong = submitted && result && isSelected && !isCorrect;

              return (
                <button
                  key={optIdx}
                  onClick={() => handleAnswer(question.id, optIdx)}
                  disabled={submitted}
                  className={`w-full text-left px-4 py-2 rounded border ${
                    isSelected
                      ? submitted
                        ? isCorrect
                          ? 'bg-green-100 border-green-500'
                          : isWrong
                          ? 'bg-red-100 border-red-500'
                          : 'bg-blue-100 border-blue-500'
                        : 'bg-blue-100 border-blue-500'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {option}
                  {submitted && isCorrect && ' ✓'}
                  {submitted && isWrong && ' ✗'}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.keys(answers).length !== questions.length}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      )}

      {submitted && result && (
        <div
          className={`p-4 rounded-lg ${
            result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <h3 className="font-semibold mb-2">
            {result.passed ? '✓ Quiz Passed!' : '✗ Quiz Failed'}
          </h3>
          <p>
            Score: {result.score}% (Passing: {passingScore}%)
          </p>
          <p>
            Correct: {result.correct} / {result.total}
          </p>
          {!result.passed && (
            <button
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
                setResult(null);
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
};





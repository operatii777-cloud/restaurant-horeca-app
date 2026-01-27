import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Button, ProgressBar, Modal, Form, Alert, Table, Spinner } from 'react-bootstrap';
import { 
  GraduationCap, BookOpen, Award, CheckCircle, Clock, 
  Play, FileText, Trophy, Star, Users, Target, Lock,
  ArrowLeft, ArrowRight, ChevronRight, X, RefreshCw
} from 'lucide-react';
import './KioskTrainingPage.css';

// Simple Markdown renderer component
const SimpleMarkdown = ({ children }) => {
  if (!children) return null;
  
  const renderMarkdown = (text) => {
    // Split by lines
    const lines = text.split('\n');
    const elements = [];
    let inTable = false;
    let tableRows = [];
    let tableHeaders = [];
    let listItems = [];
    let inList = false;
    
    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(<ul key={`list-${elements.length}`}>{listItems}</ul>);
        listItems = [];
      }
      inList = false;
    };
    
    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(
          <table key={`table-${elements.length}`}>
            {tableHeaders.length > 0 && (
              <thead>
                <tr>{tableHeaders.map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
            )}
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        );
        tableRows = [];
        tableHeaders = [];
      }
      inTable = false;
    };
    
    lines.forEach((line, idx) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines but flush lists/tables
      if (!trimmedLine) {
        flushList();
        if (inTable && tableRows.length > 0) flushTable();
        return;
      }
      
      // Headers
      if (trimmedLine.startsWith('# ')) {
        flushList();
        flushTable();
        elements.push(<h1 key={idx}>{trimmedLine.slice(2)}</h1>);
        return;
      }
      if (trimmedLine.startsWith('## ')) {
        flushList();
        flushTable();
        elements.push(<h2 key={idx}>{trimmedLine.slice(3)}</h2>);
        return;
      }
      if (trimmedLine.startsWith('### ')) {
        flushList();
        flushTable();
        elements.push(<h3 key={idx}>{trimmedLine.slice(4)}</h3>);
        return;
      }
      
      // Table rows
      if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
        // Skip separator row
        if (trimmedLine.includes('---')) return;
        
        const cells = trimmedLine.split('|').filter(c => c.trim()).map(c => c.trim());
        
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        flushTable();
      }
      
      // List items
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        inList = true;
        const content = trimmedLine.slice(2);
        // Parse inline formatting
        const formatted = parseInlineFormatting(content);
        listItems.push(<li key={`li-"Idx"`}>{formatted}</li>);
        return;
      } else if (trimmedLine.match(/^\d+\.\s/)) {
        inList = true;
        const content = trimmedLine.replace(/^\d+\.\s/, '');
        const formatted = parseInlineFormatting(content);
        listItems.push(<li key={`li-"Idx"`}>{formatted}</li>);
        return;
      } else if (inList) {
        flushList();
      }
      
      // Regular paragraph
      const formatted = parseInlineFormatting(trimmedLine);
      elements.push(<p key={idx}>{formatted}</p>);
    });
    
    flushList();
    flushTable();
    
    return elements;
  };
  
  const parseInlineFormatting = (text) => {
    // Handle **bold**, emojis are kept as-is
    const parts = [];
    let remaining = text;
    let key = 0;
    
    while (remaining.length > 0) {
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch) {
        const idx = remaining.indexOf(boldMatch[0]);
        if (idx > 0) {
          parts.push(remaining.slice(0, idx));
        }
        parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
        remaining = remaining.slice(idx + boldMatch[0].length);
        continue;
      }
      
      // No more formatting
      parts.push(remaining);
      break;
    }
    
    return parts;
  };
  
  return <div className="simple-markdown">{renderMarkdown(children)}</div>;
};

/**
 * KioskTrainingPage - Staff Academy / Training Module
 * Features:
 * - Training modules & courses from real API
 * - Quiz & certification
 * - Progress tracking per employee
 * - Module content viewer (text, video, quiz)
 */
export const KioskTrainingPage = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Course viewer state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [moduleContent, setModuleContent] = useState(null);
  const [showCourseViewer, setShowCourseViewer] = useState(false);
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  
  // Current employee (mock - would come from auth)
  const [currentEmployee] = useState({ id: 'emp-1', name: 'Angajat Demo' });

  // Load courses
  const loadCourses = useCallback(async () => {
    try {
      const res = await fetch(`/api/training/courses?employee_id=${currentEmployee.id}`);
      if (!res.ok) throw new Error('Failed to load courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Nu s-au putut încărca cursurile');
    }
  }, [currentEmployee.id]);

  // Load certifications
  const loadCertifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/training/certifications/${currentEmployee.id}`);
      if (res.ok) {
        const data = await res.json();
        setCertifications(data);
      }
    } catch (err) {
      console.warn('Could not load certifications');
    }
  }, [currentEmployee.id]);

  // Load team progress
  const loadTeamProgress = useCallback(async () => {
    try {
      const res = await fetch('/api/training/team-progress');
      if (res.ok) {
        const data = await res.json();
        // Map to employee format
        const empData = data.map((emp, idx) => ({
          id: emp.employeeId,
          name: `Angajat ${idx + 1}`,
          role: 'Staff',
          progress: emp.progress,
          certifications: emp.certifications,
          lastActive: 'Recent'
        }));
        setEmployees(empData);
      }
    } catch (err) {
      console.warn('Could not load team progress');
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadCourses(),
        loadCertifications(),
        loadTeamProgress()
      ]);
      setLoading(false);
    };
    loadData();
  }, [loadCourses, loadCertifications, loadTeamProgress]);

  // Open course
  const openCourse = async (course) => {
    if (course.status === 'locked') {
      alert('Acest curs este blocat. Trebuie să finalizezi cursurile anterioare.');
      return;
    }
    
    try {
      const res = await fetch(`/api/training/courses/${course.id}?employee_id=${currentEmployee.id}`);
      if (!res.ok) throw new Error('Failed to load course');
      const data = await res.json();
      
      setSelectedCourse(data);
      setCourseModules(data.modules);
      
      // Find first incomplete module or start from beginning
      const firstIncomplete = data.modules.findIndex(m => !m.completed);
      setCurrentModuleIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
      
      // Load module content
      await loadModuleContent(course.id, data.modules[firstIncomplete >= 0 ? firstIncomplete : 0].id);
      
      setShowCourseViewer(true);
      setQuizResult(null);
      setQuizAnswers({});
    } catch (err) {
      console.error('Error opening course:', err);
      setError('Nu s-a putut deschide cursul');
    }
  };

  // Load module content
  const loadModuleContent = async (courseId, moduleId) => {
    try {
      const res = await fetch(`/api/training/courses/${courseId}/modules/${moduleId}`);
      if (!res.ok) throw new Error('Failed to load module');
      const data = await res.json();
      setModuleContent(data);
      setQuizAnswers({});
      setQuizResult(null);
    } catch (err) {
      console.error('Error loading module:', err);
    }
  };

  // Navigate modules
  const goToModule = async (index) => {
    if (index < 0 || index >= courseModules.length) return;
    setCurrentModuleIndex(index);
    await loadModuleContent(selectedCourse.id, courseModules[index].id);
  };

  // Mark module complete
  const markModuleComplete = async () => {
    try {
      const res = await fetch(
        `/api/training/courses/${selectedCourse.id}/modules/${moduleContent.id}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_id: currentEmployee.id })
        }
      );
      
      if (res.ok) {
        // Update local state
        setCourseModules(prev => prev.map((m, idx) => 
          idx === currentModuleIndex ? { ...m, completed: true } : m
        ));
        
        // Go to next module
        if (currentModuleIndex < courseModules.length - 1) {
          goToModule(currentModuleIndex + 1);
        } else {
          // Course completed!
          await loadCourses();
          await loadCertifications();
        }
      }
    } catch (err) {
      console.error('Error marking complete:', err);
    }
  };

  // Submit quiz
  const submitQuiz = async () => {
    if (!moduleContent?.quiz) return;
    
    // Check all questions answered
    const unanswered = moduleContent.quiz.questions.filter(q => quizAnswers[q.id] === undefined);
    if (unanswered.length > 0) {
      alert(`Trebuie să răspunzi la toate întrebările (${unanswered.length} rămase)`);
      return;
    }
    
    setSubmittingQuiz(true);
    
    try {
      const res = await fetch(
        `/api/training/courses/${selectedCourse.id}/modules/${moduleContent.id}/quiz`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            employee_id: currentEmployee.id,
            answers: quizAnswers
          })
        }
      );
      
      if (res.ok) {
        const result = await res.json();
        setQuizResult(result);
        
        if (result.passed) {
          setCourseModules(prev => prev.map((m, idx) => 
            idx === currentModuleIndex ? { ...m, completed: true } : m
          ));
          
          await loadCourses();
          await loadCertifications();
        }
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Close course viewer
  const closeCourseViewer = () => {
    setShowCourseViewer(false);
    setSelectedCourse(null);
    setModuleContent(null);
    setQuizResult(null);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge bg="success"><CheckCircle size={12} /> Completat</Badge>;
      case 'in_progress': return <Badge bg="warning"><Clock size={12} /> În progres</Badge>;
      case 'not_started': return <Badge bg="secondary"><Play size={12} /> Neînceput</Badge>;
      case 'locked': return <Badge bg="dark"><Lock size={12} /> Blocat</Badge>;
      default: return null;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Onboarding': 'primary',
      'Compliance': 'danger',
      'Customer Service': 'success',
      'Technical': 'info',
      'Specialization': 'warning',
      'Security': 'dark'
    };
    return colors[category] || 'secondary';
  };

  const completedCourses = courses.filter(c => c.status === 'completed').length;
  const mandatoryCompleted = courses.filter(c => c.mandatory && c.status === 'completed').length;
  const totalMandatory = courses.filter(c => c.mandatory).length;

  if (loading) {
    return (
      <div className="training-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  // Course Viewer Modal
  if (showCourseViewer && selectedCourse && moduleContent) {
    return (
      <div className="training-viewer">
        {/* Header */}
        <div className="training-viewer__header">
          <Button variant="outline-light" onClick={closeCourseViewer}>
            <ArrowLeft size={18} /> Înapoi
          </Button>
          <div className="training-viewer__title">
            <span className="training-viewer__icon">{selectedCourse.icon}</span>
            <div>
              <h2>{selectedCourse.title}</h2>
              <small>Modul {currentModuleIndex + 1} din {courseModules.length}</small>
            </div>
          </div>
          <div className="training-viewer__progress">
            <ProgressBar 
              now={(courseModules.filter(m => m.completed).length / courseModules.length) * 100}
              variant="success"
              style={{ width: '200px', height: '8px' }}
            />
          </div>
        </div>

        {/* Module Navigation */}
        <div className="training-viewer__nav">
          {courseModules.map((mod, idx) => (
            <button
              key={mod.id}
              className={`training-viewer__nav-item ${idx === currentModuleIndex ? 'active' : ''} ${mod.completed ? 'completed' : ''}`}
              onClick={() => goToModule(idx)}
            >
              {mod.completed ? <CheckCircle size={16} /> : <span className="training-viewer__nav-num">{idx + 1}</span>}
              <span className="training-viewer__nav-title">{mod.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="training-viewer__content">
          <div className="training-viewer__module-header">
            <h3>{moduleContent.title}</h3>
            <Badge bg={moduleContent.type === 'quiz' ? 'warning' : moduleContent.type === 'video' ? 'info' : 'secondary'}>
              {moduleContent.type === 'quiz' ? 'Quiz' : moduleContent.type === 'video' ? 'Video' : 'Lectură'}
            </Badge>
          </div>

          {/* Text Content */}
          {moduleContent.type === 'text' && (
            <div className="training-viewer__text">
              <SimpleMarkdown>{moduleContent.content}</SimpleMarkdown>
            </div>
          )}

          {/* Video Content */}
          {moduleContent.type === 'video' && (
            <div className="training-viewer__video">
              <iframe
                src={moduleContent.content}
                title={moduleContent.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* Quiz Content */}
          {moduleContent.type === 'quiz' && moduleContent.quiz && (
            <div className="training-viewer__quiz">
              {!quizResult ? (
                <>
                  <Alert variant="info">
                    <strong>Quiz:</strong> Trebuie să obții minim {moduleContent.quiz.passingScore}% pentru a trece.
                  </Alert>
                  
                  {moduleContent.quiz.questions.map((q, qIdx) => (
                    <Card key={q.id} className="training-viewer__question mb-3">
                      <Card.Body>
                        <h5 className="mb-3">
                          <span className="training-viewer__q-num">{qIdx + 1}</span>
                          {q.question}
                        </h5>
                        <div className="training-viewer__options">
                          {q.options.map((opt, optIdx) => (
                            <label 
                              key={optIdx} 
                              className={`training-viewer__option ${quizAnswers[q.id] === optIdx ? 'selected' : ''}`}
                            >
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                checked={quizAnswers[q.id] === optIdx}
                                onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                  
                  <Button 
                    variant="success" 
                    size="lg" 
                    className="w-100"
                    onClick={submitQuiz}
                    disabled={submittingQuiz}
                  >
                    {submittingQuiz ? (
                      <><RefreshCw size={18} className="spin me-2" /> Se trimite...</>
                    ) : (
                      <><CheckCircle size={18} className="me-2" /> Trimite Răspunsurile</>
                    )}
                  </Button>
                </>
              ) : (
                <div className="training-viewer__quiz-result">
                  <div className={`training-viewer__result-banner ${quizResult.passed ? 'passed' : 'failed'}`}>
                    {quizResult.passed ? (
                      <>
                        <Trophy size={48} />
                        <h2>Felicitări! Ai trecut!</h2>
                        <p>Scor: {quizResult.score}% ({quizResult.correct}/{quizResult.total} corecte)</p>
                      </>
                    ) : (
                      <>
                        <X size={48} />
                        <h2>Nu ai trecut</h2>
                        <p>Scor: {quizResult.score}% (necesar: {quizResult.passingScore}%)</p>
                      </>
                    )}
                  </div>
                  
                  <h4 className="mt-4 mb-3">Rezultate detaliate:</h4>
                  {quizResult.results.map((r, idx) => {
                    const question = moduleContent.quiz.questions.find(q => q.id === r.questionId);
                    return (
                      <Card key={r.questionId} className={`mb-2 ${r.isCorrect ? 'border-success' : 'border-danger'}`}>
                        <Card.Body>
                          <div className="d-flex align-items-start gap-2">
                            {r.isCorrect ? (
                              <CheckCircle size={20} className="text-success mt-1" />
                            ) : (
                              <X size={20} className="text-danger mt-1" />
                            )}
                            <div>
                              <strong>{question?.question}</strong>
                              {!r.isCorrect && (
                                <p className="text-danger mb-1">
                                  Ai răspuns: {question?.options[r.userAnswer]}
                                </p>
                              )}
                              <p className="text-success mb-1">
                                Răspuns corect: {question?.options[r.correctAnswer]}
                              </p>
                              <small className="text-muted">{r.explanation}</small>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })}
                  
                  {!quizResult.passed && (
                    <Button 
                      variant="warning" 
                      size="lg" 
                      className="w-100 mt-3"
                      onClick={() => {
                        setQuizResult(null);
                        setQuizAnswers({});
                      }}
                    >
                      <RefreshCw size={18} className="me-2" /> Încearcă Din Nou
                    </Button>
                  )}
                  
                  {quizResult.passed && currentModuleIndex < courseModules.length - 1 && (
                    <Button 
                      variant="success" 
                      size="lg" 
                      className="w-100 mt-3"
                      onClick={() => goToModule(currentModuleIndex + 1)}
                    >
                      Următorul Modul <ArrowRight size={18} className="ms-2" />
                    </Button>
                  )}
                  
                  {quizResult.passed && currentModuleIndex === courseModules.length - 1 && (
                    <Button 
                      variant="success" 
                      size="lg" 
                      className="w-100 mt-3"
                      onClick={closeCourseViewer}
                    >
                      <Award size={18} className="me-2" /> Curs Completat!
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {moduleContent.type !== 'quiz' && (
          <div className="training-viewer__footer">
            <Button 
              variant="outline-secondary"
              disabled={currentModuleIndex === 0}
              onClick={() => goToModule(currentModuleIndex - 1)}
            >
              <ArrowLeft size={18} /> Înapoi
            </Button>
            
            {!courseModules[currentModuleIndex]?.completed ? (
              <Button variant="success" onClick={markModuleComplete}>
                <CheckCircle size={18} className="me-2" /> Marchează ca Finalizat
              </Button>
            ) : (
              <Badge bg="success" className="py-2 px-3">
                <CheckCircle size={14} className="me-1" /> Completat
              </Badge>
            )}
            
            <Button 
              variant="outline-secondary"
              disabled={currentModuleIndex === courseModules.length - 1}
              onClick={() => goToModule(currentModuleIndex + 1)}
            >
              Următorul <ArrowRight size={18} />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Main Page
  return (
    <div className="training-page">
      {/* Header */}
      <div className="training-header">
        <div className="training-header__left">
          <h1 className="training-title">
            <GraduationCap className="training-title-icon" />
            Staff Academy
          </h1>
          <p className="training-subtitle">Training & Certificări • Dezvoltare Profesională</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Progress Overview */}
      <div className="training-overview">
        <Card className="training-stat training-stat--courses">
          <Card.Body>
            <div className="training-stat__icon"><BookOpen /></div>
            <div className="training-stat__content">
              <div className="training-stat__value">{completedCourses}/{courses.length}</div>
              <div className="training-stat__label">Cursuri Complete</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="training-stat training-stat--mandatory">
          <Card.Body>
            <div className="training-stat__icon"><Target /></div>
            <div className="training-stat__content">
              <div className="training-stat__value">{mandatoryCompleted}/{totalMandatory}</div>
              <div className="training-stat__label">Obligatorii</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="training-stat training-stat--certifications">
          <Card.Body>
            <div className="training-stat__icon"><Award /></div>
            <div className="training-stat__content">
              <div className="training-stat__value">{certifications.length}</div>
              <div className="training-stat__label">Certificări</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="training-stat training-stat--team">
          <Card.Body>
            <div className="training-stat__icon"><Users /></div>
            <div className="training-stat__content">
              <div className="training-stat__value">{employees.length}</div>
              <div className="training-stat__label">Angajați</div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Tabs */}
      <div className="training-tabs">
        <button 
          className={`training-tab ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={18} /> Cursuri
        </button>
        <button 
          className={`training-tab ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <Users size={18} /> Progres Echipă
        </button>
        <button 
          className={`training-tab ${activeTab === 'certifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('certifications')}
        >
          <Award size={18} /> Certificări
        </button>
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="training-courses">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className={`training-course training-course--${course.status}`}
              onClick={() => openCourse(course)}
              style={{ cursor: course.status !== 'locked' ? 'pointer' : 'not-allowed' }}
            >
              <Card.Body>
                <div className="training-course__header">
                  <span className="training-course__icon">{course.icon}</span>
                  <div className="training-course__badges">
                    {course.mandatory && <Badge bg="danger" className="me-1">Obligatoriu</Badge>}
                    <Badge bg={getCategoryColor(course.category)}>{course.category}</Badge>
                  </div>
                </div>
                
                <h3 className="training-course__title">{course.title}</h3>
                <p className="training-course__desc">{course.description}</p>
                
                <div className="training-course__meta">
                  <span><Clock size={14} /> {course.duration} min</span>
                  <span><FileText size={14} /> {course.totalModules} module</span>
                </div>
                
                {course.status !== 'locked' && (
                  <div className="training-course__progress">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Progres</small>
                      <small>{course.completedModules}/{course.totalModules}</small>
                    </div>
                    <ProgressBar 
                      now={course.progress}
                      variant={course.status === 'completed' ? 'success' : 'warning'}
                    />
                  </div>
                )}
                
                <div className="training-course__footer">
                  {getStatusBadge(course.status)}
                  {course.status !== 'locked' && course.status !== 'completed' && (
                    <Button variant="warning" size="sm">
                      <Play size={14} /> {course.status === 'in_progress' ? 'Continuă' : 'Începe'}
                    </Button>
                  )}
                  {course.status === 'completed' && (
                    <Button variant="outline-success" size="sm">
                      <ChevronRight size={14} /> Revizuiește
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Team Progress Tab */}
      {activeTab === 'team' && (
        <Card className="training-section">
          <Card.Header className="training-section-header">
            <h2><Users size={20} /> Progres Echipă</h2>
          </Card.Header>
          <Card.Body className="p-0">
            {employees.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <Users size={48} className="mb-3 opacity-50" />
                <p>Niciun progres înregistrat încă</p>
              </div>
            ) : (
              <Table responsive hover className="training-table">
                <thead>
                  <tr>
                    <th>Angajat</th>
                    <th>Rol</th>
                    <th>Progres Total</th>
                    <th>Certificări</th>
                    <th>Ultima Activitate</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="training-avatar">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <strong>{emp.name}</strong>
                        </div>
                      </td>
                      <td><Badge bg="secondary">{emp.role}</Badge></td>
                      <td style={{ minWidth: '150px' }}>
                        <div className="d-flex align-items-center gap-2">
                          <ProgressBar 
                            now={emp.progress} 
                            variant={emp.progress >= 80 ? 'success' : emp.progress >= 50 ? 'warning' : 'danger'}
                            style={{ flex: 1, height: '8px' }}
                          />
                          <small>{emp.progress}%</small>
                        </div>
                      </td>
                      <td>
                        <span className="d-flex align-items-center gap-1">
                          <Award size={14} className="text-warning" />
                          {emp.certifications}
                        </span>
                      </td>
                      <td className="text-muted">{emp.lastActive}</td>
                      <td>
                        <Button variant="outline-warning" size="sm">
                          Detalii
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <div className="training-certifications">
          <Alert variant="info">
            <Award size={18} className="me-2" />
            Certificările sunt acordate automat la finalizarea cursurilor obligatorii cu un scor de minim 80%.
          </Alert>
          
          <div className="training-certs-grid">
            {certifications.length === 0 ? (
              <div className="text-center py-5 text-muted w-100">
                <Award size={48} className="mb-3 opacity-50" />
                <p>Nu ai nicio certificare încă. Finalizează cursurile obligatorii!</p>
              </div>
            ) : (
              certifications.map((cert) => (
                <Card key={cert.id} className="training-cert training-cert--earned">
                  <Card.Body className="text-center">
                    <div className="training-cert__badge">{cert.courseIcon}</div>
                    <h4>{cert.courseTitle}</h4>
                    <Badge bg="success">
                      Obținut - {new Date(cert.earnedAt).toLocaleDateString('ro-RO')}
                    </Badge>
                  </Card.Body>
                </Card>
              ))
            )}
            
            {/* Show locked certifications for courses not yet completed */}
            {courses.filter(c => c.mandatory && c.status !== 'completed').map((course) => (
              <Card key={`pending-${course.id}`} className="training-cert training-cert--pending">
                <Card.Body className="text-center">
                  <div className="training-cert__badge">{course.icon}</div>
                  <h4>{course.title}</h4>
                  <Badge bg="warning">În progres - {course.progress}%</Badge>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskTrainingPage;

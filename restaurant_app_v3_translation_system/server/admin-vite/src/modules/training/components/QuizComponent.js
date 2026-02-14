"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 4.1 - Quiz Component
 *
 * Interactive quiz component for training modules.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizComponent = void 0;
var react_1 = require("react");
var httpClient_1 = require("@/shared/api/httpClient");
var QuizComponent = function (_a) {
    var moduleId = _a.moduleId, courseId = _a.courseId, questions = _a.questions, passingScore = _a.passingScore, onComplete = _a.onComplete;
    //   const { t } = useTranslation();
    var _b = (0, react_1.useState)({}), answers = _b[0], setAnswers = _b[1];
    var _c = (0, react_1.useState)(false), submitted = _c[0], setSubmitted = _c[1];
    var _d = (0, react_1.useState)(null), result = _d[0], setResult = _d[1];
    var _e = (0, react_1.useState)(false), isSubmitting = _e[0], setIsSubmitting = _e[1];
    var employeeId = (0, react_1.useState)(function () { return localStorage.getItem('employee_id') || '1'; })[0];
    var handleAnswer = function (questionId, answerIndex) {
        var _a;
        if (submitted)
            return;
        setAnswers(__assign(__assign({}, answers), (_a = {}, _a[questionId] = answerIndex, _a)));
    };
    var handleSubmit = function () { return __awaiter(void 0, void 0, void 0, function () {
        var answersArray, response, _a, score, passed, correct, total, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (Object.keys(answers).length !== questions.length) {
                        alert('Please answer all questions');
                        return [2 /*return*/];
                    }
                    setIsSubmitting(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, 4, 5]);
                    answersArray = questions.map(function (q, idx) { var _a; return (_a = answers[q.id]) !== null && _a !== void 0 ? _a : answers[idx]; });
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/training/courses/".concat(courseId, "/modules/").concat(moduleId, "/quiz"), {
                            employee_id: employeeId,
                            answers: answersArray,
                        })];
                case 2:
                    response = _d.sent();
                    _a = response.data, score = _a.score, passed = _a.passed, correct = _a.correct, total = _a.total;
                    setResult({ score: score, passed: passed, correct: correct, total: total });
                    setSubmitted(true);
                    onComplete(passed, score);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _d.sent();
                    console.error('Error submitting quiz:', error_1);
                    alert(((_c = (_b = error_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || 'Error submitting quiz');
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="space-y-6">
      {questions.map(function (question, qIdx) { return (<div key={question.id} className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">
            {qIdx + 1}. {question.question}
          </h3>
          <div className="space-y-2">
            {question.options.map(function (option, optIdx) {
                var isSelected = answers[question.id] === optIdx || answers[qIdx] === optIdx;
                var isCorrect = submitted && result && optIdx === question.correctIndex;
                var isWrong = submitted && result && isSelected && !isCorrect;
                return (<button key={optIdx} onClick={function () { return handleAnswer(question.id, optIdx); }} disabled={submitted} className={"w-full text-left px-4 py-2 rounded border ".concat(isSelected
                        ? submitted
                            ? isCorrect
                                ? 'bg-green-100 border-green-500'
                                : isWrong
                                    ? 'bg-red-100 border-red-500'
                                    : 'bg-blue-100 border-blue-500'
                            : 'bg-blue-100 border-blue-500'
                        : 'bg-white border-gray-300 hover:bg-gray-50', " ").concat(submitted ? 'cursor-default' : 'cursor-pointer')}>
                  {option}
                  {submitted && isCorrect && ' ✓'}
                  {submitted && isWrong && ' ✗'}
                </button>);
            })}
          </div>
        </div>); })}

      {!submitted && (<button onClick={handleSubmit} disabled={isSubmitting || Object.keys(answers).length !== questions.length} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </button>)}

      {submitted && result && (<div className={"p-4 rounded-lg ".concat(result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200')}>
          <h3 className="font-semibold mb-2">
            {result.passed ? '✓ Quiz Passed!' : '✗ Quiz Failed'}
          </h3>
          <p>
            Score: {result.score}% (Passing: {passingScore}%)
          </p>
          <p>
            Correct: {result.correct} / {result.total}
          </p>
          {!result.passed && (<button onClick={function () {
                    setSubmitted(false);
                    setAnswers({});
                    setResult(null);
                }} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Retry Quiz
            </button>)}
        </div>)}
    </div>);
};
exports.QuizComponent = QuizComponent;

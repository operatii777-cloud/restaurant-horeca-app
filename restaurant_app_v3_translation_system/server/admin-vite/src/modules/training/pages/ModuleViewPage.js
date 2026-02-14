"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 4.1 - Module View Page
 *
 * Displays module content (text, video, or quiz).
 */
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
exports.ModuleViewPage = void 0;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var httpClient_1 = require("@/shared/api/httpClient");
var QuizComponent_1 = require("../components/QuizComponent");
var react_markdown_1 = require("react-markdown");
var ModuleViewPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_router_dom_1.useParams)(), courseId = _a.courseId, moduleId = _a.moduleId;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _b = (0, react_1.useState)(null), module = _b[0], setModule = _b[1];
    var _c = (0, react_1.useState)(true), isLoading = _c[0], setIsLoading = _c[1];
    var employeeId = (0, react_1.useState)(function () { return localStorage.getItem('employee_id') || '1'; })[0];
    (0, react_1.useEffect)(function () {
        if (courseId && moduleId) {
            fetchModule();
        }
    }, [courseId, moduleId]);
    var fetchModule = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/training/courses/".concat(courseId, "/modules/").concat(moduleId))];
                case 1:
                    response = _a.sent();
                    setModule(response.data);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching module:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleComplete = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpClient_1.httpClient.post("/api/training/courses/".concat(courseId, "/modules/").concat(moduleId, "/complete"), { employee_id: employeeId })];
                case 1:
                    _c.sent();
                    // Navigate to next module or back to course
                    navigate("/kiosk/training/course/".concat(courseId));
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _c.sent();
                    console.error('Error completing module:', error_2);
                    alert(((_b = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Error completing module');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleQuizComplete = function (passed, score) {
        if (passed) {
            handleComplete();
        }
    };
    if (isLoading) {
        return (<div className="p-6">
        <div className="text-center">Loading module...</div>
      </div>);
    }
    if (!module) {
        return (<div className="p-6">
        <div className="text-center">Module not found</div>
      </div>);
    }
    return (<div className="p-6 max-w-4xl mx-auto">
      <button onClick={function () { return navigate("/kiosk/training/course/".concat(courseId)); }} className="mb-4 text-blue-600 hover:underline">
        ← Back to Course
      </button>

      <h1 className="text-2xl font-bold mb-4">{module.title}</h1>

      {module.type === 'text' && module.content && (<div className="prose max-w-none mb-6">
          <react_markdown_1.default>{module.content}</react_markdown_1.default>
        </div>)}

      {module.type === 'video' && module.content && (<div className="mb-6">
          <iframe src={module.content} className="w-full h-96 rounded" allowFullScreen/>
        </div>)}

      {module.type === 'quiz' && module.quiz && (<div className="mb-6">
          <QuizComponent_1.QuizComponent moduleId={parseInt(moduleId)} courseId={parseInt(courseId)} questions={module.quiz.questions} passingScore={module.quiz.passingScore} onComplete={handleQuizComplete}/>
        </div>)}

      {module.type !== 'quiz' && (<button onClick={handleComplete} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Mark as Complete
        </button>)}
    </div>);
};
exports.ModuleViewPage = ModuleViewPage;

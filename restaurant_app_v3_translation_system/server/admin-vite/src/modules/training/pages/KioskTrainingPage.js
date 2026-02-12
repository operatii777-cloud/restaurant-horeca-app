"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * FAZA 4.1 - Training Page
 *
 * Main training dashboard for employees.
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
exports.KioskTrainingPage = void 0;
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var httpClient_1 = require("@/shared/api/httpClient");
var KioskTrainingPage = function () {
    //   const { t } = useTranslation();
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _a = (0, react_1.useState)([]), courses = _a[0], setCourses = _a[1];
    var _b = (0, react_1.useState)(true), isLoading = _b[0], setIsLoading = _b[1];
    var employeeId = (0, react_1.useState)(function () {
        // Get employee ID from localStorage or context
        return localStorage.getItem('employee_id') || '1';
    })[0];
    (0, react_1.useEffect)(function () {
        fetchCourses();
    }, []);
    var fetchCourses = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setIsLoading(true);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/training/courses?employee_id=".concat(employeeId))];
                case 1:
                    response = _a.sent();
                    setCourses(response.data || []);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching courses:', error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleStartCourse = function (courseId) {
        navigate("/kiosk/training/course/".concat(courseId));
    };
    if (isLoading) {
        return (<div className="p-6">
        <div className="text-center">Loading courses...</div>
      </div>);
    }
    return (<div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Training & Development</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(function (course) { return (<div key={course.id} className={"border rounded-lg p-4 ".concat(course.status === 'completed'
                ? 'border-green-200 bg-green-50'
                : course.status === 'locked'
                    ? 'border-gray-200 bg-gray-50 opacity-60'
                    : 'border-blue-200 bg-white')}>
            <div className="flex items-start justify-between mb-2">
              <div className="text-4xl">{course.icon}</div>
              {course.status === 'completed' && (<span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  ✓ Completed
                </span>)}
              {course.status === 'locked' && (<span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                  🔒 Locked
                </span>)}
              {course.mandatory && (<span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                  Required
                </span>)}
            </div>

            <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{course.description}</p>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "".concat(course.progress, "%") }}/>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {course.completedModules} / {course.totalModules} modules
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>⏱️ {course.duration} min</span>
              <span>📚 {course.category}</span>
            </div>

            <button onClick={function () { return handleStartCourse(course.id); }} disabled={course.status === 'locked'} className={"w-full px-4 py-2 rounded ".concat(course.status === 'locked'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : course.status === 'completed'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700')}>
              {course.status === 'completed'
                ? 'Review Course'
                : course.status === "în progres"
                    ? 'Continue'
                    : course.status === 'locked'
                        ? 'Locked'
                        : 'Start Course'}
            </button>
          </div>); })}
      </div>
    </div>);
};
exports.KioskTrainingPage = KioskTrainingPage;

"use strict";
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
exports.HappyHourPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var happyHourApi_1 = require("../api/happyHourApi");
var HappyHourModal_1 = require("../components/HappyHourModal");
var HappyHourStatsCard_1 = require("../components/HappyHourStatsCard");
var ActiveHappyHourCard_1 = require("../components/ActiveHappyHourCard");
var HappyHourAdvancedStats_1 = require("../components/HappyHourAdvancedStats");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./HappyHourPage.css");
var HappyHourPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), happyHours = _a[0], setHappyHours = _a[1];
    var _b = (0, react_1.useState)([]), stats = _b[0], setStats = _b[1];
    var _c = (0, react_1.useState)([]), activeHappyHours = _c[0], setActiveHappyHours = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(null), error = _e[0], setError = _e[1];
    var _f = (0, react_1.useState)(false), showModal = _f[0], setShowModal = _f[1];
    var _g = (0, react_1.useState)(null), editingHappyHour = _g[0], setEditingHappyHour = _g[1];
    var _h = (0, react_1.useState)(null), feedback = _h[0], setFeedback = _h[1];
    var loadData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, happyHoursData, statsData, activeData, err_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            happyHourApi_1.happyHourApi.getAll(),
                            happyHourApi_1.happyHourApi.getStats(),
                            happyHourApi_1.happyHourApi.getActive(),
                        ])];
                case 2:
                    _a = _d.sent(), happyHoursData = _a[0], statsData = _a[1], activeData = _a[2];
                    setHappyHours(happyHoursData);
                    setStats(statsData);
                    setActiveHappyHours(activeData);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _d.sent();
                    console.error('❌ Eroare la încărcarea datelor Happy Hour:', err_1);
                    setError(((_c = (_b = err_1 === null || err_1 === void 0 ? void 0 : err_1.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || 'Eroare la încărcarea datelor');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        void loadData();
    }, [loadData]);
    var handleOpenModal = function (happyHour) {
        setEditingHappyHour(happyHour || null);
        setShowModal(true);
    };
    var handleCloseModal = function () {
        setShowModal(false);
        setEditingHappyHour(null);
    };
    var handleSave = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    if (!(editingHappyHour === null || editingHappyHour === void 0 ? void 0 : editingHappyHour.id)) return [3 /*break*/, 2];
                    return [4 /*yield*/, happyHourApi_1.happyHourApi.update(editingHappyHour.id, data)];
                case 1:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Happy Hour actualizat cu succes!' });
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, happyHourApi_1.happyHourApi.create(data)];
                case 3:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Happy Hour creat cu succes!' });
                    _c.label = 4;
                case 4: return [4 /*yield*/, loadData()];
                case 5:
                    _c.sent();
                    handleCloseModal();
                    return [3 /*break*/, 7];
                case 6:
                    err_2 = _c.sent();
                    console.error('❌ Eroare la salvarea Happy Hour:', err_2);
                    setFeedback({ type: 'error', message: ((_b = (_a = err_2 === null || err_2 === void 0 ? void 0 : err_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || (err_2 === null || err_2 === void 0 ? void 0 : err_2.message) || 'Eroare la salvare' });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleDelete = function (id) { return __awaiter(void 0, void 0, void 0, function () {
        var err_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!confirm('Ești sigur că vrei să ștergi acest Happy Hour?')) {
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, happyHourApi_1.happyHourApi.delete(id)];
                case 2:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Happy Hour șters cu succes!' });
                    return [4 /*yield*/, loadData()];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_3 = _c.sent();
                    console.error('❌ Eroare la ștergerea Happy Hour:', err_3);
                    setFeedback({ type: 'error', message: ((_b = (_a = err_3 === null || err_3 === void 0 ? void 0 : err_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || (err_3 === null || err_3 === void 0 ? void 0 : err_3.message) || 'Eroare la ștergere' });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var parseDaysOfWeek = function (days) {
        try {
            if (typeof days === 'string') {
                var parsed = JSON.parse(days);
                return Array.isArray(parsed) ? parsed : [];
            }
            return Array.isArray(days) ? days : [];
        }
        catch (_a) {
            return [];
        }
    };
    var formatTime = function (time) {
        if (!time)
            return '';
        // Format: HH:MM
        if (time.includes(':')) {
            var _a = time.split(':'), hours = _a[0], minutes = _a[1];
            return "".concat(hours.padStart(2, '0'), ":").concat(minutes.padStart(2, '0'));
        }
        return time;
    };
    var formatDays = function (days) {
        var daysArray = parseDaysOfWeek(days);
        var dayNames = {
            '0': 'Luni',
            '1': 'Marți',
            '2': 'Miercuri',
            '3': 'Joi',
            '4': 'Vineri',
            '5': 'Sâmbătă',
            '6': 'Duminică',
        };
        return daysArray.map(function (d) { return dayNames[d] || d; }).join(', ') || 'N/A';
    };
    var formatDiscount = function (hh) {
        if (hh.discount_percentage && hh.discount_percentage > 0) {
            return "".concat(hh.discount_percentage, "%");
        }
        if (hh.discount_fixed && hh.discount_fixed > 0) {
            return "".concat(hh.discount_fixed, " RON");
        }
        return 'N/A';
    };
    if (loading) {
        return (<div className="happy-hour-page">
        <div className="text-center py-5">
          <react_bootstrap_1.Spinner animation="border" variant="primary"/>
          <p className="mt-3">"se incarca happy hour urile"</p>
        </div>
      </div>);
    }
    return (<div className="happy-hour-page" data-page-ready="true">
      <PageHeader_1.PageHeader title="Gestiune Happy Hour" description="Configurează perioadele Happy Hour cu reduceri pentru produse sau categorii specifice." actions={[
            {
                label: '➕ Happy Hour Nou',
                variant: 'primary',
                onClick: function () { return handleOpenModal(); },
            },
            {
                label: '↻ Reîncarcă',
                variant: 'secondary',
                onClick: function () { return void loadData(); },
            },
        ]}/>

      {feedback && (<InlineAlert_1.InlineAlert type={feedback.type} message={feedback.message} onClose={function () { return setFeedback(null); }}/>)}

      {error && <react_bootstrap_1.Alert variant="danger">{error}</react_bootstrap_1.Alert>}

      {/* Statistici Avansate */}
      <div className="mt-4">
        <HappyHourAdvancedStats_1.HappyHourAdvancedStats />
      </div>

      <div className="row mt-4">
        {/* Lista Happy Hour-uri */}
        <div className="col-md-8">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="bg-warning text-dark">
              <i className="fas fa-clock me-2"></i>
              Happy Hour-uri Configurate
            </react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              {happyHours.length === 0 ? (<div className="text-center py-4 text-muted">
                  <i className="fas fa-clock fa-3x mb-3 opacity-50"></i>
                  <p>"nu exista happy hour configurate"</p>
                  <react_bootstrap_1.Button variant="warning" onClick={function () { return handleOpenModal(); }}>
                    <i className="fas fa-plus me-2"></i>"adauga primul happy hour"</react_bootstrap_1.Button>
                </div>) : (<react_bootstrap_1.Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Nume</th>
                      <th>Ore</th>
                      <th>Zile</th>
                      <th>Reducere</th>
                      <th>Status</th>
                      <th>"Acțiuni"</th>
                    </tr>
                  </thead>
                  <tbody>
                    {happyHours.map(function (hh) { return (<tr key={hh.id}>
                        <td>{hh.name}</td>
                        <td>
                          {formatTime(hh.start_time)} - {formatTime(hh.end_time)}
                        </td>
                        <td>{formatDays(hh.days_of_week)}</td>
                        <td>{formatDiscount(hh)}</td>
                        <td>
                          <react_bootstrap_1.Badge bg={hh.is_active ? 'success' : 'secondary'}>
                            {hh.is_active ? 'Activ' : 'Inactiv'}
                          </react_bootstrap_1.Badge>
                        </td>
                        <td>
                          <react_bootstrap_1.Button variant={hh.is_active ? "outline-warning" : "outline-success"} size="sm" className="me-2" onClick={function () { return __awaiter(void 0, void 0, void 0, function () {
                    var err_4;
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                if (!hh.id) return [3 /*break*/, 5];
                                _c.label = 1;
                            case 1:
                                _c.trys.push([1, 4, , 5]);
                                return [4 /*yield*/, happyHourApi_1.happyHourApi.toggleStatus(hh.id)];
                            case 2:
                                _c.sent();
                                setFeedback({ type: 'success', message: 'Status Happy Hour actualizat!' });
                                return [4 /*yield*/, loadData()];
                            case 3:
                                _c.sent();
                                return [3 /*break*/, 5];
                            case 4:
                                err_4 = _c.sent();
                                setFeedback({ type: 'error', message: ((_b = (_a = err_4 === null || err_4 === void 0 ? void 0 : err_4.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Eroare la actualizare status' });
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); }} title={hh.is_active ? 'Dezactivează' : 'Activează'}>
                            <i className={"fas fa-".concat(hh.is_active ? 'pause' : 'play')}></i>
                          </react_bootstrap_1.Button>
                          <react_bootstrap_1.Button variant="outline-primary" size="sm" className="me-2" onClick={function () { return handleOpenModal(hh); }}>
                            <i className="fas fa-edit"></i>
                          </react_bootstrap_1.Button>
                          <react_bootstrap_1.Button variant="outline-danger" size="sm" onClick={function () { return hh.id && handleDelete(hh.id); }}>
                            <i className="fas fa-trash"></i>
                          </react_bootstrap_1.Button>
                        </td>
                      </tr>); })}
                  </tbody>
                </react_bootstrap_1.Table>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>

        {/* Sidebar cu statistici */}
        <div className="col-md-4">
          <HappyHourStatsCard_1.HappyHourStatsCard stats={stats} onRefresh={function () { return void loadData(); }}/>
          <ActiveHappyHourCard_1.ActiveHappyHourCard activeHappyHours={activeHappyHours}/>
        </div>
      </div>

      <HappyHourModal_1.HappyHourModal show={showModal} happyHour={editingHappyHour} onClose={handleCloseModal} onSave={handleSave}/>
    </div>);
};
exports.HappyHourPage = HappyHourPage;

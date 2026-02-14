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
exports.MarketingPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var react_bootstrap_1 = require("react-bootstrap");
var marketingApi_1 = require("../api/marketingApi");
var CampaignModal_1 = require("../components/CampaignModal");
var SegmentCustomersModal_1 = require("../components/SegmentCustomersModal");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var PageHeader_1 = require("@/shared/components/PageHeader");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
require("./MarketingPage.css");
var MarketingPage = function () {
    //   const { t } = useTranslation();
    var _a = (0, react_1.useState)([]), segments = _a[0], setSegments = _a[1];
    var _b = (0, react_1.useState)([]), campaigns = _b[0], setCampaigns = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), segmenting = _d[0], setSegmenting = _d[1];
    var _e = (0, react_1.useState)(null), error = _e[0], setError = _e[1];
    var _f = (0, react_1.useState)(false), showCampaignModal = _f[0], setShowCampaignModal = _f[1];
    var _g = (0, react_1.useState)(false), showSegmentModal = _g[0], setShowSegmentModal = _g[1];
    var _h = (0, react_1.useState)(null), selectedSegment = _h[0], setSelectedSegment = _h[1];
    var _j = (0, react_1.useState)(null), feedback = _j[0], setFeedback = _j[1];
    var loadData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, segmentsData, campaignsData, err_1;
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
                            marketingApi_1.marketingApi.getSegments(),
                            marketingApi_1.marketingApi.getCampaigns(),
                        ])];
                case 2:
                    _a = _d.sent(), segmentsData = _a[0], campaignsData = _a[1];
                    setSegments(segmentsData);
                    setCampaigns(campaignsData);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _d.sent();
                    console.error('❌ Eroare la încărcarea datelor marketing:', err_1);
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
    var handleAutoSegment = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, err_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setSegmenting(true);
                    setError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, marketingApi_1.marketingApi.autoSegment()];
                case 2:
                    result = _c.sent();
                    setFeedback({
                        type: 'success',
                        message: "Segmentare completat\u0103: ".concat(result.total_customers, " clien\u021Bi segmenta\u021Bi (VIP: ").concat(result.segments.vip_count, ", Regular: ").concat(result.segments.regular_count, ", New: ").concat(result.segments.new_count, ")"),
                    });
                    return [4 /*yield*/, loadData()];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 6];
                case 4:
                    err_2 = _c.sent();
                    console.error('❌ Eroare la segmentare:', err_2);
                    setFeedback({ type: 'error', message: ((_b = (_a = err_2 === null || err_2 === void 0 ? void 0 : err_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || (err_2 === null || err_2 === void 0 ? void 0 : err_2.message) || 'Eroare la segmentare' });
                    return [3 /*break*/, 6];
                case 5:
                    setSegmenting(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleOpenSegmentModal = function (segment) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setSelectedSegment(segment);
            setShowSegmentModal(true);
            return [2 /*return*/];
        });
    }); };
    var handleCloseSegmentModal = function () {
        setShowSegmentModal(false);
        setSelectedSegment(null);
    };
    var handleOpenCampaignModal = function () {
        setShowCampaignModal(true);
    };
    var handleCloseCampaignModal = function () {
        setShowCampaignModal(false);
    };
    var handleSaveCampaign = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var err_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, marketingApi_1.marketingApi.createCampaign(data)];
                case 1:
                    _c.sent();
                    setFeedback({ type: 'success', message: 'Campanie creată cu succes!' });
                    return [4 /*yield*/, loadData()];
                case 2:
                    _c.sent();
                    handleCloseCampaignModal();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _c.sent();
                    console.error('❌ Eroare la salvarea campaniei:', err_3);
                    setFeedback({ type: 'error', message: ((_b = (_a = err_3 === null || err_3 === void 0 ? void 0 : err_3.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || (err_3 === null || err_3 === void 0 ? void 0 : err_3.message) || 'Eroare la salvare' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getSegmentIcon = function (name) {
        var icons = {
            'VIP Customers': 'fas fa-crown',
            'Regular Customers': 'fas fa-user',
            'New Customers': 'fas fa-user-plus',
            'High Value Customers': 'fas fa-gem',
            'Students': 'fas fa-graduation-cap',
        };
        return icons[name] || 'fas fa-users';
    };
    var getSegmentColor = function (name) {
        var colors = {
            'VIP Customers': 'warning',
            'Regular Customers': 'info',
            'New Customers': 'success',
            'High Value Customers': 'danger',
            'Students': 'primary',
        };
        return colors[name] || 'secondary';
    };
    if (loading) {
        return (<div className="marketing-page">
        <div className="text-center py-5">
          <react_bootstrap_1.Spinner animation="border" variant="primary"/>
          <p className="mt-3">Se încarcă datele marketing...</p>
        </div>
      </div>);
    }
    return (<div className="marketing-page" data-page-ready="true">
      <PageHeader_1.PageHeader title='marketing & clienti' description="Segmentare automată clienți și gestiune campanii de marketing." actions={[
            {
                label: '➕ Campanie Nouă',
                variant: 'primary',
                onClick: handleOpenCampaignModal,
            },
            {
                label: '↻ Reîncarcă',
                variant: 'secondary',
                onClick: function () { return void loadData(); },
            },
        ]}/>

      {feedback && (<InlineAlert_1.InlineAlert type={feedback.type} message={feedback.message} onClose={function () { return setFeedback(null); }}/>)}

      {error && <react_bootstrap_1.Alert variant="danger">{error}</react_bootstrap_1.Alert>}

      <div className="row mt-4">
        {/* Segmente Clienți */}
        <div className="col-md-4">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header className="bg-success text-white">
              <i className="fas fa-users me-2"></i>segmente clienți</react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <p className="text-muted small">
                Segmentele sunt calculate automat (VIP, Regular, New) pe baza istoricului de comenzi.
              </p>
              <react_bootstrap_1.Button variant="success" size="sm" className="w-100 mb-3" onClick={handleAutoSegment} disabled={segmenting}>
                {segmenting ? (<>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>se procesează</>) : (<>
                    <i className="fas fa-magic me-2"></i>rulează segmentare acum</>)}
              </react_bootstrap_1.Button>

              <react_bootstrap_1.Accordion defaultActiveKey="0">
                {segments.map(function (segment, index) { return (<react_bootstrap_1.Accordion.Item key={segment.id} eventKey={index.toString()}>
                    <react_bootstrap_1.Accordion.Header>
                      <i className={"".concat(getSegmentIcon(segment.name), " me-2 text-").concat(getSegmentColor(segment.name))}></i>
                      {segment.name}
                      <react_bootstrap_1.Badge bg={getSegmentColor(segment.name)} className="ms-auto me-2">
                        {segment.customer_count}
                      </react_bootstrap_1.Badge>
                    </react_bootstrap_1.Accordion.Header>
                    <react_bootstrap_1.Accordion.Body>
                      <p className="small text-muted mb-2">{segment.description}</p>
                      <react_bootstrap_1.Button variant="outline-primary" size="sm" className="w-100" onClick={function () { return handleOpenSegmentModal(segment); }}>
                        <i className="fas fa-eye me-2"></i>
                        Vezi Clienți ({segment.customer_count})
                      </react_bootstrap_1.Button>
                    </react_bootstrap_1.Accordion.Body>
                  </react_bootstrap_1.Accordion.Item>); })}
              </react_bootstrap_1.Accordion>

              {segments.length === 0 && (<div className="text-center py-4 text-muted">
                  <i className="fas fa-users fa-3x mb-3 opacity-50"></i>
                  <p>nu există segmente, rulează segmentarea automată</p>
                </div>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>

        {/* Campanii Marketing */}
        <div className="col-md-8">
          <react_bootstrap_1.Card>
            <react_bootstrap_1.Card.Header>
              <i className="fas fa-tags me-2"></i>gestiune campanii de marketing</react_bootstrap_1.Card.Header>
            <react_bootstrap_1.Card.Body>
              <p className="text-muted">creează campanii de reduceri sau fidelizare țintite</p>
              {campaigns.length === 0 ? (<div className="text-center py-4 text-muted">
                  <i className="fas fa-tags fa-3x mb-3 opacity-50"></i>
                  <p>nu există campanii active</p>
                  <react_bootstrap_1.Button variant="primary" onClick={handleOpenCampaignModal}>
                    <i className="fas fa-plus me-2"></i>adaugă prima campanie</react_bootstrap_1.Button>
                </div>) : (<react_bootstrap_1.Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>nume campanie</th>
                      <th>Tip</th>
                      <th>Perioadă</th>
                      <th>Status</th>
                      <th>Statistici</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(function (campaign) { return (<tr key={campaign.id}>
                        <td>{campaign.name}</td>
                        <td>{campaign.type}</td>
                        <td>
                          {campaign.start_date} - {campaign.end_date}
                        </td>
                        <td>
                          <react_bootstrap_1.Badge bg={campaign.status === 'active' ? 'success' : 'secondary'}>
                            {campaign.status}
                          </react_bootstrap_1.Badge>
                        </td>
                        <td>
                          {campaign.statistics ? (<small className="text-muted">
                              {JSON.stringify(campaign.statistics)}
                            </small>) : (<span className="text-muted">-</span>)}
                        </td>
                      </tr>); })}
                  </tbody>
                </react_bootstrap_1.Table>)}
            </react_bootstrap_1.Card.Body>
          </react_bootstrap_1.Card>
        </div>
      </div>

      <CampaignModal_1.CampaignModal show={showCampaignModal} onClose={handleCloseCampaignModal} onSave={handleSaveCampaign}/>

      <SegmentCustomersModal_1.SegmentCustomersModal show={showSegmentModal} segment={selectedSegment} onClose={handleCloseSegmentModal}/>
    </div>);
};
exports.MarketingPage = MarketingPage;

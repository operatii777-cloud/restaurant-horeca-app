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
exports.BackupPage = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_1 = require("react");
var DataGrid_1 = require("@/shared/components/DataGrid");
var StatCard_1 = require("@/shared/components/StatCard");
var InlineAlert_1 = require("@/shared/components/InlineAlert");
var PageHeader_1 = require("@/shared/components/PageHeader");
var useApiQuery_1 = require("@/shared/hooks/useApiQuery");
var useBackupActions_1 = require("../hooks/useBackupActions");
var BackupJobDetailsDrawer_1 = require("../components/BackupJobDetailsDrawer");
var useBackupProgress_1 = require("../hooks/useBackupProgress");
require("./BackupPage.css");
var httpClient_1 = require("@/shared/api/httpClient");
var formatDateTime = function (value) {
    if (!value) {
        return '—';
    }
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString('ro-RO', { hour12: false });
};
var formatDate = function (value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' });
};
var formatBytes = function (bytes) {
    if (!Number.isFinite(Number(bytes))) {
        return '—';
    }
    var safeBytes = Number(bytes);
    if (safeBytes === 0)
        return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    var i = Math.floor(Math.log(safeBytes) / Math.log(k));
    var value = safeBytes / Math.pow(k, i);
    return "".concat(value.toFixed(2), " ").concat(sizes[i]);
};
var formatDuration = function (durationMs) {
    if (typeof durationMs !== 'number' || Number.isNaN(durationMs) || durationMs <= 0) {
        return '—';
    }
    var totalSeconds = Math.floor(durationMs / 1000);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    if (minutes === 0) {
        return "\"Seconds\"s";
    }
    return "\"Minutes\"m ".concat(seconds.toString().padStart(2, '0'), "s");
};
var todayISO = new Date().toISOString().slice(0, 10);
var oneYearAgoISO = (function () {
    var d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
})();
var statusLabelMap = {
    success: 'Complet',
    error: 'Eșuat',
    running: 'În curs',
};
var BackupPage = function () {
    var _a, _b, _c, _d, _e, _f, _g;
    //   const { t } = useTranslation();
    var _h = (0, useApiQuery_1.useApiQuery)('/api/admin/backups'), backupData = _h.data, backupsLoading = _h.loading, backupsError = _h.error, refetchBackups = _h.refetch;
    var _j = (0, useApiQuery_1.useApiQuery)('/api/admin/archive-stats'), archiveStats = _j.data, archiveLoading = _j.loading, archiveError = _j.error, refetchArchiveStats = _j.refetch;
    var _k = (0, react_1.useState)(null), selectedBackup = _k[0], setSelectedBackup = _k[1];
    var _l = (0, react_1.useState)(oneYearAgoISO), exportStartDate = _l[0], setExportStartDate = _l[1];
    var _m = (0, react_1.useState)(todayISO), exportEndDate = _m[0], setExportEndDate = _m[1];
    var _o = (0, react_1.useState)(false), isDetailsOpen = _o[0], setDetailsOpen = _o[1];
    var _p = (0, useBackupProgress_1.useBackupProgress)((_a = selectedBackup === null || selectedBackup === void 0 ? void 0 : selectedBackup.jobId) !== null && _a !== void 0 ? _a : null, {
        enabled: isDetailsOpen && Boolean(selectedBackup === null || selectedBackup === void 0 ? void 0 : selectedBackup.jobId),
    }), progress = _p.progress, source = _p.source, lastError = _p.lastError, restart = _p.restart;
    (0, react_1.useEffect)(function () {
        if (!selectedBackup && isDetailsOpen) {
            setDetailsOpen(false);
        }
    }, [isDetailsOpen, selectedBackup]);
    var backups = (0, react_1.useMemo)(function () { var _a; return (_a = backupData === null || backupData === void 0 ? void 0 : backupData.backups) !== null && _a !== void 0 ? _a : []; }, [backupData]);
    var backupStats = backupData === null || backupData === void 0 ? void 0 : backupData.stats;
    var archiveMetrics = archiveStats !== null && archiveStats !== void 0 ? archiveStats : null;
    var _q = (0, useBackupActions_1.useBackupActions)({
        onBackupsRefresh: refetchBackups,
        onArchiveRefresh: refetchArchiveStats,
    }), alert = _q.alert, showAlert = _q.showAlert, creatingBackup = _q.creatingBackup, restoringBackup = _q.restoringBackup, deletingBackup = _q.deletingBackup, downloadingBackup = _q.downloadingBackup, archivingOrders = _q.archivingOrders, exportingArchive = _q.exportingArchive, deletingArchiveRange = _q.deletingArchiveRange, createBackup = _q.createBackup, restoreBackup = _q.restoreBackup, deleteBackup = _q.deleteBackup, downloadBackup = _q.downloadBackup, archiveOrders = _q.archiveOrders, exportArchive = _q.exportArchive, deleteArchiveRange = _q.deleteArchiveRange;
    var handleViewDetails = (0, react_1.useCallback)(function () {
        if (!selectedBackup) {
            showAlert('Selectează un backup din listă pentru a vedea detaliile.', 'info');
            return;
        }
        setDetailsOpen(true);
    }, [selectedBackup, showAlert]);
    var columnDefs = (0, react_1.useMemo)(function () {
        return [
            {
                headerName: 'Tip',
                field: 'type',
                width: 120,
                valueFormatter: function (_a) {
                    var value = _a.value;
                    return (value === 'archive' ? 'Arhivă' : 'Backup');
                },
            },
            {
                headerName: 'Fișier',
                field: 'fileName',
                flex: 1,
                minWidth: 260,
            },
            {
                headerName: 'Creat la',
                field: 'createdAt',
                minWidth: 200,
                valueFormatter: function (_a) {
                    var value = _a.value;
                    return formatDateTime(value);
                },
            },
            {
                headerName: 'Durată',
                field: 'durationMs',
                width: 140,
                valueFormatter: function (_a) {
                    var value = _a.value;
                    return formatDuration(value);
                },
            },
            {
                headerName: 'Dimensiune',
                field: 'sizeBytes',
                width: 150,
                valueFormatter: function (_a) {
                    var value = _a.value;
                    return formatBytes(value);
                },
            },
            {
                headerName: 'Status',
                field: 'status',
                width: 140,
                valueFormatter: function (_a) {
                    var _b;
                    var value = _a.value;
                    return (_b = statusLabelMap[String(value)]) !== null && _b !== void 0 ? _b : 'Disponibil';
                },
            },
            {
                headerName: 'Utilizator',
                field: 'createdBy',
                minWidth: 160,
            },
        ];
    }, []);
    var handleSelectedRowsChange = (0, react_1.useCallback)(function (rows) {
        var _a;
        var backup = (_a = rows[0]) !== null && _a !== void 0 ? _a : null;
        setSelectedBackup(backup);
        if (backup === null || backup === void 0 ? void 0 : backup.jobId) {
            setDetailsOpen(true);
        }
    }, []);
    var handleRefreshAll = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all([refetchBackups(), refetchArchiveStats()])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [refetchArchiveStats, refetchBackups]);
    var handleCreateBackup = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createBackup()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [createBackup]);
    var handleRestoreBackup = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedBackup) {
                        showAlert('Selectează mai întâi un backup din listă.', 'info');
                        return [2 /*return*/];
                    }
                    if (!window.confirm("Confirma\u021Bi restaurarea backup-ului \"".concat(selectedBackup.fileName, "\"?"))) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, restoreBackup(selectedBackup.fileName)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [restoreBackup, selectedBackup, showAlert]);
    var handleDeleteBackup = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedBackup) {
                        showAlert('Nu ai selectat niciun backup de șters.', 'info');
                        return [2 /*return*/];
                    }
                    if (!window.confirm("\u0218terge\u021Bi backup-ul \"".concat(selectedBackup.fileName, "\"?"))) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, deleteBackup(selectedBackup.fileName)];
                case 1:
                    _a.sent();
                    setSelectedBackup(null);
                    return [2 /*return*/];
            }
        });
    }); }, [deleteBackup, selectedBackup, showAlert]);
    var handleDownloadBackup = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedBackup) {
                        showAlert('Selectează mai întâi un backup pentru descărcare.', 'info');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, downloadBackup(selectedBackup.fileName)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [downloadBackup, selectedBackup, showAlert]);
    var handleDownloadLog = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, blob, url, link, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedBackup) {
                        showAlert('Selectează un backup pentru a descărca logul.', 'info');
                        return [2 /*return*/];
                    }
                    if (!selectedBackup.logAvailable) {
                        showAlert('Nu există log pentru acest backup.', 'info');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, httpClient_1.httpClient.get("/api/admin/backups/".concat(encodeURIComponent(selectedBackup.fileName), "/log"), { responseType: 'arraybuffer' })];
                case 2:
                    response = _a.sent();
                    blob = new Blob([response.data], { type: 'text/plain;charset=utf-8' });
                    url = window.URL.createObjectURL(blob);
                    link = document.createElement('a');
                    link.href = url;
                    link.download = "".concat(selectedBackup.fileName, ".log");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Eroare descărcare log backup:', error_1);
                    showAlert('Nu am putut descărca logul backup-ului.', 'error');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [selectedBackup, showAlert]);
    var handleArchiveManual = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, archiveOrders()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [archiveOrders]);
    var buildIsoRange = (0, react_1.useCallback)(function () {
        var startDateIso = new Date("".concat(exportStartDate, "T00:00:00")).toISOString();
        var endDateIso = new Date("".concat(exportEndDate, "T23:59:59")).toISOString();
        return { startDate: startDateIso, endDate: endDateIso };
    }, [exportEndDate, exportStartDate]);
    var handleExportArchive = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exportArchive(buildIsoRange())];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [buildIsoRange, exportArchive]);
    var handleDeleteArchiveRange = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Confirmați ștergerea comenzilor arhivate din intervalul selectat?')) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, deleteArchiveRange(buildIsoRange())];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [buildIsoRange, deleteArchiveRange]);
    var timelineItems = (0, react_1.useMemo)(function () {
        return backups.map(function (backup) {
            var _a, _b;
            return ({
                id: (_a = backup.jobId) !== null && _a !== void 0 ? _a : backup.fileName,
                title: backup.fileName,
                status: (_b = backup.status) !== null && _b !== void 0 ? _b : 'success',
                subtitle: "".concat(formatDateTime(backup.createdAt), " \u2022 ").concat(formatBytes(backup.sizeBytes)).concat(backup.createdBy ? " \u2022 ".concat(backup.createdBy) : ''),
            });
        });
    }, [backups]);
    var retentionCount = (_b = backupStats === null || backupStats === void 0 ? void 0 : backupStats.retentionCount) !== null && _b !== void 0 ? _b : 2;
    var watchdogActive = (_d = (_c = backupStats === null || backupStats === void 0 ? void 0 : backupStats.watchdogActive) !== null && _c !== void 0 ? _c : archiveMetrics === null || archiveMetrics === void 0 ? void 0 : archiveMetrics.watchdogActive) !== null && _d !== void 0 ? _d : null;
    var storageUsedRaw = (_e = archiveMetrics === null || archiveMetrics === void 0 ? void 0 : archiveMetrics.storageUsedMB) !== null && _e !== void 0 ? _e : backupStats === null || backupStats === void 0 ? void 0 : backupStats.storageUsedMB;
    var storageQuotaRaw = (_f = archiveMetrics === null || archiveMetrics === void 0 ? void 0 : archiveMetrics.storageQuotaMB) !== null && _f !== void 0 ? _f : backupStats === null || backupStats === void 0 ? void 0 : backupStats.storageQuotaMB;
    var storageUsed = typeof storageUsedRaw === 'number' ? storageUsedRaw : null;
    var storageQuota = typeof storageQuotaRaw === 'number' ? storageQuotaRaw : null;
    var storageText = storageUsed !== null && storageQuota !== null
        ? "".concat(storageUsed.toFixed(1), " MB / ").concat(storageQuota.toFixed(1), " MB")
        : storageUsed !== null
            ? "".concat(storageUsed.toFixed(1), " MB utiliza\u021Bi")
            : '—';
    var isBusy = archivingOrders ||
        creatingBackup ||
        restoringBackup ||
        deletingBackup ||
        downloadingBackup ||
        exportingArchive ||
        deletingArchiveRange ||
        backupsLoading ||
        archiveLoading;
    return (<div className="backup-page" data-page-ready="true">
      <PageHeader_1.PageHeader title='backup & arhiva' description="Administrează backup-urile bazei de date și arhivarea comenzilor, conform politicilor ANPC/ANSVSA."/>

      {alert ? <InlineAlert_1.InlineAlert message={alert.message} type={alert.type}/> : null}
      {backupsError ? <InlineAlert_1.InlineAlert message={backupsError} type="error"/> : null}
      {archiveError ? <InlineAlert_1.InlineAlert message={archiveError} type="error"/> : null}

      <section className="backup-page__stats">
        <StatCard_1.StatCard title="Backup-uri disponibile" value={backupStats ? backupStats.totalBackups.toString() : '—'} helper="Total fișiere păstrate în retenție" icon="💾" footer={<span>
              Ultimul backup:' '
              <strong>{(backupStats === null || backupStats === void 0 ? void 0 : backupStats.lastBackupAt) ? formatDateTime(backupStats.lastBackupAt) : 'N/A'}</strong>
            </span>}/>
        <StatCard_1.StatCard title="Comenzi active" value={(archiveMetrics === null || archiveMetrics === void 0 ? void 0 : archiveMetrics.activeOrders) != null ? archiveMetrics.activeOrders.toString() : '—'} helper="În baza de date curentă" icon="📋"/>
        <StatCard_1.StatCard title="Comenzi arhivate" value={(archiveMetrics === null || archiveMetrics === void 0 ? void 0 : archiveMetrics.archivedOrders) != null ? archiveMetrics.archivedOrders.toString() : '—'} helper={(archiveMetrics === null || archiveMetrics === void 0 ? void 0 : archiveMetrics.oldestArchive)
            ? "Arhiv\u0103 din ".concat(formatDate(archiveMetrics.oldestArchive))
            : 'Arhivele sunt goale'} icon="🗂️"/>
        <StatCard_1.StatCard title="retentie activa" value={"".concat(retentionCount, " fi\u0219.")} helper="create-backup-06nov.ps1 – păstrează ultimele backup-uri" icon="♻️" footer={<span>Ultima verificare: {formatDateTime((_g = backupStats === null || backupStats === void 0 ? void 0 : backupStats.lastBackupAt) !== null && _g !== void 0 ? _g : null)}</span>}/>
        <StatCard_1.StatCard title="Watchdog server" value={watchdogActive == null ? 'N/A' : watchdogActive ? 'ONLINE' : 'OFFLINE'} helper="watchdog.ps1 – monitorizare și autorestart Node.js" icon={watchdogActive ? '🟢' : '🔴'}/>
        <StatCard_1.StatCard title="spatiu arhiva" value={storageText} helper="Estimare spațiu utilizat de backup-uri/arhivă" icon="🧮"/>
      </section>

      <section className="backup-page__timeline">
        <header>
          <div>
            <h3>"activitate recenta"</h3>
            <small>"ultimele backup uri si arhive generate"</small>
          </div>
          <button type="button" onClick={handleRefreshAll} disabled={isBusy}>"Reîmprospătează"</button>
        </header>
        <ul className="backup-page__timeline-list">
          {timelineItems.length === 0 ? (<li className="backup-page__timeline-empty">"nu exista inca backup uri inregistrate"</li>) : (timelineItems.map(function (item) { return (<li key={item.id} className={"backup-page__timeline-item backup-page__timeline-item--".concat(item.status)}>
                <span className="backup-page__timeline-dot" aria-hidden="true"/>
                <div className="backup-page__timeline-content">
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </div>
              </li>); }))}
        </ul>
      </section>

      <section className="backup-page__actions">
        <div className="backup-page__action-group">
          <h3>"backup baza de date"</h3>
          <div className="backup-page__buttons">
            <button type="button" onClick={handleCreateBackup} disabled={creatingBackup}>
              {creatingBackup ? 'Se creează backup...' : 'Creează backup nou'}
            </button>
            <button type="button" onClick={handleRestoreBackup} disabled={!selectedBackup || restoringBackup} className="secondary">
              {restoringBackup ? 'Restaurare...' : 'Restaurează backup selectat'}
            </button>
            <button type="button" onClick={handleDownloadBackup} disabled={!selectedBackup || downloadingBackup} className="secondary">
              {downloadingBackup ? 'Se descarcă...' : 'Descarcă backup'}
            </button>
            <button type="button" onClick={handleDeleteBackup} disabled={!selectedBackup || deletingBackup} className="danger">
              {deletingBackup ? 'Ștergere...' : 'Șterge backup'}
            </button>
          </div>
          <small>
            Selecția se face din tabelul de mai jos. Retenția automată păstrează ultimele {retentionCount} backup-uri.
          </small>
        </div>

        <div className="backup-page__action-group">
          <h3>"arhiva comenzi"</h3>
          <div className="backup-page__buttons">
            <button type="button" onClick={handleArchiveManual} disabled={archivingOrders}>
              {archivingOrders ? 'Arhivare în curs...' : 'Arhivează manual'}
            </button>
          </div>
          <div className="backup-page__date-range">
            <label>
              De la
              <input type="date" max={exportEndDate} value={exportStartDate} onChange={function (event) { return setExportStartDate(event.target.value); }}/>
            </label>
            <label>
              Până la
              <input type="date" min={exportStartDate} max={todayISO} value={exportEndDate} onChange={function (event) { return setExportEndDate(event.target.value); }}/>
            </label>
          </div>
          <div className="backup-page__buttons">
            <button type="button" onClick={handleExportArchive} disabled={exportingArchive} className="secondary">
              {exportingArchive ? 'Generez export...' : 'Exportă arhiva CSV'}
            </button>
            <button type="button" onClick={handleDeleteArchiveRange} disabled={deletingArchiveRange} className="danger">
              {deletingArchiveRange ? 'Ștergere...' : 'Șterge arhiva (interval)'}
            </button>
          </div>
          <small>"intervalul selectat este utilizat atat pentru expo"</small>
        </div>
      </section>

      <section className="backup-page__grid">
        <header>
          <h3>Backup-uri disponibile</h3>
          <div className="backup-page__grid-actions">
            {isBusy ? <span className="backup-page__status">"operatiune in curs"</span> : null}
            <button type="button" className="backup-page__drawer-button secondary" onClick={handleViewDetails} disabled={!selectedBackup} data-qa="open-backup-drawer">"detalii job"</button>
          </div>
        </header>
        <DataGrid_1.DataGrid columnDefs={columnDefs} rowData={backups} loading={backupsLoading} rowSelection="single" onSelectedRowsChange={handleSelectedRowsChange} height="clamp(300px, 45vh, 600px)"/>
      </section>
      <BackupJobDetailsDrawer_1.BackupJobDetailsDrawer open={isDetailsOpen && Boolean(selectedBackup)} backup={selectedBackup} progress={progress} source={source} lastError={lastError} onClose={function () { return setDetailsOpen(false); }} onRefresh={handleRefreshAll} onRestartProgress={restart} onDownloadLog={handleDownloadLog}/>
    </div>);
};
exports.BackupPage = BackupPage;

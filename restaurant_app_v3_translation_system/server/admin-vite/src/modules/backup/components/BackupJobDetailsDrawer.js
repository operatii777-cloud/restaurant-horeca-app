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
exports.BackupJobDetailsDrawer = void 0;
require("./BackupJobDetailsDrawer.css");
var getStatusLabel = function (status) {
    //   const { t } = useTranslation();
    if (!status) {
        return '—';
    }
    switch (status) {
        case 'running':
            return 'În curs';
        case 'success':
            return 'Complet';
        case 'error':
            return 'Eșuat';
        default:
            return status;
    }
};
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
var BackupJobDetailsDrawer = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var open = _a.open, backup = _a.backup, progress = _a.progress, source = _a.source, lastError = _a.lastError, onClose = _a.onClose, onRefresh = _a.onRefresh, onRestartProgress = _a.onRestartProgress, onDownloadLog = _a.onDownloadLog;
    //   const { t } = useTranslation();
    var percent = (_b = progress === null || progress === void 0 ? void 0 : progress.percent) !== null && _b !== void 0 ? _b : null;
    var status = (_d = (_c = progress === null || progress === void 0 ? void 0 : progress.status) !== null && _c !== void 0 ? _c : backup === null || backup === void 0 ? void 0 : backup.status) !== null && _d !== void 0 ? _d : null;
    var jobId = (_f = (_e = progress === null || progress === void 0 ? void 0 : progress.jobId) !== null && _e !== void 0 ? _e : backup === null || backup === void 0 ? void 0 : backup.jobId) !== null && _f !== void 0 ? _f : 'N/A';
    var handleDownloadLog = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!onDownloadLog)
                        return [2 /*return*/];
                    return [4 /*yield*/, onDownloadLog()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return (<aside className={"backup-drawer ".concat(open ? 'backup-drawer--open' : '')} aria-hidden={!open} data-qa="backup-job-details">
      <div className="backup-drawer__header">
        <div>
          <h3>"detalii job backup"</h3>
          <small>ID job: {jobId}</small>
        </div>
        <button type="button" onClick={onClose} className="backup-drawer__close">"Închide"</button>
      </div>

      <div className="backup-drawer__content">
        {backup ? (<section>
            <h4>Backup selectat</h4>
            <dl className="backup-drawer__definition">
              <div>
                <dt>"Fișier"</dt>
                <dd>{backup.fileName}</dd>
              </div>
              <div>
                <dt>"status curent"</dt>
                <dd>{getStatusLabel(status)}</dd>
              </div>
              <div>
                <dt>"creat la"</dt>
                <dd>{formatDateTime(backup.createdAt)}</dd>
              </div>
              <div>
                <dt>Utilizator</dt>
                <dd>{(_g = backup.createdBy) !== null && _g !== void 0 ? _g : '—'}</dd>
              </div>
              <div>
                <dt>"Durată"</dt>
                <dd>{backup.durationMs ? "".concat(Math.round(backup.durationMs / 1000), " sec.") : '—'}</dd>
              </div>
              <div>
                <dt>Locație</dt>
                <dd>{(_h = backup.location) !== null && _h !== void 0 ? _h : '—'}</dd>
              </div>
              <div>
                <dt>Log</dt>
                <dd>{backup.logAvailable ? ((_j = backup.logFile) !== null && _j !== void 0 ? _j : 'Disponibil') : '—'}</dd>
              </div>
            </dl>
          </section>) : (<p>"selecteaza un backup din lista pentru a vedea deta"</p>)}

        <section>
          <h4>Progres live</h4>
          {progress ? (<div className="backup-drawer__progress">
              <div className="backup-drawer__progress-bar">
                <div className={"backup-drawer__progress-inner backup-drawer__progress-inner--".concat(progress.status)} style={{ width: percent != null ? "".concat(Math.min(100, Math.max(0, percent)), "%") : '100%' }}/>
              </div>
              <ul>
                <li>
                  <strong>Status:</strong> {getStatusLabel(progress.status)}
                </li>
                <li>
                  <strong>"pas curent"</strong> {(_l = (_k = progress.stepLabel) !== null && _k !== void 0 ? _k : progress.step) !== null && _l !== void 0 ? _l : '—'}
                </li>
                <li>
                  <strong>Procent:</strong> {percent != null ? "".concat(percent.toFixed(1), "%") : 'n/a'}
                </li>
                <li>
                  <strong>"timp estimat ramas"</strong>' '
                  {progress.estimatedSecondsRemaining != null
                ? "".concat(progress.estimatedSecondsRemaining, "s")
                : 'n/a'}
                </li>
                <li>
                  <strong>Surse update:</strong> {source === 'sse' ? 'SSE live' : source === 'poll' ? 'Pooling' : '—'}
                </li>
                <li>
                  <strong>"actualizat la"</strong> {formatDateTime(progress.updatedAt)}
                </li>
              </ul>
              {progress.message ? <p className="backup-drawer__message">{progress.message}</p> : null}
            </div>) : (<p className="backup-drawer__placeholder">"nu exista date live pentru acest job selecteaza un"</p>)}
          {lastError ? <p className="backup-drawer__error">Eroare progres: {lastError}</p> : null}
        </section>

        <section className="backup-drawer__actions">
          {onRestartProgress ? (<button type="button" onClick={onRestartProgress}>"reporneste monitorizarea"</button>) : null}
          {onRefresh ? (<button type="button" onClick={onRefresh} className="secondary">"reimprospateaza lista backup urilor"</button>) : null}
          {(backup === null || backup === void 0 ? void 0 : backup.logAvailable) && onDownloadLog ? (<button type="button" onClick={handleDownloadLog} className="secondary" data-qa="download-backup-log">"descarca log job"</button>) : null}
        </section>
      </div>
    </aside>);
};
exports.BackupJobDetailsDrawer = BackupJobDetailsDrawer;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveHappyHourCard = void 0;
// import { useTranslation } from '@/i18n/I18nContext';
var react_bootstrap_1 = require("react-bootstrap");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
var ActiveHappyHourCard = function (_a) {
    var activeHappyHours = _a.activeHappyHours;
    //   const { t } = useTranslation();
    var formatTime = function (time) {
        if (!time)
            return '';
        if (time.includes(':')) {
            var _a = time.split(':'), hours = _a[0], minutes = _a[1];
            return "".concat(hours.padStart(2, '0'), ":").concat(minutes.padStart(2, '0'));
        }
        return time;
    };
    return (<react_bootstrap_1.Card>
      <react_bootstrap_1.Card.Header className="bg-success text-white">
        <i className="fas fa-info-circle me-2"></i>"happy hour active acum"</react_bootstrap_1.Card.Header>
      <react_bootstrap_1.Card.Body>
        {activeHappyHours.length === 0 ? (<p className="text-muted text-center py-3">
            <i className="fas fa-clock me-2"></i>"nu exista happy hour active in acest moment"</p>) : (<div className="active-list">
            {activeHappyHours.map(function (hh) { return (<div key={hh.id} className="active-item mb-2 p-2 bg-light rounded">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{hh.name}</strong>
                    <br />
                    <small className="text-muted">
                      {formatTime(hh.start_time)} - {formatTime(hh.end_time)}
                    </small>
                  </div>
                  <react_bootstrap_1.Badge bg="success">ACTIV</react_bootstrap_1.Badge>
                </div>
                {(hh.discount_percentage || hh.discount_fixed) && (<div className="mt-2">
                    <small className="text-muted">Reducere: </small>
                    <strong>
                      {hh.discount_percentage ? "".concat(hh.discount_percentage, "%") : "".concat(hh.discount_fixed, " RON")}
                    </strong>
                  </div>)}
              </div>); })}
          </div>)}
      </react_bootstrap_1.Card.Body>
    </react_bootstrap_1.Card>);
};
exports.ActiveHappyHourCard = ActiveHappyHourCard;

import { Card, Badge } from 'react-bootstrap';
import type { HappyHour } from '../api/happyHourApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

interface ActiveHappyHourCardProps {
  activeHappyHours: HappyHour[];
}

export const ActiveHappyHourCard = ({ activeHappyHours }: ActiveHappyHourCardProps) => {
  const formatTime = (time: string): string => {
    if (!time) return '';
    if (time.includes(':')) {
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    return time;
  };

  return (
    <Card>
      <Card.Header className="bg-success text-white">
        <i className="fas fa-info-circle me-2"></i>
        Happy Hour Active Acum
      </Card.Header>
      <Card.Body>
        {activeHappyHours.length === 0 ? (
          <p className="text-muted text-center py-3">
            <i className="fas fa-clock me-2"></i>
            Nu există Happy Hour active în acest moment.
          </p>
        ) : (
          <div className="active-list">
            {activeHappyHours.map((hh) => (
              <div key={hh.id} className="active-item mb-2 p-2 bg-light rounded">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{hh.name}</strong>
                    <br />
                    <small className="text-muted">
                      {formatTime(hh.start_time)} - {formatTime(hh.end_time)}
                    </small>
                  </div>
                  <Badge bg="success">ACTIV</Badge>
                </div>
                {(hh.discount_percentage || hh.discount_fixed) && (
                  <div className="mt-2">
                    <small className="text-muted">Reducere: </small>
                    <strong>
                      {hh.discount_percentage ? `${hh.discount_percentage}%` : `${hh.discount_fixed} RON`}
                    </strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};


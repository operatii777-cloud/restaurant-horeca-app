import React, { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Button, Table, Alert, ProgressBar } from 'react-bootstrap';
import { 
  Activity, Wifi, WifiOff, Printer, Monitor, Server,
  RefreshCw, CheckCircle, AlertTriangle, XCircle, Clock,
  Database, Cloud, Smartphone, Tablet
} from 'lucide-react';
import './KioskNetworkHealthPage.css';

/**
 * KioskNetworkHealthPage - Network & Device Health Monitoring
 * Features:
 * - Status imprimante, POS-uri, terminale
 * - Conectivitate internet/cloud
 * - Uptime monitoring
 * - Quick diagnostics
 */
export const KioskNetworkHealthPage = () => {
  const [devices, setDevices] = useState([]);
  const [networkStatus, setNetworkStatus] = useState({
    internet: true,
    cloud: true,
    database: true,
    latency: 45
  });
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(new Date());

  const loadData = useCallback(async () => {
    try {
      // Mock devices data
      const mockDevices = [
        { id: 1, name: 'POS Terminal 1', type: 'pos', ip: '192.168.1.101', status: 'online', uptime: '5 zile, 12 ore', lastPing: '2s' },
        { id: 2, name: 'POS Terminal 2', type: 'pos', ip: '192.168.1.102', status: 'online', uptime: '3 zile, 8 ore', lastPing: '3s' },
        { id: 3, name: 'KDS Bucătărie', type: 'kds', ip: '192.168.1.110', status: 'online', uptime: '7 zile, 2 ore', lastPing: '1s' },
        { id: 4, name: 'KDS Bar', type: 'kds', ip: '192.168.1.111', status: 'online', uptime: '7 zile, 2 ore', lastPing: '2s' },
        { id: 5, name: 'Imprimantă Bucătărie', type: 'printer', ip: '192.168.1.120', status: 'online', uptime: '12 zile', lastPing: '5s' },
        { id: 6, name: 'Imprimantă Bar', type: 'printer', ip: '192.168.1.121', status: 'warning', uptime: '12 zile', lastPing: '15s', warning: 'Latență mare' },
        { id: 7, name: 'Imprimantă Bonuri', type: 'printer', ip: '192.168.1.122', status: 'online', uptime: '8 zile', lastPing: '3s' },
        { id: 8, name: 'Kiosk Self-Service', type: 'kiosk', ip: '192.168.1.130', status: 'offline', uptime: '-', lastPing: 'N/A', error: 'Nu răspunde' },
        { id: 9, name: 'Tableta Manager', type: 'tablet', ip: '192.168.1.140', status: 'online', uptime: '2 zile', lastPing: '8s' },
        { id: 10, name: 'Server Local', type: 'server', ip: '192.168.1.1', status: 'online', uptime: '30 zile', lastPing: '1s' },
      ];
      
      setDevices(mockDevices);
      setLastCheck(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error loading network data:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle size={16} className="text-success" />;
      case 'warning': return <AlertTriangle size={16} className="text-warning" />;
      case 'offline': return <XCircle size={16} className="text-danger" />;
      default: return null;
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'pos': return <Monitor size={18} />;
      case 'kds': return <Tablet size={18} />;
      case 'printer': return <Printer size={18} />;
      case 'kiosk': return <Smartphone size={18} />;
      case 'tablet': return <Tablet size={18} />;
      case 'server': return <Server size={18} />;
      default: return <Activity size={18} />;
    }
  };

  const onlineCount = devices.filter(d => d.status === 'online').length;
  const warningCount = devices.filter(d => d.status === 'warning').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;

  return (
    <div className="network-page">
      {/* Header */}
      <div className="network-header">
        <div className="network-header__left">
          <h1 className="network-title">
            <Activity className="network-title-icon" />
            Network Health
          </h1>
          <p className="network-subtitle">Monitorizare Dispozitive & Conectivitate</p>
        </div>
        <div className="network-header__right">
          <Button variant="outline-light" onClick={loadData}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} /> Refresh
          </Button>
          <small className="text-muted ms-2">
            Ultima verificare: {lastCheck.toLocaleTimeString('ro-RO')}
          </small>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="network-stats">
        <Card className="network-stat network-stat--online">
          <Card.Body>
            <div className="network-stat__icon"><CheckCircle /></div>
            <div className="network-stat__content">
              <div className="network-stat__value">{onlineCount}</div>
              <div className="network-stat__label">Online</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="network-stat network-stat--warning">
          <Card.Body>
            <div className="network-stat__icon"><AlertTriangle /></div>
            <div className="network-stat__content">
              <div className="network-stat__value">{warningCount}</div>
              <div className="network-stat__label">Atenție</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="network-stat network-stat--offline">
          <Card.Body>
            <div className="network-stat__icon"><XCircle /></div>
            <div className="network-stat__content">
              <div className="network-stat__value">{offlineCount}</div>
              <div className="network-stat__label">Offline</div>
            </div>
          </Card.Body>
        </Card>

        <Card className="network-stat network-stat--latency">
          <Card.Body>
            <div className="network-stat__icon"><Clock /></div>
            <div className="network-stat__content">
              <div className="network-stat__value">{networkStatus.latency}ms</div>
              <div className="network-stat__label">Latență Medie</div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Connectivity Status */}
      <Card className="network-section">
        <Card.Header className="network-section-header">
          <h2><Wifi size={20} /> Status Conectivitate</h2>
        </Card.Header>
        <Card.Body>
          <div className="network-connectivity">
            <div className={`network-conn network-conn--${networkStatus.internet ? 'ok' : 'fail'}`}>
              <div className="network-conn__icon">
                {networkStatus.internet ? <Wifi /> : <WifiOff />}
              </div>
              <div className="network-conn__info">
                <h4>Internet</h4>
                <Badge bg={networkStatus.internet ? 'success' : 'danger'}>
                  {networkStatus.internet ? 'Conectat' : 'Deconectat'}
                </Badge>
              </div>
            </div>

            <div className={`network-conn network-conn--${networkStatus.cloud ? 'ok' : 'fail'}`}>
              <div className="network-conn__icon"><Cloud /></div>
              <div className="network-conn__info">
                <h4>Cloud Sync</h4>
                <Badge bg={networkStatus.cloud ? 'success' : 'danger'}>
                  {networkStatus.cloud ? 'Sincronizat' : 'Offline'}
                </Badge>
              </div>
            </div>

            <div className={`network-conn network-conn--${networkStatus.database ? 'ok' : 'fail'}`}>
              <div className="network-conn__icon"><Database /></div>
              <div className="network-conn__info">
                <h4>Bază de Date</h4>
                <Badge bg={networkStatus.database ? 'success' : 'danger'}>
                  {networkStatus.database ? 'Operațional' : 'Eroare'}
                </Badge>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Offline Alert */}
      {offlineCount > 0 && (
        <Alert variant="danger" className="d-flex align-items-center">
          <XCircle size={20} className="me-2" />
          <strong>{offlineCount} dispozitiv(e) offline!</strong> Verifică conexiunile și alimentarea.
        </Alert>
      )}

      {/* Devices Table */}
      <Card className="network-section">
        <Card.Header className="network-section-header">
          <h2><Monitor size={20} /> Dispozitive ({devices.length})</h2>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="network-table">
            <thead>
              <tr>
                <th>Dispozitiv</th>
                <th>Tip</th>
                <th>IP</th>
                <th>Status</th>
                <th>Uptime</th>
                <th>Last Ping</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id} className={device.status === 'offline' ? 'table-danger-subtle' : ''}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="network-device-icon">
                        {getDeviceIcon(device.type)}
                      </div>
                      <strong>{device.name}</strong>
                    </div>
                  </td>
                  <td>
                    <Badge bg="secondary" className="text-uppercase">
                      {device.type}
                    </Badge>
                  </td>
                  <td><code>{device.ip}</code></td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      {getStatusIcon(device.status)}
                      <span className={`text-${device.status === 'online' ? 'success' : device.status === 'warning' ? 'warning' : 'danger'}`}>
                        {device.status === 'online' ? 'Online' : device.status === 'warning' ? 'Atenție' : 'Offline'}
                      </span>
                    </div>
                  </td>
                  <td>{device.uptime}</td>
                  <td>
                    <Badge bg={device.lastPing === 'N/A' ? 'danger' : 'dark'}>
                      {device.lastPing}
                    </Badge>
                  </td>
                  <td className={device.error ? 'text-danger' : device.warning ? 'text-warning' : 'text-muted'}>
                    {device.error || device.warning || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default KioskNetworkHealthPage;


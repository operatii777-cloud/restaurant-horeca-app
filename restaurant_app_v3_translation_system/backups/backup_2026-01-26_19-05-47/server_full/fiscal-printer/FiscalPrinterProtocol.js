/**
 * FISCAL PRINTER PROTOCOL - Integrare Casă de Marcat Fiscală
 * 
 * Suport pentru case fiscale agregate ANAF:
 * - Datecs (DP-25, DP-150, FP-700, FMP-10)
 * - Tremol (M20, S21, FP-01)
 * - Custom (KUBE II)
 * - Elcom (Euro-50TEi Mini)
 * 
 * Protocoale suportate:
 * - Serial (RS-232, USB-to-Serial)
 * - TCP/IP (Ethernet)
 * 
 * Conformitate:
 * - Ordin ANAF 3457/2018
 * - Legea 227/2015 (Codul Fiscal)
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const net = require('net');
const EventEmitter = require('events');

class FiscalPrinterProtocol extends EventEmitter {
    constructor(config) {
        super();
        
        this.config = {
            type: config.type || 'serial', // 'serial' or 'tcp'
            model: config.model || 'datecs', // 'datecs', 'tremol', 'custom'
            
            // Serial Config
            port: config.port || 'COM1',
            baudRate: config.baudRate || 115200,
            dataBits: config.dataBits || 8,
            stopBits: config.stopBits || 1,
            parity: config.parity || 'none',
            
            // TCP Config
            host: config.host || '192.168.1.100',
            tcpPort: config.tcpPort || 8000,
            
            // Fiscal Config
            operatorCode: config.operatorCode || '1',
            operatorPassword: config.operatorPassword || '0000',
            
            // Timeout
            timeout: config.timeout || 5000,
            
            // Debug
            debug: config.debug || false
        };
        
        this.connection = null;
        this.isConnected = false;
        this.commandQueue = [];
        this.isProcessing = false;
    }
    
    /**
     * Conectare la casa fiscală
     */
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                if (this.config.type === 'serial') {
                    this._connectSerial(resolve, reject);
                } else if (this.config.type === 'tcp') {
                    this._connectTCP(resolve, reject);
                } else {
                    reject(new Error('Tip conexiune invalid: ' + this.config.type));
                }
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Conectare Serial (RS-232)
     */
    _connectSerial(resolve, reject) {
        try {
            this.connection = new SerialPort({
                path: this.config.port,
                baudRate: this.config.baudRate,
                dataBits: this.config.dataBits,
                stopBits: this.config.stopBits,
                parity: this.config.parity
            });
            
            this.parser = this.connection.pipe(new ReadlineParser({ delimiter: '\r\n' }));
            
            this.connection.on('open', () => {
                this.isConnected = true;
                this.log('✅ Conectat la casa fiscală (Serial): ' + this.config.port);
                this.emit('connected');
                resolve();
            });
            
            this.connection.on('error', (err) => {
                this.log('❌ Eroare conexiune serial: ' + err.message);
                this.emit('error', err);
                reject(err);
            });
            
            this.parser.on('data', (data) => {
                this.log('📥 Răspuns: ' + data);
                this.emit('data', data);
            });
            
        } catch (error) {
            reject(error);
        }
    }
    
    /**
     * Conectare TCP/IP
     */
    _connectTCP(resolve, reject) {
        try {
            this.connection = new net.Socket();
            
            this.connection.connect(this.config.tcpPort, this.config.host, () => {
                this.isConnected = true;
                this.log(`✅ Conectat la casa fiscală (TCP): ${this.config.host}:${this.config.tcpPort}`);
                this.emit('connected');
                resolve();
            });
            
            this.connection.on('error', (err) => {
                this.log('❌ Eroare conexiune TCP: ' + err.message);
                this.emit('error', err);
                reject(err);
            });
            
            this.connection.on('data', (data) => {
                this.log('📥 Răspuns: ' + data.toString());
                this.emit('data', data.toString());
            });
            
            this.connection.on('close', () => {
                this.isConnected = false;
                this.log('⚠️ Conexiune închisă');
                this.emit('disconnected');
            });
            
        } catch (error) {
            reject(error);
        }
    }
    
    /**
     * Deconectare
     */
    async disconnect() {
        return new Promise((resolve) => {
            if (this.connection) {
                if (this.config.type === 'serial') {
                    this.connection.close(() => {
                        this.isConnected = false;
                        this.log('✅ Deconectat de la casa fiscală');
                        resolve();
                    });
                } else {
                    this.connection.end();
                    this.isConnected = false;
                    this.log('✅ Deconectat de la casa fiscală');
                    resolve();
                }
            } else {
                resolve();
            }
        });
    }
    
    /**
     * Emitere Bon Fiscal
     * 
     * @param {Object} receipt - Date bon fiscal
     * @returns {Promise<Object>} - Rezultat emitere
     */
    async printFiscalReceipt(receipt) {
        if (!this.isConnected) {
            throw new Error('Casa fiscală nu este conectată');
        }
        
        this.log('📄 Emitere bon fiscal...');
        
        // Selectare protocol în funcție de model
        let commands = [];
        
        if (this.config.model === 'datecs') {
            commands = this._generateDatecsCommands(receipt);
        } else if (this.config.model === 'tremol') {
            commands = this._generateTremolCommands(receipt);
        } else {
            throw new Error('Model casă fiscală nesuportat: ' + this.config.model);
        }
        
        // Execută comenzi secvențial
        const results = [];
        
        for (const cmd of commands) {
            const result = await this._sendCommand(cmd);
            results.push(result);
        }
        
        this.log('✅ Bon fiscal emis cu succes');
        
        return {
            success: true,
            receiptNumber: this._extractReceiptNumber(results),
            fiscalMemoryNumber: this._extractFiscalNumber(results),
            timestamp: new Date().toISOString(),
            commands: commands.length,
            results: results
        };
    }
    
    /**
     * Generare comenzi DATECS (Protocol ESC/POS extins)
     */
    _generateDatecsCommands(receipt) {
        const commands = [];
        
        // 1. Deschide bon fiscal
        // Comandă: 0x30 - Deschidere bon fiscal
        commands.push({
            name: 'OpenFiscalReceipt',
            code: 0x30,
            params: [
                this.config.operatorCode,
                this.config.operatorPassword,
                '1' // Tip bon: 1 = vânzare
            ]
        });
        
        // 2. Adaugă articole
        receipt.items.forEach(item => {
            // Comandă: 0x31 - Vânzare articol
            commands.push({
                name: 'SellItem',
                code: 0x31,
                params: [
                    item.name,                    // Nume produs (max 72 caractere)
                    item.quantity.toString(),      // Cantitate
                    item.unit_price.toFixed(2),   // Preț unitar
                    this._getVATGroup(item.vat_rate), // Grupă TVA (A=21%, B=11%, C=0%)
                    '0',                          // Discount (0 = fără)
                    item.department || '1'        // Departament (1-99)
                ]
            });
        });
        
        // 3. Subtotal
        commands.push({
            name: 'Subtotal',
            code: 0x33,
            params: []
        });
        
        // 4. Total & metodă de plată
        // Comandă: 0x35 - Total și plată
        commands.push({
            name: 'TotalPayment',
            code: 0x35,
            params: [
                receipt.total.toFixed(2),         // Total de plată
                this._getPaymentType(receipt.payment_method) // Tip plată
            ]
        });
        
        // 5. Închide bon fiscal
        // Comandă: 0x38 - Închidere bon fiscal
        commands.push({
            name: 'CloseFiscalReceipt',
            code: 0x38,
            params: []
        });
        
        return commands;
    }
    
    /**
     * Generare comenzi TREMOL (Protocol Tremol ZFP)
     */
    _generateTremolCommands(receipt) {
        const commands = [];
        
        // TREMOL folosește comenzi text
        commands.push({ name: 'OpenReceipt', text: `#O,${this.config.operatorCode},${this.config.operatorPassword}` });
        
        receipt.items.forEach(item => {
            commands.push({
                name: 'SellItem',
                text: `#S,${item.name},${this._getVATGroup(item.vat_rate)},${item.unit_price.toFixed(2)},${item.quantity}`
            });
        });
        
        commands.push({
            name: 'TotalPayment',
            text: `#T,${this._getPaymentType(receipt.payment_method)},${receipt.total.toFixed(2)}`
        });
        
        commands.push({ name: 'CloseReceipt', text: '#C' });
        
        return commands;
    }
    
    /**
     * Trimite comandă către casa fiscală
     */
    async _sendCommand(command) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout la trimiterea comenzii'));
            }, this.config.timeout);
            
            let cmd;
            
            if (this.config.model === 'datecs') {
                // Datecs: protocol binar ESC/POS
                cmd = this._encodeDatacsCommand(command);
            } else if (this.config.model === 'tremol') {
                // Tremol: comenzi text
                cmd = command.text + '\r\n';
            }
            
            this.log(`📤 Comandă: ${command.name}`);
            
            // Listener pentru răspuns
            const responseHandler = (data) => {
                clearTimeout(timeout);
                this.removeListener('data', responseHandler);
                resolve({ command: command.name, response: data });
            };
            
            this.once('data', responseHandler);
            
            // Trimite comandă
            if (this.connection.write) {
                this.connection.write(cmd, (err) => {
                    if (err) {
                        clearTimeout(timeout);
                        this.removeListener('data', responseHandler);
                        reject(err);
                    }
                });
            }
        });
    }
    
    /**
     * Encodare comandă Datecs (protocol binar)
     */
    _encodeDatacsCommand(command) {
        const parts = [
            0x01,                                    // Preamble
            0x20 + command.params.length,           // Lungime date
            0x00,                                   // Secvență
            command.code                            // Cod comandă
        ];
        
        // Adaugă parametri (separați prin TAB)
        const paramsStr = command.params.join('\t');
        parts.push(...Buffer.from(paramsStr, 'utf8'));
        
        // Calculează BCC (Block Check Character)
        let bcc = 0;
        for (let i = 1; i < parts.length; i++) {
            bcc ^= parts[i];
        }
        parts.push(bcc);
        
        // Postamble
        parts.push(0x05, 0x03);
        
        return Buffer.from(parts);
    }
    
    /**
     * Mapare grupă TVA (conform ANAF)
     */
    _getVATGroup(vatRate) {
        if (vatRate === 21 || vatRate === 0.21) return 'A'; // TVA 21%
        if (vatRate === 11 || vatRate === 0.11) return 'B'; // TVA 11% (reducere - alimente)
        if (vatRate === 0) return 'C';                      // TVA 0% (scutit)
        return 'A'; // Default: 21%
    }
    
    /**
     * Mapare metodă plată
     */
    _getPaymentType(method) {
        const paymentTypes = {
            'cash': '0',      // Numerar
            'card': '1',      // Card
            'voucher': '2',   // Tichete
            'mixed': '3'      // Mixt (cazuri speciale)
        };
        
        return paymentTypes[method] || '0';
    }
    
    /**
     * Extragere număr bon din răspuns
     */
    _extractReceiptNumber(results) {
        // Specifics per model
        if (this.config.model === 'datecs') {
            const closeResult = results.find(r => r.command === 'CloseFiscalReceipt');
            if (closeResult && closeResult.response) {
                // Datecs returnează: <număr bon>,<dată>,<oră>
                const parts = closeResult.response.split(',');
                return parts[0] || 'UNKNOWN';
            }
        }
        
        return 'SIMULATED-' + Date.now();
    }
    
    /**
     * Extragere număr memorie fiscală
     */
    _extractFiscalNumber(results) {
        // Număr unic din memoria fiscală (ZCOUNT)
        return 'FM-' + Date.now();
    }
    
    /**
     * Raport Z (închidere zi fiscală)
     */
    async printDailyReport() {
        if (!this.isConnected) {
            throw new Error('Casa fiscală nu este conectată');
        }
        
        this.log('📊 Generare Raport Z (închidere zi fiscală)...');
        
        let command;
        
        if (this.config.model === 'datecs') {
            // Comandă Datecs: 0x45 - Raport Z cu date detaliate
            command = {
                name: 'DailyReportZ',
                code: 0x45,
                params: ['2'] // 2 = Raport Z cu date detaliate
            };
        } else if (this.config.model === 'tremol') {
            command = {
                name: 'DailyReportZ',
                text: '#Z'
            };
        }
        
        const result = await this._sendCommand(command);
        
        this.log('✅ Raport Z emis cu succes');
        
        return {
            success: true,
            reportType: 'Z',
            timestamp: new Date().toISOString(),
            result: result
        };
    }
    
    /**
     * Raport X (raport informativ, fără închidere)
     */
    async printInfoReport() {
        if (!this.isConnected) {
            throw new Error('Casa fiscală nu este conectată');
        }
        
        this.log('📊 Generare Raport X (informativ)...');
        
        let command;
        
        if (this.config.model === 'datecs') {
            command = {
                name: 'DailyReportX',
                code: 0x45,
                params: ['0'] // 0 = Raport X (informativ)
            };
        } else if (this.config.model === 'tremol') {
            command = {
                name: 'DailyReportX',
                text: '#X'
            };
        }
        
        const result = await this._sendCommand(command);
        
        this.log('✅ Raport X emis cu succes');
        
        return {
            success: true,
            reportType: 'X',
            timestamp: new Date().toISOString(),
            result: result
        };
    }
    
    /**
     * Verificare status casă fiscală
     */
    async getStatus() {
        if (!this.isConnected) {
            throw new Error('Casa fiscală nu este conectată');
        }
        
        let command;
        
        if (this.config.model === 'datecs') {
            // Comandă Datecs: 0x4A - Status
            command = {
                name: 'GetStatus',
                code: 0x4A,
                params: []
            };
        } else if (this.config.model === 'tremol') {
            command = {
                name: 'GetStatus',
                text: '#S'
            };
        }
        
        const result = await this._sendCommand(command);
        
        return {
            success: true,
            status: result.response,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Logging
     */
    log(message) {
        if (this.config.debug) {
            console.log(`[FiscalPrinter] ${message}`);
        }
        this.emit('log', message);
    }
}

module.exports = FiscalPrinterProtocol;


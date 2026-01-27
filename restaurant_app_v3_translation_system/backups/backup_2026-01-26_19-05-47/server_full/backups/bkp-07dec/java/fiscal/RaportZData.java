package fiscal;

/**
 * Clasa de date pentru popularea șablonului Raport Z
 * Conține toate datele necesare pentru generarea raportului de închidere fiscală
 */
public class RaportZData {
    
    // Date firma
    private String denumireFirma;
    private String cui;
    private String adresaPunct;
    private String nrAparatFiscal;
    private String numarRaportZ;
    private String dataRaport;
    private String oraInchidere;
    private String dataCurenta;
    private String oraCurenta;
    private String operatorCurent;
    
    // Date TVA
    private String baza11; // Bază TVA 11%
    private String tva11; // TVA 11%
    private String total11; // Total cu TVA 11%
    private String baza21; // Bază TVA 21%
    private String tva21; // TVA 21%
    private String total21; // Total cu TVA 21%
    private String baza0; // Bază TVA 0%
    private String tva0; // TVA 0% (întotdeauna 0)
    private String total0; // Total cu TVA 0%
    private String totalGeneralBrut; // Total general
    
    // Date încasări
    private String incasariCash;
    private String incasariCard;
    private String incasariVoucher;
    
    // Indicatori
    private int nrBonuriEmise;
    private int nrAnulari;
    private String sumaAnulata;
    private String bonMax;
    private String bonMin;
    
    // Meta
    private String checksumSha256;
    
    // Constructors
    public RaportZData() {}
    
    public RaportZData(String denumireFirma, String cui, String adresaPunct, 
                       String nrAparatFiscal, String numarRaportZ, String dataRaport,
                       String oraInchidere, String dataCurenta, String oraCurenta, 
                       String operatorCurent, String baza11, String tva11, String total11,
                       String baza21, String tva21, String total21,
                       String baza0, String tva0, String total0, String totalGeneralBrut,
                       String incasariCash, String incasariCard, String incasariVoucher,
                       int nrBonuriEmise, int nrAnulari, String sumaAnulata,
                       String bonMax, String bonMin, String checksumSha256) {
        this.denumireFirma = denumireFirma;
        this.cui = cui;
        this.adresaPunct = adresaPunct;
        this.nrAparatFiscal = nrAparatFiscal;
        this.numarRaportZ = numarRaportZ;
        this.dataRaport = dataRaport;
        this.oraInchidere = oraInchidere;
        this.dataCurenta = dataCurenta;
        this.oraCurenta = oraCurenta;
        this.operatorCurent = operatorCurent;
        this.baza11 = baza11;
        this.tva11 = tva11;
        this.total11 = total11;
        this.baza21 = baza21;
        this.tva21 = tva21;
        this.total21 = total21;
        this.baza0 = baza0;
        this.tva0 = tva0;
        this.total0 = total0;
        this.totalGeneralBrut = totalGeneralBrut;
        this.incasariCash = incasariCash;
        this.incasariCard = incasariCard;
        this.incasariVoucher = incasariVoucher;
        this.nrBonuriEmise = nrBonuriEmise;
        this.nrAnulari = nrAnulari;
        this.sumaAnulata = sumaAnulata;
        this.bonMax = bonMax;
        this.bonMin = bonMin;
        this.checksumSha256 = checksumSha256;
    }
    
    // Getters and Setters
    public String getDenumireFirma() { return denumireFirma; }
    public void setDenumireFirma(String denumireFirma) { this.denumireFirma = denumireFirma; }
    
    public String getCui() { return cui; }
    public void setCui(String cui) { this.cui = cui; }
    
    public String getAdresaPunct() { return adresaPunct; }
    public void setAdresaPunct(String adresaPunct) { this.adresaPunct = adresaPunct; }
    
    public String getNrAparatFiscal() { return nrAparatFiscal; }
    public void setNrAparatFiscal(String nrAparatFiscal) { this.nrAparatFiscal = nrAparatFiscal; }
    
    public String getNumarRaportZ() { return numarRaportZ; }
    public void setNumarRaportZ(String numarRaportZ) { this.numarRaportZ = numarRaportZ; }
    
    public String getDataRaport() { return dataRaport; }
    public void setDataRaport(String dataRaport) { this.dataRaport = dataRaport; }
    
    public String getOraInchidere() { return oraInchidere; }
    public void setOraInchidere(String oraInchidere) { this.oraInchidere = oraInchidere; }
    
    public String getDataCurenta() { return dataCurenta; }
    public void setDataCurenta(String dataCurenta) { this.dataCurenta = dataCurenta; }
    
    public String getOraCurenta() { return oraCurenta; }
    public void setOraCurenta(String oraCurenta) { this.oraCurenta = oraCurenta; }
    
    public String getOperatorCurent() { return operatorCurent; }
    public void setOperatorCurent(String operatorCurent) { this.operatorCurent = operatorCurent; }
    
    public String getBaza11() { return baza11; }
    public void setBaza11(String baza11) { this.baza11 = baza11; }
    
    public String getTva11() { return tva11; }
    public void setTva11(String tva11) { this.tva11 = tva11; }
    
    public String getTotal11() { return total11; }
    public void setTotal11(String total11) { this.total11 = total11; }
    
    public String getBaza21() { return baza21; }
    public void setBaza21(String baza21) { this.baza21 = baza21; }
    
    public String getTva21() { return tva21; }
    public void setTva21(String tva21) { this.tva21 = tva21; }
    
    public String getTotal21() { return total21; }
    public void setTotal21(String total21) { this.total21 = total21; }
    
    public String getBaza0() { return baza0; }
    public void setBaza0(String baza0) { this.baza0 = baza0; }
    
    public String getTva0() { return tva0; }
    public void setTva0(String tva0) { this.tva0 = tva0; }
    
    public String getTotal0() { return total0; }
    public void setTotal0(String total0) { this.total0 = total0; }
    
    public String getTotalGeneralBrut() { return totalGeneralBrut; }
    public void setTotalGeneralBrut(String totalGeneralBrut) { this.totalGeneralBrut = totalGeneralBrut; }
    
    public String getIncasariCash() { return incasariCash; }
    public void setIncasariCash(String incasariCash) { this.incasariCash = incasariCash; }
    
    public String getIncasariCard() { return incasariCard; }
    public void setIncasariCard(String incasariCard) { this.incasariCard = incasariCard; }
    
    public String getIncasariVoucher() { return incasariVoucher; }
    public void setIncasariVoucher(String incasariVoucher) { this.incasariVoucher = incasariVoucher; }
    
    public int getNrBonuriEmise() { return nrBonuriEmise; }
    public void setNrBonuriEmise(int nrBonuriEmise) { this.nrBonuriEmise = nrBonuriEmise; }
    
    public int getNrAnulari() { return nrAnulari; }
    public void setNrAnulari(int nrAnulari) { this.nrAnulari = nrAnulari; }
    
    public String getSumaAnulata() { return sumaAnulata; }
    public void setSumaAnulata(String sumaAnulata) { this.sumaAnulata = sumaAnulata; }
    
    public String getBonMax() { return bonMax; }
    public void setBonMax(String bonMax) { this.bonMax = bonMax; }
    
    public String getBonMin() { return bonMin; }
    public void setBonMin(String bonMin) { this.bonMin = bonMin; }
    
    public String getChecksumSha256() { return checksumSha256; }
    public void setChecksumSha256(String checksumSha256) { this.checksumSha256 = checksumSha256; }
}

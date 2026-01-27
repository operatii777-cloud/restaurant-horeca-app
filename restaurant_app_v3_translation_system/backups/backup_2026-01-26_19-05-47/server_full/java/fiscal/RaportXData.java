package fiscal;

/**
 * POJO pentru datele Raportului X (intermediar)
 * Conține toate datele necesare pentru afișarea raportului intermediar
 */
public class RaportXData {
    
    // Date firma
    private String denumireFirma;
    private String cui;
    private String adresaPunct;
    
    // Date curente
    private String dataCurenta;
    private String oraCurenta;
    private String operatorCurent;
    
    // Date TVA 11%
    private String baza11;
    private String tva11;
    private String total11;
    
    // Date TVA 21%
    private String baza21;
    private String tva21;
    private String total21;
    
    // Date TVA 0%
    private String baza0;
    private String tva0;
    private String total0;
    
    // Total general
    private String totalGeneralBrut;
    
    // Date încasări
    private String incasariCash;
    private String incasariCard;
    private String incasariVoucher;
    
    // Indicatori
    private int nrBonuriEmise;
    
    // Constructors
    public RaportXData() {}
    
    public RaportXData(String denumireFirma, String cui, String adresaPunct) {
        this.denumireFirma = denumireFirma;
        this.cui = cui;
        this.adresaPunct = adresaPunct;
    }
    
    // Getters and Setters
    public String getDenumireFirma() { return denumireFirma; }
    public void setDenumireFirma(String denumireFirma) { this.denumireFirma = denumireFirma; }
    
    public String getCui() { return cui; }
    public void setCui(String cui) { this.cui = cui; }
    
    public String getAdresaPunct() { return adresaPunct; }
    public void setAdresaPunct(String adresaPunct) { this.adresaPunct = adresaPunct; }
    
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
    
    @Override
    public String toString() {
        return "RaportXData{" +
                "denumireFirma='" + denumireFirma + '\'' +
                ", cui='" + cui + '\'' +
                ", dataCurenta='" + dataCurenta + '\'' +
                ", oraCurenta='" + oraCurenta + '\'' +
                ", totalGeneralBrut='" + totalGeneralBrut + '\'' +
                ", nrBonuriEmise=" + nrBonuriEmise +
                '}';
    }
}
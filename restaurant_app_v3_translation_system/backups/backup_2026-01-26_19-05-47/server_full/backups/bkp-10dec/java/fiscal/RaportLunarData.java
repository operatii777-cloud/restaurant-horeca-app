package fiscal;

/**
 * POJO pentru datele Raportului Lunar
 * Conține toate datele necesare pentru raportul lunar agregat
 */
public class RaportLunarData {
    
    // Date firma
    private String denumireFirma;
    private String cui;
    private String lunaAn;
    private String lunaNume;
    private String an;
    
    // Date curente
    private String dataGenerare;
    private String oraGenerare;
    
    // Totaluri lunare
    private String lunaTotalBrut;
    private int lunaNrBonuri;
    private int lunaZileLucratoare;
    private String lunaMedieZilnica;
    
    // TVA lunară
    private String lunaBaza11;
    private String lunaTotalTva11;
    private String lunaTotal11;
    private String lunaBaza21;
    private String lunaTotalTva21;
    private String lunaTotal21;
    private String lunaBaza0;
    private String lunaTotalTva0;
    private String lunaTotal0;
    
    // Încasări lunare
    private String lunaTotalCash;
    private String lunaTotalCard;
    private String lunaTotalVoucher;
    
    // Procente
    private String procentCash;
    private String procentCard;
    
    // Tabele HTML
    private String tabelZilnic;
    private String tabelRapoarteZ;
    
    // Checksum
    private String checksumRaport;
    
    // Constructors
    public RaportLunarData() {}
    
    public RaportLunarData(String denumireFirma, String cui, String lunaAn) {
        this.denumireFirma = denumireFirma;
        this.cui = cui;
        this.lunaAn = lunaAn;
    }
    
    // Getters and Setters
    public String getDenumireFirma() { return denumireFirma; }
    public void setDenumireFirma(String denumireFirma) { this.denumireFirma = denumireFirma; }
    
    public String getCui() { return cui; }
    public void setCui(String cui) { this.cui = cui; }
    
    public String getLunaAn() { return lunaAn; }
    public void setLunaAn(String lunaAn) { this.lunaAn = lunaAn; }
    
    public String getLunaNume() { return lunaNume; }
    public void setLunaNume(String lunaNume) { this.lunaNume = lunaNume; }
    
    public String getAn() { return an; }
    public void setAn(String an) { this.an = an; }
    
    public String getDataGenerare() { return dataGenerare; }
    public void setDataGenerare(String dataGenerare) { this.dataGenerare = dataGenerare; }
    
    public String getOraGenerare() { return oraGenerare; }
    public void setOraGenerare(String oraGenerare) { this.oraGenerare = oraGenerare; }
    
    public String getLunaTotalBrut() { return lunaTotalBrut; }
    public void setLunaTotalBrut(String lunaTotalBrut) { this.lunaTotalBrut = lunaTotalBrut; }
    
    public int getLunaNrBonuri() { return lunaNrBonuri; }
    public void setLunaNrBonuri(int lunaNrBonuri) { this.lunaNrBonuri = lunaNrBonuri; }
    
    public int getLunaZileLucratoare() { return lunaZileLucratoare; }
    public void setLunaZileLucratoare(int lunaZileLucratoare) { this.lunaZileLucratoare = lunaZileLucratoare; }
    
    public String getLunaMedieZilnica() { return lunaMedieZilnica; }
    public void setLunaMedieZilnica(String lunaMedieZilnica) { this.lunaMedieZilnica = lunaMedieZilnica; }
    
    public String getLunaBaza11() { return lunaBaza11; }
    public void setLunaBaza11(String lunaBaza11) { this.lunaBaza11 = lunaBaza11; }
    
    public String getLunaTotalTva11() { return lunaTotalTva11; }
    public void setLunaTotalTva11(String lunaTotalTva11) { this.lunaTotalTva11 = lunaTotalTva11; }
    
    public String getLunaTotal11() { return lunaTotal11; }
    public void setLunaTotal11(String lunaTotal11) { this.lunaTotal11 = lunaTotal11; }
    
    public String getLunaBaza21() { return lunaBaza21; }
    public void setLunaBaza21(String lunaBaza21) { this.lunaBaza21 = lunaBaza21; }
    
    public String getLunaTotalTva21() { return lunaTotalTva21; }
    public void setLunaTotalTva21(String lunaTotalTva21) { this.lunaTotalTva21 = lunaTotalTva21; }
    
    public String getLunaTotal21() { return lunaTotal21; }
    public void setLunaTotal21(String lunaTotal21) { this.lunaTotal21 = lunaTotal21; }
    
    public String getLunaBaza0() { return lunaBaza0; }
    public void setLunaBaza0(String lunaBaza0) { this.lunaBaza0 = lunaBaza0; }
    
    public String getLunaTotalTva0() { return lunaTotalTva0; }
    public void setLunaTotalTva0(String lunaTotalTva0) { this.lunaTotalTva0 = lunaTotalTva0; }
    
    public String getLunaTotal0() { return lunaTotal0; }
    public void setLunaTotal0(String lunaTotal0) { this.lunaTotal0 = lunaTotal0; }
    
    public String getLunaTotalCash() { return lunaTotalCash; }
    public void setLunaTotalCash(String lunaTotalCash) { this.lunaTotalCash = lunaTotalCash; }
    
    public String getLunaTotalCard() { return lunaTotalCard; }
    public void setLunaTotalCard(String lunaTotalCard) { this.lunaTotalCard = lunaTotalCard; }
    
    public String getLunaTotalVoucher() { return lunaTotalVoucher; }
    public void setLunaTotalVoucher(String lunaTotalVoucher) { this.lunaTotalVoucher = lunaTotalVoucher; }
    
    public String getProcentCash() { return procentCash; }
    public void setProcentCash(String procentCash) { this.procentCash = procentCash; }
    
    public String getProcentCard() { return procentCard; }
    public void setProcentCard(String procentCard) { this.procentCard = procentCard; }
    
    public String getTabelZilnic() { return tabelZilnic; }
    public void setTabelZilnic(String tabelZilnic) { this.tabelZilnic = tabelZilnic; }
    
    public String getTabelRapoarteZ() { return tabelRapoarteZ; }
    public void setTabelRapoarteZ(String tabelRapoarteZ) { this.tabelRapoarteZ = tabelRapoarteZ; }
    
    public String getChecksumRaport() { return checksumRaport; }
    public void setChecksumRaport(String checksumRaport) { this.checksumRaport = checksumRaport; }
    
    @Override
    public String toString() {
        return "RaportLunarData{" +
                "denumireFirma='" + denumireFirma + '\'' +
                ", cui='" + cui + '\'' +
                ", lunaAn='" + lunaAn + '\'' +
                ", lunaTotalBrut='" + lunaTotalBrut + '\'' +
                ", lunaNrBonuri=" + lunaNrBonuri +
                ", lunaZileLucratoare=" + lunaZileLucratoare +
                '}';
    }
}
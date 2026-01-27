package fiscal;

/**
 * Clasa SumarZi pentru o singură zi din raportul lunar
 * Reprezintă agregarea unui Raport Z
 */
public class SumarZi {

    private String data; // Ex: "2025-10-07"
    private int numarRaportZ; // Nr. Raport Z aferent
    private int bonuriEmise;
    
    private String totalBrut; // Suma totală brută a zilei (cu TVA)
    private String totalTVA11; // Total TVA colectată la cota 11%
    private String totalTVA21; // Total TVA colectată la cota 21%
    private String totalTVA0; // Total TVA la cota 0%

    private String incasariCash;
    private String incasariCard;
    private String incasariVoucher;
    
    private String bonMax;
    private String bonMin;
    private String medieBon;
    
    // Constructors
    public SumarZi() {}
    
    public SumarZi(String data, int numarRaportZ, int bonuriEmise, String totalBrut, 
                   String totalTVA11, String totalTVA21, String totalTVA0,
                   String incasariCash, String incasariCard, String incasariVoucher,
                   String bonMax, String bonMin, String medieBon) {
        this.data = data;
        this.numarRaportZ = numarRaportZ;
        this.bonuriEmise = bonuriEmise;
        this.totalBrut = totalBrut;
        this.totalTVA11 = totalTVA11;
        this.totalTVA21 = totalTVA21;
        this.totalTVA0 = totalTVA0;
        this.incasariCash = incasariCash;
        this.incasariCard = incasariCard;
        this.incasariVoucher = incasariVoucher;
        this.bonMax = bonMax;
        this.bonMin = bonMin;
        this.medieBon = medieBon;
    }
    
    // Getters and Setters
    public String getData() {
        return data;
    }
    
    public void setData(String data) {
        this.data = data;
    }
    
    public int getNumarRaportZ() {
        return numarRaportZ;
    }
    
    public void setNumarRaportZ(int numarRaportZ) {
        this.numarRaportZ = numarRaportZ;
    }
    
    public int getBonuriEmise() {
        return bonuriEmise;
    }
    
    public void setBonuriEmise(int bonuriEmise) {
        this.bonuriEmise = bonuriEmise;
    }
    
    public String getTotalBrut() {
        return totalBrut;
    }
    
    public void setTotalBrut(String totalBrut) {
        this.totalBrut = totalBrut;
    }
    
    public String getTotalTVA11() {
        return totalTVA11;
    }
    
    public void setTotalTVA11(String totalTVA11) {
        this.totalTVA11 = totalTVA11;
    }
    
    public String getTotalTVA21() {
        return totalTVA21;
    }
    
    public void setTotalTVA21(String totalTVA21) {
        this.totalTVA21 = totalTVA21;
    }
    
    public String getTotalTVA0() {
        return totalTVA0;
    }
    
    public void setTotalTVA0(String totalTVA0) {
        this.totalTVA0 = totalTVA0;
    }
    
    public String getIncasariCash() {
        return incasariCash;
    }
    
    public void setIncasariCash(String incasariCash) {
        this.incasariCash = incasariCash;
    }
    
    public String getIncasariCard() {
        return incasariCard;
    }
    
    public void setIncasariCard(String incasariCard) {
        this.incasariCard = incasariCard;
    }
    
    public String getIncasariVoucher() {
        return incasariVoucher;
    }
    
    public void setIncasariVoucher(String incasariVoucher) {
        this.incasariVoucher = incasariVoucher;
    }
    
    public String getBonMax() {
        return bonMax;
    }
    
    public void setBonMax(String bonMax) {
        this.bonMax = bonMax;
    }
    
    public String getBonMin() {
        return bonMin;
    }
    
    public void setBonMin(String bonMin) {
        this.bonMin = bonMin;
    }
    
    public String getMedieBon() {
        return medieBon;
    }
    
    public void setMedieBon(String medieBon) {
        this.medieBon = medieBon;
    }
}

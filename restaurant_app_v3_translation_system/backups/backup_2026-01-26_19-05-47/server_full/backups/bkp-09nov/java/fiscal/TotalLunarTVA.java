package fiscal;

/**
 * Clasa TotalLunarTVA pentru totalurile agregate pe cote TVA
 * Consolidează totalurile pentru întreaga lună
 */
public class TotalLunarTVA {
    
    private String totalBaza; // Total bază fără TVA
    private String totalTVA; // Total TVA colectată
    private String totalBrut; // Total cu TVA
    
    // Detalii pe cote
    private TotalCota cota11; 
    private TotalCota cota21;
    private TotalCota cota0;
    
    // Constructors
    public TotalLunarTVA() {}
    
    public TotalLunarTVA(String totalBaza, String totalTVA, String totalBrut, 
                         TotalCota cota11, TotalCota cota21, TotalCota cota0) {
        this.totalBaza = totalBaza;
        this.totalTVA = totalTVA;
        this.totalBrut = totalBrut;
        this.cota11 = cota11;
        this.cota21 = cota21;
        this.cota0 = cota0;
    }
    
    // Getters and Setters
    public String getTotalBaza() {
        return totalBaza;
    }
    
    public void setTotalBaza(String totalBaza) {
        this.totalBaza = totalBaza;
    }
    
    public String getTotalTVA() {
        return totalTVA;
    }
    
    public void setTotalTVA(String totalTVA) {
        this.totalTVA = totalTVA;
    }
    
    public String getTotalBrut() {
        return totalBrut;
    }
    
    public void setTotalBrut(String totalBrut) {
        this.totalBrut = totalBrut;
    }
    
    public TotalCota getCota11() {
        return cota11;
    }
    
    public void setCota11(TotalCota cota11) {
        this.cota11 = cota11;
    }
    
    public TotalCota getCota21() {
        return cota21;
    }
    
    public void setCota21(TotalCota cota21) {
        this.cota21 = cota21;
    }
    
    public TotalCota getCota0() {
        return cota0;
    }
    
    public void setCota0(TotalCota cota0) {
        this.cota0 = cota0;
    }
}

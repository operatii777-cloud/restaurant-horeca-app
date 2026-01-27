package fiscal;

/**
 * Clasa TotalCota pentru o cotă de TVA în raportul lunar
 * Conține totalurile pentru o cotă specifică
 */
public class TotalCota {
    
    private int procent; // 11, 21 sau 0
    private String baza; // Total bază fără TVA
    private String tva; // Total TVA
    private String totalCuTVA; // Total cu TVA
    
    // Constructors
    public TotalCota() {}
    
    public TotalCota(int procent, String baza, String tva, String totalCuTVA) {
        this.procent = procent;
        this.baza = baza;
        this.tva = tva;
        this.totalCuTVA = totalCuTVA;
    }
    
    // Getters and Setters
    public int getProcent() {
        return procent;
    }
    
    public void setProcent(int procent) {
        this.procent = procent;
    }
    
    public String getBaza() {
        return baza;
    }
    
    public void setBaza(String baza) {
        this.baza = baza;
    }
    
    public String getTva() {
        return tva;
    }
    
    public void setTva(String tva) {
        this.tva = tva;
    }
    
    public String getTotalCuTVA() {
        return totalCuTVA;
    }
    
    public void setTotalCuTVA(String totalCuTVA) {
        this.totalCuTVA = totalCuTVA;
    }
}

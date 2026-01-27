package fiscal;

/**
 * Clasa TotalIncasari pentru totalurile lunare pe metode de plată
 * Conține sumele totale încasate în lună
 */
public class TotalIncasari {
    
    private String totalCash; // Total cash în lună
    private String totalCard; // Total card în lună
    private String totalVoucher; // Total vouchere în lună
    private String totalGeneral; // Total general încasări
    
    // Constructors
    public TotalIncasari() {}
    
    public TotalIncasari(String totalCash, String totalCard, String totalVoucher, String totalGeneral) {
        this.totalCash = totalCash;
        this.totalCard = totalCard;
        this.totalVoucher = totalVoucher;
        this.totalGeneral = totalGeneral;
    }
    
    // Getters and Setters
    public String getTotalCash() {
        return totalCash;
    }
    
    public void setTotalCash(String totalCash) {
        this.totalCash = totalCash;
    }
    
    public String getTotalCard() {
        return totalCard;
    }
    
    public void setTotalCard(String totalCard) {
        this.totalCard = totalCard;
    }
    
    public String getTotalVoucher() {
        return totalVoucher;
    }
    
    public void setTotalVoucher(String totalVoucher) {
        this.totalVoucher = totalVoucher;
    }
    
    public String getTotalGeneral() {
        return totalGeneral;
    }
    
    public void setTotalGeneral(String totalGeneral) {
        this.totalGeneral = totalGeneral;
    }
}

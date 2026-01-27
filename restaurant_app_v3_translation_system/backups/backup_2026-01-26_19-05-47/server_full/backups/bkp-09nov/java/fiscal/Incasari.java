package fiscal;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Clasa Incasari pentru totalurile pe metode de plată
 * Conține sumele încasate pe cash, card și vouchere
 */
public class Incasari {
    
    @JsonProperty("Cash")
    private String cash; // "1450.00"
    
    @JsonProperty("Card")
    private String card; // "720.00"
    
    @JsonProperty("Voucher")
    private String voucher; // "80.00"
    
    @JsonProperty("TotalZi")
    private String totalZi; // "2250.00"
    
    // Constructors
    public Incasari() {}
    
    public Incasari(String cash, String card, String voucher, String totalZi) {
        this.cash = cash;
        this.card = card;
        this.voucher = voucher;
        this.totalZi = totalZi;
    }
    
    // Getters and Setters
    public String getCash() {
        return cash;
    }
    
    public void setCash(String cash) {
        this.cash = cash;
    }
    
    public String getCard() {
        return card;
    }
    
    public void setCard(String card) {
        this.card = card;
    }
    
    public String getVoucher() {
        return voucher;
    }
    
    public void setVoucher(String voucher) {
        this.voucher = voucher;
    }
    
    public String getTotalZi() {
        return totalZi;
    }
    
    public void setTotalZi(String totalZi) {
        this.totalZi = totalZi;
    }
}

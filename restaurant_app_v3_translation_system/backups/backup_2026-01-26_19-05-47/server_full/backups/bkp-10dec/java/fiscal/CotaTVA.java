package fiscal;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

/**
 * Clasa CotaTVA pentru o singură cotă de TVA
 * Conține procentul și valorile asociate (bază, TVA, total)
 */
public class CotaTVA {
    
    @JacksonXmlProperty(isAttribute = true)
    private int procent; // 11, 21 sau 0
    
    @JsonProperty("Baza")
    private String baza; // Valoarea fără TVA (ex: "500.00")
    
    @JsonProperty("TVA")
    private String tva; // Valoarea TVA (ex: "55.00")
    
    @JsonProperty("Total")
    private String total; // Valoarea cu TVA (ex: "555.00")
    
    // Constructors
    public CotaTVA() {}
    
    public CotaTVA(int procent, String baza, String tva, String total) {
        this.procent = procent;
        this.baza = baza;
        this.tva = tva;
        this.total = total;
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
    
    public String getTotal() {
        return total;
    }
    
    public void setTotal(String total) {
        this.total = total;
    }
}

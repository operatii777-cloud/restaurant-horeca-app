package fiscal;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Clasa Indicatori pentru indicatorii cheie ai zilei fiscale
 * Conține numărul de bonuri, anulări și alte statistici
 */
public class Indicatori {
    
    @JsonProperty("NumarBonuri")
    private int numarBonuri; // 87
    
    @JsonProperty("NumarAnulari")
    private int numarAnulari; // 2
    
    @JsonProperty("SumaAnulari")
    private String sumaAnulari; // "15.00"
    
    @JsonProperty("BonMax")
    private String bonMax; // "450.00"
    
    @JsonProperty("BonMin")
    private String bonMin; // "15.50"
    
    @JsonProperty("MedieBon")
    private String medieBon; // "25.86"
    
    // Constructors
    public Indicatori() {}
    
    public Indicatori(int numarBonuri, int numarAnulari, String sumaAnulari, 
                      String bonMax, String bonMin, String medieBon) {
        this.numarBonuri = numarBonuri;
        this.numarAnulari = numarAnulari;
        this.sumaAnulari = sumaAnulari;
        this.bonMax = bonMax;
        this.bonMin = bonMin;
        this.medieBon = medieBon;
    }
    
    // Getters and Setters
    public int getNumarBonuri() {
        return numarBonuri;
    }
    
    public void setNumarBonuri(int numarBonuri) {
        this.numarBonuri = numarBonuri;
    }
    
    public int getNumarAnulari() {
        return numarAnulari;
    }
    
    public void setNumarAnulari(int numarAnulari) {
        this.numarAnulari = numarAnulari;
    }
    
    public String getSumaAnulari() {
        return sumaAnulari;
    }
    
    public void setSumaAnulari(String sumaAnulari) {
        this.sumaAnulari = sumaAnulari;
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

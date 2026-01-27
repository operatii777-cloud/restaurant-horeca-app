package fiscal;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Clasa Header pentru antetul fiscal al Raportului Z
 * Conține datele de identificare ale firmei și raportului
 */
public class Header {
    
    @JsonProperty("DenumireFurnizor")
    private String denumireFurnizor; // SC EXEMPLU SRL
    
    @JsonProperty("CUI")
    private String cui; // RO12345678
    
    @JsonProperty("Adresa")
    private String adresa; // Adresa punct de lucru
    
    @JsonProperty("NrRegistru")
    private String nrRegistru; // Nr. aparat fiscal / soft
    
    @JsonProperty("NumarRaport")
    private String numarRaport; // Z000123
    
    @JsonProperty("Data")
    private String data; // YYYY-MM-DD
    
    @JsonProperty("Ora")
    private String ora; // HH:MM:SS
    
    @JsonProperty("Operator")
    private String operator; // Operatorul care a făcut închiderea
    
    // Constructors
    public Header() {}
    
    public Header(String denumireFurnizor, String cui, String adresa, 
                  String nrRegistru, String numarRaport, String data, 
                  String ora, String operator) {
        this.denumireFurnizor = denumireFurnizor;
        this.cui = cui;
        this.adresa = adresa;
        this.nrRegistru = nrRegistru;
        this.numarRaport = numarRaport;
        this.data = data;
        this.ora = ora;
        this.operator = operator;
    }
    
    // Getters and Setters
    public String getDenumireFurnizor() {
        return denumireFurnizor;
    }
    
    public void setDenumireFurnizor(String denumireFurnizor) {
        this.denumireFurnizor = denumireFurnizor;
    }
    
    public String getCui() {
        return cui;
    }
    
    public void setCui(String cui) {
        this.cui = cui;
    }
    
    public String getAdresa() {
        return adresa;
    }
    
    public void setAdresa(String adresa) {
        this.adresa = adresa;
    }
    
    public String getNrRegistru() {
        return nrRegistru;
    }
    
    public void setNrRegistru(String nrRegistru) {
        this.nrRegistru = nrRegistru;
    }
    
    public String getNumarRaport() {
        return numarRaport;
    }
    
    public void setNumarRaport(String numarRaport) {
        this.numarRaport = numarRaport;
    }
    
    public String getData() {
        return data;
    }
    
    public void setData(String data) {
        this.data = data;
    }
    
    public String getOra() {
        return ora;
    }
    
    public void setOra(String ora) {
        this.ora = ora;
    }
    
    public String getOperator() {
        return operator;
    }
    
    public void setOperator(String operator) {
        this.operator = operator;
    }
}

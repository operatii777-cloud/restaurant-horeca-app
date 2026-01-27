package fiscal;

import java.util.List;

/**
 * Clasa principală pentru Raportul Lunar
 * Conține agregarea tuturor rapoartelor Z dintr-o lună
 */
public class RaportLunar {

    // Date de identificare companie
    private String denumireFirma;
    private String cui;
    private String lunaAn; // Format: "Octombrie 2025"

    // Sumarul pe cote TVA pentru întreaga lună
    private TotalLunarTVA totalTVA; 

    // Lista cu toate rapoartele Z agregate (1-31)
    private List<SumarZi> sumarZilnic;

    // Totaluri finale pe metode de plată (pentru Registrul de Casă)
    private TotalIncasari totalIncasari;
    
    // Indicatori de performanță
    private IndicatoriPerformanta indicatoriPerformanta;
    
    // Constructors
    public RaportLunar() {}
    
    public RaportLunar(String denumireFirma, String cui, String lunaAn, 
                       TotalLunarTVA totalTVA, List<SumarZi> sumarZilnic, 
                       TotalIncasari totalIncasari, IndicatoriPerformanta indicatoriPerformanta) {
        this.denumireFirma = denumireFirma;
        this.cui = cui;
        this.lunaAn = lunaAn;
        this.totalTVA = totalTVA;
        this.sumarZilnic = sumarZilnic;
        this.totalIncasari = totalIncasari;
        this.indicatoriPerformanta = indicatoriPerformanta;
    }
    
    // Getters and Setters
    public String getDenumireFirma() {
        return denumireFirma;
    }
    
    public void setDenumireFirma(String denumireFirma) {
        this.denumireFirma = denumireFirma;
    }
    
    public String getCui() {
        return cui;
    }
    
    public void setCui(String cui) {
        this.cui = cui;
    }
    
    public String getLunaAn() {
        return lunaAn;
    }
    
    public void setLunaAn(String lunaAn) {
        this.lunaAn = lunaAn;
    }
    
    public TotalLunarTVA getTotalTVA() {
        return totalTVA;
    }
    
    public void setTotalTVA(TotalLunarTVA totalTVA) {
        this.totalTVA = totalTVA;
    }
    
    public List<SumarZi> getSumarZilnic() {
        return sumarZilnic;
    }
    
    public void setSumarZilnic(List<SumarZi> sumarZilnic) {
        this.sumarZilnic = sumarZilnic;
    }
    
    public TotalIncasari getTotalIncasari() {
        return totalIncasari;
    }
    
    public void setTotalIncasari(TotalIncasari totalIncasari) {
        this.totalIncasari = totalIncasari;
    }
    
    public IndicatoriPerformanta getIndicatoriPerformanta() {
        return indicatoriPerformanta;
    }
    
    public void setIndicatoriPerformanta(IndicatoriPerformanta indicatoriPerformanta) {
        this.indicatoriPerformanta = indicatoriPerformanta;
    }
}

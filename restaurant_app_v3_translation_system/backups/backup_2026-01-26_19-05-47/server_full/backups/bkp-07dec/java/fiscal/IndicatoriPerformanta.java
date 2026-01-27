package fiscal;

/**
 * Clasa IndicatoriPerformanta pentru indicatorii de performanță lunară
 * Conține statistici și analize pentru luna respectivă
 */
public class IndicatoriPerformanta {
    
    private String ziMaxVanzari; // Cea mai bună zi
    private String dataZiMax; // Data celei mai bune zile
    private String ziMinVanzari; // Cea mai slabă zi
    private String dataZiMin; // Data celei mai slabe zile
    private String medieBon; // Media bonului
    private String procentCash; // Procentul cash din total
    private String procentCard; // Procentul card din total
    private int zileLucratoare; // Numărul de zile lucrătoare
    private String medieZilnica; // Media zilnică de vânzări
    
    // Constructors
    public IndicatoriPerformanta() {}
    
    public IndicatoriPerformanta(String ziMaxVanzari, String dataZiMax, String ziMinVanzari, 
                                 String dataZiMin, String medieBon, String procentCash, 
                                 String procentCard, int zileLucratoare, String medieZilnica) {
        this.ziMaxVanzari = ziMaxVanzari;
        this.dataZiMax = dataZiMax;
        this.ziMinVanzari = ziMinVanzari;
        this.dataZiMin = dataZiMin;
        this.medieBon = medieBon;
        this.procentCash = procentCash;
        this.procentCard = procentCard;
        this.zileLucratoare = zileLucratoare;
        this.medieZilnica = medieZilnica;
    }
    
    // Getters and Setters
    public String getZiMaxVanzari() {
        return ziMaxVanzari;
    }
    
    public void setZiMaxVanzari(String ziMaxVanzari) {
        this.ziMaxVanzari = ziMaxVanzari;
    }
    
    public String getDataZiMax() {
        return dataZiMax;
    }
    
    public void setDataZiMax(String dataZiMax) {
        this.dataZiMax = dataZiMax;
    }
    
    public String getZiMinVanzari() {
        return ziMinVanzari;
    }
    
    public void setZiMinVanzari(String ziMinVanzari) {
        this.ziMinVanzari = ziMinVanzari;
    }
    
    public String getDataZiMin() {
        return dataZiMin;
    }
    
    public void setDataZiMin(String dataZiMin) {
        this.dataZiMin = dataZiMin;
    }
    
    public String getMedieBon() {
        return medieBon;
    }
    
    public void setMedieBon(String medieBon) {
        this.medieBon = medieBon;
    }
    
    public String getProcentCash() {
        return procentCash;
    }
    
    public void setProcentCash(String procentCash) {
        this.procentCash = procentCash;
    }
    
    public String getProcentCard() {
        return procentCard;
    }
    
    public void setProcentCard(String procentCard) {
        this.procentCard = procentCard;
    }
    
    public int getZileLucratoare() {
        return zileLucratoare;
    }
    
    public void setZileLucratoare(int zileLucratoare) {
        this.zileLucratoare = zileLucratoare;
    }
    
    public String getMedieZilnica() {
        return medieZilnica;
    }
    
    public void setMedieZilnica(String medieZilnica) {
        this.medieZilnica = medieZilnica;
    }
}

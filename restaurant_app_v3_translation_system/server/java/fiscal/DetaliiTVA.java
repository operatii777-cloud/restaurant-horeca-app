package fiscal;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Clasa DetaliiTVA pentru defalcarea vânzărilor pe cote TVA
 * Conține lista de cote TVA (11%, 21%, 0%)
 */
public class DetaliiTVA {
    
    @JsonProperty("CotaTVA")
    private List<CotaTVA> coteTVA;
    
    // Constructors
    public DetaliiTVA() {}
    
    public DetaliiTVA(List<CotaTVA> coteTVA) {
        this.coteTVA = coteTVA;
    }
    
    // Getters and Setters
    public List<CotaTVA> getCoteTVA() {
        return coteTVA;
    }
    
    public void setCoteTVA(List<CotaTVA> coteTVA) {
        this.coteTVA = coteTVA;
    }
}

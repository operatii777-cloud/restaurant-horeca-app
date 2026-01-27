package fiscal;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

/**
 * Clasa principală pentru Raportul Z conform OPANAF 146/2018
 * Reprezintă documentul XML pentru închiderea fiscală zilnică
 */
@JacksonXmlRootElement(localName = "RaportZ", namespace = "urn:anaf:rapoarte:opanaf146:2018")
public class RaportZ {

    @JsonProperty("Header")
    private Header header;

    @JsonProperty("DetaliiTVA")
    private DetaliiTVA detaliiTVA;

    @JsonProperty("Incasari")
    private Incasari incasari;

    @JsonProperty("Indicatori")
    private Indicatori indicatori;

    @JsonProperty("Meta")
    private Meta meta;
    
    // Constructors
    public RaportZ() {}
    
    public RaportZ(Header header, DetaliiTVA detaliiTVA, Incasari incasari, 
                   Indicatori indicatori, Meta meta) {
        this.header = header;
        this.detaliiTVA = detaliiTVA;
        this.incasari = incasari;
        this.indicatori = indicatori;
        this.meta = meta;
    }
    
    // Getters and Setters
    public Header getHeader() {
        return header;
    }
    
    public void setHeader(Header header) {
        this.header = header;
    }
    
    public DetaliiTVA getDetaliiTVA() {
        return detaliiTVA;
    }
    
    public void setDetaliiTVA(DetaliiTVA detaliiTVA) {
        this.detaliiTVA = detaliiTVA;
    }
    
    public Incasari getIncasari() {
        return incasari;
    }
    
    public void setIncasari(Incasari incasari) {
        this.incasari = incasari;
    }
    
    public Indicatori getIndicatori() {
        return indicatori;
    }
    
    public void setIndicatori(Indicatori indicatori) {
        this.indicatori = indicatori;
    }
    
    public Meta getMeta() {
        return meta;
    }
    
    public void setMeta(Meta meta) {
        this.meta = meta;
    }
}

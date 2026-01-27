package fiscal;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;

/**
 * Clasa Checksum pentru integritatea documentului
 * Conține algoritmul și valoarea hash-ului
 */
public class Checksum {
    
    @JacksonXmlProperty(isAttribute = true)
    private String algorithm = "SHA256";
    
    @JacksonXmlProperty(isAttribute = false, localName = "") // Valoarea tag-ului
    private String value; // Valoarea hash-ului
    
    // Constructors
    public Checksum() {}
    
    public Checksum(String algorithm, String value) {
        this.algorithm = algorithm;
        this.value = value;
    }
    
    // Getters and Setters
    public String getAlgorithm() {
        return algorithm;
    }
    
    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }
    
    public String getValue() {
        return value;
    }
    
    public void setValue(String value) {
        this.value = value;
    }
}

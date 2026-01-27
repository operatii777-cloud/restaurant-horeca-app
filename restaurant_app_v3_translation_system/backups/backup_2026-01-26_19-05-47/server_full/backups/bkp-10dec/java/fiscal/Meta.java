package fiscal;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Clasa Meta pentru metadatele raportului
 * Conține informații despre generare și checksum
 */
public class Meta {
    
    @JsonProperty("GeneratDe")
    private String generatDe; // "FriendsPOS v1.0"
    
    @JsonProperty("Checksum")
    private Checksum checksum; 
    
    @JsonProperty("DataGenerare")
    private String dataGenerare; // "2025-01-15"
    
    @JsonProperty("OraGenerare")
    private String oraGenerare; // "14:30:25"
    
    @JsonProperty("VersiuneFormat")
    private String versiuneFormat; // "OPANAF146-2018"
    
    // Constructors
    public Meta() {}
    
    public Meta(String generatDe, Checksum checksum, String dataGenerare, 
                String oraGenerare, String versiuneFormat) {
        this.generatDe = generatDe;
        this.checksum = checksum;
        this.dataGenerare = dataGenerare;
        this.oraGenerare = oraGenerare;
        this.versiuneFormat = versiuneFormat;
    }
    
    // Getters and Setters
    public String getGeneratDe() {
        return generatDe;
    }
    
    public void setGeneratDe(String generatDe) {
        this.generatDe = generatDe;
    }
    
    public Checksum getChecksum() {
        return checksum;
    }
    
    public void setChecksum(Checksum checksum) {
        this.checksum = checksum;
    }
    
    public String getDataGenerare() {
        return dataGenerare;
    }
    
    public void setDataGenerare(String dataGenerare) {
        this.dataGenerare = dataGenerare;
    }
    
    public String getOraGenerare() {
        return oraGenerare;
    }
    
    public void setOraGenerare(String oraGenerare) {
        this.oraGenerare = oraGenerare;
    }
    
    public String getVersiuneFormat() {
        return versiuneFormat;
    }
    
    public void setVersiuneFormat(String versiuneFormat) {
        this.versiuneFormat = versiuneFormat;
    }
}

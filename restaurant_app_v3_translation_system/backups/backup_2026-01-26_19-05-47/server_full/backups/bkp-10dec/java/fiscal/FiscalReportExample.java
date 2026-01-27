package fiscal;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;

/**
 * Exemplu de utilizare pentru sistemul de rapoarte fiscale
 * Demonstrează cum se generează rapoartele X, Z și Lunar
 */
public class FiscalReportExample {

    public static void main(String[] args) {
        try {
            FiscalReportExample example = new FiscalReportExample();
            
            // Generează Raport X (intermediar)
            example.genereazaRaportXExemplu();
            
            // Generează Raport Z (închidere fiscală)
            example.genereazaRaportZExemplu();
            
            // Generează Raport Lunar
            example.genereazaRaportLunarExemplu();
            
        } catch (Exception e) {
            System.err.println("Eroare la generarea rapoartelor: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Exemplu de generare Raport X (intermediar)
     */
    public void genereazaRaportXExemplu() throws Exception {
        System.out.println("=== GENERARE RAPORT X (INTERMEDIAR) ===");
        
        RaportExporter exporter = new RaportExporter();
        
        // Populează datele pentru Raport X
        RaportXData data = new RaportXData();
        data.setDenumireFirma("SC RESTAURANT TRATTORIA SRL");
        data.setCui("RO12345678");
        data.setAdresaPunct("Strada Principală 123, Sector 1, București");
        data.setDataCurenta("2025-01-15");
        data.setOraCurenta("14:30:25");
        data.setOperatorCurent("Ion Popescu");
        
        // Date TVA
        data.setBaza11("1500.00"); // Bază fără TVA 11%
        data.setTva11("165.00");   // TVA 11%
        data.setTotal11("1665.00"); // Total cu TVA 11%
        data.setBaza21("500.00");  // Bază fără TVA 21%
        data.setTva21("105.00");   // TVA 21%
        data.setTotal21("605.00"); // Total cu TVA 21%
        data.setBaza0("100.00");   // Bază fără TVA 0%
        data.setTva0("0.00");      // TVA 0%
        data.setTotal0("100.00");  // Total cu TVA 0%
        data.setTotalGeneralBrut("2370.00"); // Total general
        
        // Date încasări
        data.setIncasariCash("1500.00");
        data.setIncasariCard("800.00");
        data.setIncasariVoucher("70.00");
        
        // Indicatori
        data.setNrBonuriEmise(87);
        
        // Generează HTML-ul
        String htmlContent = exporter.genereazaRaportX(data);
        
        // Salvează fișierul
        String dataZiua = "2025-01-15";
        String numeFisier = exporter.genereazaNumeFisier("raportX", dataZiua);
        exporter.scrieFisier(htmlContent, "arhiva_rapoarte/2025/01/15/" + numeFisier + ".html");
        
        System.out.println("✅ Raport X generat cu succes pentru data: " + dataZiua);
    }

    /**
     * Exemplu de generare Raport Z (închidere fiscală)
     */
    public void genereazaRaportZExemplu() throws Exception {
        System.out.println("=== GENERARE RAPORT Z (ÎNCHIDERE FISCALĂ) ===");
        
        RaportExporter exporter = new RaportExporter();
        
        // Populează datele pentru Raport Z
        RaportZData data = new RaportZData();
        data.setDenumireFirma("SC RESTAURANT TRATTORIA SRL");
        data.setCui("RO12345678");
        data.setAdresaPunct("Strada Principală 123, Sector 1, București");
        data.setNrAparatFiscal("FISCAL001");
        data.setNumarRaportZ("Z000123");
        data.setDataRaport("2025-01-15");
        data.setOraInchidere("23:59:59");
        data.setDataCurenta("2025-01-15");
        data.setOraCurenta("23:59:59");
        data.setOperatorCurent("Maria Ionescu");
        
        // Date TVA (aceleași ca la Raport X, dar finalizate)
        data.setBaza11("1500.00");
        data.setTva11("165.00");
        data.setTotal11("1665.00");
        data.setBaza21("500.00");
        data.setTva21("105.00");
        data.setTotal21("605.00");
        data.setBaza0("100.00");
        data.setTva0("0.00");
        data.setTotal0("100.00");
        data.setTotalGeneralBrut("2370.00");
        
        // Date încasări
        data.setIncasariCash("1500.00");
        data.setIncasariCard("800.00");
        data.setIncasariVoucher("70.00");
        
        // Indicatori
        data.setNrBonuriEmise(87);
        data.setNrAnulari(2);
        data.setSumaAnulata("25.50");
        data.setBonMax("450.00");
        data.setBonMin("15.50");
        
        // Checksum SHA-256 (simulat)
        data.setChecksumSha256("a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456");
        
        // Generează HTML-ul
        String htmlContent = exporter.genereazaRaportZ(data);
        
        // Creează obiectul RaportZ pentru XML
        RaportZ raportZ = creazaRaportZObject(data);
        String xmlContent = exporter.genereazaRaportZXml(raportZ);
        
        // Arhivează complet (HTML + XML + PDF + ZIP + Manifest)
        exporter.arhiveazaRaportZComplet("2025-01-15", htmlContent, xmlContent);
        
        System.out.println("✅ Raport Z generat și arhivat cu succes pentru data: 2025-01-15");
    }

    /**
     * Exemplu de generare Raport Lunar
     */
    public void genereazaRaportLunarExemplu() throws Exception {
        System.out.println("=== GENERARE RAPORT LUNAR ===");
        
        RaportExporter exporter = new RaportExporter();
        
        // Populează datele pentru Raport Lunar
        RaportLunarData data = new RaportLunarData();
        data.setDenumireFirma("SC RESTAURANT TRATTORIA SRL");
        data.setCui("RO12345678");
        data.setLunaAn("Ianuarie 2025");
        data.setLunaNume("Ianuarie");
        data.setAn("2025");
        data.setDataGenerare("2025-02-01");
        data.setOraGenerare("10:00:00");
        
        // Totaluri generale
        data.setLunaTotalBrut("75000.00");
        data.setLunaNrBonuri(2850);
        data.setLunaZileLucratoare(31);
        data.setLunaMedieZilnica("2419.35");
        
        // Totaluri TVA
        data.setLunaTotalTva11("4125.00");
        data.setLunaTotalTva21("5250.00");
        data.setLunaTotalCash("45000.00");
        data.setLunaTotalCard("28000.00");
        data.setLunaBaza11("37500.00");
        data.setLunaBaza21("25000.00");
        data.setLunaBaza0("12500.00");
        data.setLunaTotal11("41625.00");
        data.setLunaTotal21("30250.00");
        data.setLunaTotal0("12500.00");
        data.setLunaTotalBaza("75000.00");
        data.setLunaTotalTva("9375.00");
        
        // Indicatori performanță
        data.setZiMaxVanzari("5200.00");
        data.setDataZiMax("15 Ianuarie");
        data.setZiMinVanzari("850.00");
        data.setDataZiMin("1 Ianuarie");
        data.setMedieBon("26.32");
        data.setProcentCash("60.0");
        data.setProcentCard("37.3");
        
        // Generează tabelele HTML (simulate)
        data.setTabelZilnic(genereazaTabelZilnicExemplu());
        data.setTabelRapoarteZ(genereazaTabelRapoarteZExemplu());
        
        // Checksum
        data.setChecksumRaport("f1e2d3c4b5a6978012345678901234567890abcdef1234567890abcdef123456");
        
        // Generează HTML-ul
        String htmlContent = exporter.genereazaRaportLunar(data);
        
        // Salvează fișierul
        String numeFisier = "raport_lunar_ianuarie_2025";
        exporter.scrieFisier(htmlContent, "arhiva_rapoarte/2025/01/" + numeFisier + ".html");
        
        System.out.println("✅ Raport Lunar generat cu succes pentru: Ianuarie 2025");
    }

    /**
     * Creează obiectul RaportZ pentru serializarea XML
     */
    private RaportZ creazaRaportZObject(RaportZData data) {
        // Header
        Header header = new Header(
            data.getDenumireFirma(),
            data.getCui(),
            data.getAdresaPunct(),
            data.getNrAparatFiscal(),
            data.getNumarRaportZ(),
            data.getDataRaport(),
            data.getOraInchidere(),
            data.getOperatorCurent()
        );
        
        // Detalii TVA
        List<CotaTVA> coteTVA = Arrays.asList(
            new CotaTVA(11, data.getBaza11(), data.getTva11(), data.getTotal11()),
            new CotaTVA(21, data.getBaza21(), data.getTva21(), data.getTotal21()),
            new CotaTVA(0, data.getBaza0(), data.getTva0(), data.getTotal0())
        );
        DetaliiTVA detaliiTVA = new DetaliiTVA(coteTVA);
        
        // Încasări
        Incasari incasari = new Incasari(
            data.getIncasariCash(),
            data.getIncasariCard(),
            data.getIncasariVoucher(),
            data.getTotalGeneralBrut()
        );
        
        // Indicatori
        Indicatori indicatori = new Indicatori(
            data.getNrBonuriEmise(),
            data.getNrAnulari(),
            data.getSumaAnulata(),
            data.getBonMax(),
            data.getBonMin(),
            "27.24" // Medie bon calculată
        );
        
        // Meta
        Checksum checksum = new Checksum("SHA256", data.getChecksumSha256());
        Meta meta = new Meta(
            "FriendsPOS v1.0",
            checksum,
            data.getDataCurenta(),
            data.getOraCurenta(),
            "OPANAF146-2018"
        );
        
        return new RaportZ(header, detaliiTVA, incasari, indicatori, meta);
    }

    /**
     * Generează tabelul zilnic pentru raportul lunar (exemplu)
     */
    private String genereazaTabelZilnicExemplu() {
        return """
            <tr><td class="left">01.01.2025</td><td>850.00</td><td>75.00</td><td>52.50</td><td>32</td><td>500.00</td><td>350.00</td></tr>
            <tr><td class="left">02.01.2025</td><td>1250.00</td><td>110.00</td><td>78.75</td><td>45</td><td>750.00</td><td>500.00</td></tr>
            <tr><td class="left">03.01.2025</td><td>2100.00</td><td>185.00</td><td>132.30</td><td>78</td><td>1200.00</td><td>900.00</td></tr>
            <!-- ... alte zile ... -->
            """;
    }

    /**
     * Generează tabelul rapoartelor Z pentru raportul lunar (exemplu)
     */
    private String genereazaTabelRapoarteZExemplu() {
        return """
            <tr><td class="left">01.01.2025</td><td class="left">Z000001</td><td><span class="badge bg-success">Generat</span></td><td class="left">Închidere normală</td></tr>
            <tr><td class="left">02.01.2025</td><td class="left">Z000002</td><td><span class="badge bg-success">Generat</span></td><td class="left">Închidere normală</td></tr>
            <tr><td class="left">03.01.2025</td><td class="left">Z000003</td><td><span class="badge bg-success">Generat</span></td><td class="left">Închidere normală</td></tr>
            <!-- ... alte zile ... -->
            """;
    }
}

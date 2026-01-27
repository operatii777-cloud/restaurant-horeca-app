package fiscal;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.zip.*;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

/**
 * Clasa principală pentru exportul și arhivarea rapoartelor fiscale
 * Gestionează generarea HTML, XML, PDF și arhivarea ZIP securizată
 */
public class RaportExporter {

    private final XmlMapper xmlMapper;
    private final SimpleDateFormat dateFormat;
    private final SimpleDateFormat timeFormat;

    public RaportExporter() {
        this.xmlMapper = new XmlMapper();
        this.xmlMapper.enable(com.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT);
        this.dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        this.timeFormat = new SimpleDateFormat("HH:mm:ss");
    }

    /**
     * Generează Raport X (intermediar) cu datele furnizate
     */
    public String genereazaRaportX(RaportXData data) throws Exception {
        String templatePath = "public/templates/fiscal/raport-x.html";
        String template = Files.readString(Paths.get(templatePath), StandardCharsets.UTF_8);
        
        // Înlocuiește placeholder-urile cu datele reale
        template = template.replace("{DENUMIRE_FIRMA}", data.getDenumireFirma());
        template = template.replace("{CUI}", data.getCui());
        template = template.replace("{ADRESA_PUNCT}", data.getAdresaPunct());
        template = template.replace("{DATA_CURENTA}", data.getDataCurenta());
        template = template.replace("{ORA_CURENTA}", data.getOraCurenta());
        template = template.replace("{OPERATOR_CURENT}", data.getOperatorCurent());
        template = template.replace("{BAZA_11}", data.getBaza11());
        template = template.replace("{TVA_11}", data.getTva11());
        template = template.replace("{TOTAL_11}", data.getTotal11());
        template = template.replace("{BAZA_21}", data.getBaza21());
        template = template.replace("{TVA_21}", data.getTva21());
        template = template.replace("{TOTAL_21}", data.getTotal21());
        template = template.replace("{BAZA_0}", data.getBaza0());
        template = template.replace("{TVA_0}", data.getTva0());
        template = template.replace("{TOTAL_0}", data.getTotal0());
        template = template.replace("{TOTAL_GENERAL_BRUT}", data.getTotalGeneralBrut());
        template = template.replace("{INCASARI_CASH}", data.getIncasariCash());
        template = template.replace("{INCASARI_CARD}", data.getIncasariCard());
        template = template.replace("{INCASARI_VOUCHER}", data.getIncasariVoucher());
        template = template.replace("{NR_BONURI_EMISE}", String.valueOf(data.getNrBonuriEmise()));
        
        return template;
    }

    /**
     * Generează Raport Z (închidere fiscală) cu datele furnizate
     */
    public String genereazaRaportZ(RaportZData data) throws Exception {
        String templatePath = "public/templates/fiscal/raport-z.html";
        String template = Files.readString(Paths.get(templatePath), StandardCharsets.UTF_8);
        
        // Înlocuiește placeholder-urile cu datele reale
        template = template.replace("{DENUMIRE_FIRMA}", data.getDenumireFirma());
        template = template.replace("{CUI}", data.getCui());
        template = template.replace("{ADRESA_PUNCT}", data.getAdresaPunct());
        template = template.replace("{NR_APARAT_FISCAL}", data.getNrAparatFiscal());
        template = template.replace("{NUMAR_RAPORT_Z}", data.getNumarRaportZ());
        template = template.replace("{DATA_RAPORT}", data.getDataRaport());
        template = template.replace("{ORA_INCHIDERE}", data.getOraInchidere());
        template = template.replace("{OPERATOR_CURENT}", data.getOperatorCurent());
        template = template.replace("{DATA_CURENTA}", data.getDataCurenta());
        template = template.replace("{ORA_CURENTA}", data.getOraCurenta());
        template = template.replace("{BAZA_11}", data.getBaza11());
        template = template.replace("{TVA_11}", data.getTva11());
        template = template.replace("{TOTAL_11}", data.getTotal11());
        template = template.replace("{BAZA_21}", data.getBaza21());
        template = template.replace("{TVA_21}", data.getTva21());
        template = template.replace("{TOTAL_21}", data.getTotal21());
        template = template.replace("{BAZA_0}", data.getBaza0());
        template = template.replace("{TVA_0}", data.getTva0());
        template = template.replace("{TOTAL_0}", data.getTotal0());
        template = template.replace("{TOTAL_GENERAL_BRUT}", data.getTotalGeneralBrut());
        template = template.replace("{INCASARI_CASH}", data.getIncasariCash());
        template = template.replace("{INCASARI_CARD}", data.getIncasariCard());
        template = template.replace("{INCASARI_VOUCHER}", data.getIncasariVoucher());
        template = template.replace("{NR_BONURI_EMISE}", String.valueOf(data.getNrBonuriEmise()));
        template = template.replace("{NR_ANULARI}", String.valueOf(data.getNrAnulari()));
        template = template.replace("{SUMA_ANULATA}", data.getSumaAnulata());
        template = template.replace("{BON_MAX}", data.getBonMax());
        template = template.replace("{BON_MIN}", data.getBonMin());
        template = template.replace("{CHECKSUM_SHA256}", data.getChecksumSha256());
        
        return template;
    }

    /**
     * Generează XML-ul pentru Raport Z conform OPANAF 146/2018
     */
    public String genereazaRaportZXml(RaportZ raportZObject) throws Exception {
        return xmlMapper.writeValueAsString(raportZObject);
    }

    /**
     * Generează Raport Lunar cu datele furnizate
     */
    public String genereazaRaportLunar(RaportLunarData data) throws Exception {
        String templatePath = "public/templates/fiscal/raport-lunar.html";
        String template = Files.readString(Paths.get(templatePath), StandardCharsets.UTF_8);
        
        // Înlocuiește placeholder-urile cu datele reale
        template = template.replace("{LUNA_AN}", data.getLunaAn());
        template = template.replace("{LUNA_NUME}", data.getLunaNume());
        template = template.replace("{AN}", data.getAn());
        template = template.replace("{DENUMIRE_FIRMA}", data.getDenumireFirma());
        template = template.replace("{CUI}", data.getCui());
        template = template.replace("{DATA_GENERARE}", data.getDataGenerare());
        template = template.replace("{ORA_GENERARE}", data.getOraGenerare());
        template = template.replace("{LUNA_TOTAL_BRUT}", data.getLunaTotalBrut());
        template = template.replace("{LUNA_NR_BONURI}", String.valueOf(data.getLunaNrBonuri()));
        template = template.replace("{LUNA_ZILE_LUCRATOARE}", String.valueOf(data.getLunaZileLucratoare()));
        template = template.replace("{LUNA_MEDIE_ZILNICA}", data.getLunaMedieZilnica());
        template = template.replace("{LUNA_TOTAL_TVA_11}", data.getLunaTotalTva11());
        template = template.replace("{LUNA_TOTAL_TVA_21}", data.getLunaTotalTva21());
        template = template.replace("{LUNA_TOTAL_CASH}", data.getLunaTotalCash());
        template = template.replace("{LUNA_TOTAL_CARD}", data.getLunaTotalCard());
        template = template.replace("{LUNA_BAZA_11}", data.getLunaBaza11());
        template = template.replace("{LUNA_BAZA_21}", data.getLunaBaza21());
        template = template.replace("{LUNA_BAZA_0}", data.getLunaBaza0());
        template = template.replace("{LUNA_TOTAL_11}", data.getLunaTotal11());
        template = template.replace("{LUNA_TOTAL_21}", data.getLunaTotal21());
        template = template.replace("{LUNA_TOTAL_0}", data.getLunaTotal0());
        template = template.replace("{LUNA_TOTAL_BAZA}", data.getLunaTotalBaza());
        template = template.replace("{LUNA_TOTAL_TVA}", data.getLunaTotalTva());
        template = template.replace("{ZI_MAX_VANZARI}", data.getZiMaxVanzari());
        template = template.replace("{DATA_ZI_MAX}", data.getDataZiMax());
        template = template.replace("{ZI_MIN_VANZARI}", data.getZiMinVanzari());
        template = template.replace("{DATA_ZI_MIN}", data.getDataZiMin());
        template = template.replace("{MEDIE_BON}", data.getMedieBon());
        template = template.replace("{PROCENT_CASH}", data.getProcentCash());
        template = template.replace("{PROCENT_CARD}", data.getProcentCard());
        template = template.replace("{CHECKSUM_RAPORT}", data.getChecksumRaport());
        template = template.replace("{TABEL_ZILNIC}", data.getTabelZilnic());
        template = template.replace("{TABEL_RAPOARTE_Z}", data.getTabelRapoarteZ());
        
        return template;
    }

    /**
     * Simulare de conversie HTML -> PDF
     * În producție, folosește o librărie precum iText sau Flying Saucer
     */
    public void exportToPDF(String htmlContent, String pdfPath) throws Exception {
        // Pentru demo, creăm un fișier simplu
        Files.write(Paths.get(pdfPath), 
            ("PDF simulare din:\n" + htmlContent.substring(0, 100) + "...")
            .getBytes(StandardCharsets.UTF_8));
        System.out.println("Export PDF reușit: " + pdfPath);
    }

    /**
     * Scrie conținutul într-un fișier
     */
    public void scrieFisier(String content, String filePath) throws IOException {
        Files.createDirectories(Paths.get(filePath).getParent());
        Files.write(Paths.get(filePath), content.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Calculează SHA-256 Checksum pentru integritatea fișierului
     */
    public String calculateSHA256(Path file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream fis = Files.newInputStream(file)) {
            byte[] byteArray = new byte[1024];
            int bytesCount = 0; 
            while ((bytesCount = fis.read(byteArray)) != -1) {
                digest.update(byteArray, 0, bytesCount);
            };
        }
        byte[] bytes = digest.digest();
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    /**
     * Arhivează fișierele generate într-un pachet ZIP securizat
     */
    public void arhiveazaInZip(String dataZiua, String folderPath, String... fisiere) throws IOException {
        Path zipFilePath = Paths.get(folderPath, "raport_" + dataZiua + ".zip");
        try (ZipOutputStream zos = new ZipOutputStream(Files.newOutputStream(zipFilePath))) {
            for (String numeFisier : fisiere) {
                Path filePath = Paths.get(folderPath, numeFisier);
                
                if (!Files.exists(filePath)) {
                    System.err.println("Fișierul nu există: " + filePath);
                    continue;
                }
                
                ZipEntry zipEntry = new ZipEntry(numeFisier);
                zos.putNextEntry(zipEntry);
                Files.copy(filePath, zos);
                zos.closeEntry();
            }
        }
        System.out.println("Arhivă ZIP creată: " + zipFilePath);
    }

    /**
     * Arhivează Raportul Z complet cu toate fișierele și manifestul
     */
    public void arhiveazaRaportZComplet(String data, String html, String xml) throws Exception {
        
        // 1. Definim căile de arhivare
        String an = data.substring(0, 4);
        String luna = data.substring(5, 7);
        String folderZi = data;
        
        Path folderPath = Paths.get("arhiva_rapoarte", an, luna, folderZi);
        Files.createDirectories(folderPath);
        
        String numeBaza = "raportZ_" + data;
        Path htmlPath = folderPath.resolve(numeBaza + ".html");
        Path pdfPath = folderPath.resolve(numeBaza + ".pdf");
        Path xmlPath = folderPath.resolve(numeBaza + ".xml");
        
        // 2. Generarea fișierelor
        scrieFisier(html, htmlPath.toString());
        scrieFisier(xml, xmlPath.toString());
        exportToPDF(html, pdfPath.toString());

        // 3. Calculul Checksum (pentru integritate)
        String checksumXml = calculateSHA256(xmlPath);
        String checksumPdf = calculateSHA256(pdfPath);
        
        // 4. Crearea fișierului Manifest (Index + Checksum)
        String manifestContent = String.format("""
            {
              "data_raport": "%s",
              "tip": "Z",
              "versiune": "1.0",
              "generat_de": "FriendsPOS",
              "fisiere": [
                {"nume": "%s.xml", "checksum": "%s", "tip": "fiscal"},
                {"nume": "%s.pdf", "checksum": "%s", "tip": "vizualizare"},
                {"nume": "%s.html", "checksum": "%s", "tip": "template"}
              ],
              "comentarii": "Raport Z conform OPANAF 146/2018"
            }
            """, data, numeBaza, checksumXml, numeBaza, checksumPdf, numeBaza, calculateSHA256(htmlPath));
        
        scrieFisier(manifestContent, folderPath.resolve("manifest_" + data + ".json").toString());
        
        // 5. Arhivarea (ZIP)
        arhiveazaInZip(data, folderPath.toString(), 
                       numeBaza + ".html", 
                       numeBaza + ".pdf", 
                       numeBaza + ".xml",
                       "manifest_" + data + ".json");
                       
        System.out.println("✅ Raport Z complet arhivat pentru data: " + data);
    }

    /**
     * Generează numele de fișier pentru raportul curent
     */
    public String genereazaNumeFisier(String tip, String data) {
        return String.format("%s_%s", tip, data);
    }

    /**
     * Verifică integritatea unui fișier din arhivă
     */
    public boolean verificaIntegritateFisier(Path filePath, String expectedChecksum) throws Exception {
        String actualChecksum = calculateSHA256(filePath);
        return actualChecksum.equals(expectedChecksum);
    }
}

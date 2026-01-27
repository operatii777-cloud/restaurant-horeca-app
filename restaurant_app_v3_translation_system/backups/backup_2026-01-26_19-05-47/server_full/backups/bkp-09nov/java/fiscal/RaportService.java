package fiscal;

import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Clasa principală care orchestrează toate operațiunile cu rapoartele fiscale
 * Acționează ca un orchestrator între baza de date, POJO-uri și exportator
 */
public class RaportService {

    private final DatabaseService dbService;
    private final RaportExporter exporter;
    private final XmlMapper xmlMapper;
    private final DateTimeFormatter dateFormatter;
    private final DateTimeFormatter timeFormatter;

    // Constructor cu Dependency Injection
    public RaportService(DatabaseService dbService, RaportExporter exporter) {
        this.dbService = dbService;
        this.exporter = exporter;
        this.xmlMapper = new XmlMapper();
        this.xmlMapper.enable(SerializationFeature.INDENT_OUTPUT);
        this.dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        this.timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");
    }
    
    /**
     * Preia datele agregate din baza de date pentru o anumită zi
     * Această metodă este apelată pentru a popula Raportul X sau Z
     */
    public RaportDataDTO fetchDateRaport(LocalDate dataRaport, boolean isRaportZ) {
        try {
            // 1. Interogare DB pentru totaluri TVA
            Map<String, Object> tvaData = dbService.getTotaluriTVA(dataRaport);
            
            // 2. Interogare DB pentru încasări pe metode de plată
            Map<String, Object> incasariData = dbService.getIncasariPeMetode(dataRaport);
            
            // 3. Interogare DB pentru indicatori
            Map<String, Object> indicatoriData = dbService.getIndicatoriZi(dataRaport);
            
            // 4. Construiește DTO-ul cu datele preluate
            return new RaportDataDTO(
                // TVA 11%
                (Double) tvaData.getOrDefault("baza_11", 0.0),
                (Double) tvaData.getOrDefault("tva_11", 0.0),
                (Double) tvaData.getOrDefault("total_11", 0.0),
                // TVA 21%
                (Double) tvaData.getOrDefault("baza_21", 0.0),
                (Double) tvaData.getOrDefault("tva_21", 0.0),
                (Double) tvaData.getOrDefault("total_21", 0.0),
                // TVA 0%
                (Double) tvaData.getOrDefault("baza_0", 0.0),
                (Double) tvaData.getOrDefault("tva_0", 0.0),
                (Double) tvaData.getOrDefault("total_0", 0.0),
                // Total general
                (Double) tvaData.getOrDefault("total_brut", 0.0),
                // Indicatori
                (Integer) indicatoriData.getOrDefault("nr_bonuri", 0),
                (Integer) indicatoriData.getOrDefault("nr_anulari", 0),
                (Double) indicatoriData.getOrDefault("suma_anulata", 0.0),
                (Double) indicatoriData.getOrDefault("bon_max", 0.0),
                (Double) indicatoriData.getOrDefault("bon_min", 0.0),
                // Încasări
                (Double) incasariData.getOrDefault("cash", 0.0),
                (Double) incasariData.getOrDefault("card", 0.0),
                (Double) incasariData.getOrDefault("voucher", 0.0)
            );
            
        } catch (Exception e) {
            System.err.println("Eroare la preluarea datelor pentru data " + dataRaport + ": " + e.getMessage());
            // Returnează date goale în caz de eroare
            return new RaportDataDTO(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
        }
    }

    /**
     * Generează Raport X (intermediar) - nu închide ziua fiscală
     */
    public RaportXData generateRaportX(LocalDate dataRaport) throws Exception {
        System.out.println("🔄 Generare Raport X pentru data: " + dataRaport);
        
        // 1. Preia datele din baza de date
        RaportDataDTO dateAgregate = fetchDateRaport(dataRaport, false);
        
        // 2. Populează obiectul RaportXData
        RaportXData raportXData = new RaportXData();
        
        // Date firma (din configurație)
        raportXData.setDenumireFirma(getDenumireFirma());
        raportXData.setCui(getCUI());
        raportXData.setAdresaPunct(getAdresaPunct());
        
        // Date curente
        LocalDateTime now = LocalDateTime.now();
        raportXData.setDataCurenta(now.format(dateFormatter));
        raportXData.setOraCurenta(now.format(timeFormatter));
        raportXData.setOperatorCurent(getOperatorCurent());
        
        // Date TVA
        raportXData.setBaza11(String.format("%.2f", dateAgregate.baza11));
        raportXData.setTva11(String.format("%.2f", dateAgregate.tva11));
        raportXData.setTotal11(String.format("%.2f", dateAgregate.total11));
        raportXData.setBaza21(String.format("%.2f", dateAgregate.baza21));
        raportXData.setTva21(String.format("%.2f", dateAgregate.tva21));
        raportXData.setTotal21(String.format("%.2f", dateAgregate.total21));
        raportXData.setBaza0(String.format("%.2f", dateAgregate.baza0));
        raportXData.setTva0(String.format("%.2f", dateAgregate.tva0));
        raportXData.setTotal0(String.format("%.2f", dateAgregate.total0));
        raportXData.setTotalGeneralBrut(String.format("%.2f", dateAgregate.totalBrut));
        
        // Date încasări
        raportXData.setIncasariCash(String.format("%.2f", dateAgregate.cash));
        raportXData.setIncasariCard(String.format("%.2f", dateAgregate.card));
        raportXData.setIncasariVoucher(String.format("%.2f", dateAgregate.voucher));
        
        // Indicatori
        raportXData.setNrBonuriEmise(dateAgregate.nrBonuri);
        
        // 3. Generează HTML-ul
        String htmlContent = exporter.genereazaRaportX(raportXData);
        
        // 4. Salvează fișierul
        String numeFisier = "raportX_" + dataRaport.format(dateFormatter);
        String caleFisier = "arhiva_rapoarte/" + dataRaport.getYear() + "/" + 
                           String.format("%02d", dataRaport.getMonthValue()) + "/" + 
                           dataRaport.format(dateFormatter) + "/" + numeFisier + ".html";
        exporter.scrieFisier(htmlContent, caleFisier);
        
        System.out.println("✅ Raport X generat cu succes: " + caleFisier);
        return raportXData;
    }

    /**
     * Generează, salvează și arhivează Raportul Z (Închiderea fiscală)
     * @return Path către fișierul ZIP arhivat
     */
    public Path generateRaportZ() throws Exception {
        LocalDate today = LocalDate.now();
        LocalDateTime closeTime = LocalDateTime.now();
        String dataStr = today.format(dateFormatter);
        String timeStr = closeTime.format(timeFormatter);
        
        System.out.println("🔄 Generare Raport Z pentru data: " + dataStr);
        
        // 1. Verifică dacă ziua nu este deja închisă
        if (dbService.isZiuaInchisa(today)) {
            throw new IllegalStateException("Ziua " + dataStr + " este deja închisă fiscal!");
        }
        
        // 2. Fetch Date: Preia datele tranzacționale finale
        RaportDataDTO dateAgregate = fetchDateRaport(today, true);
        
        // 3. Populează POJO (RaportZ)
        RaportZ raportZObject = populeazaRaportZ(dateAgregate, dataStr, timeStr);
        
        // 4. Generează XML (Serializare)
        String xmlContent = xmlMapper.writeValueAsString(raportZObject);
        
        // 5. Generează HTML (Vizualizare/PDF)
        String htmlContent = genereazaHtmlContent(raportZObject, dataStr, timeStr);
        
        // 6. Calculează checksum pentru XML
        String checksumXml = exporter.calculateSHA256(
            java.nio.file.Paths.get("temp_raportz_" + dataStr + ".xml")
        );
        raportZObject.getMeta().getChecksum().setValue(checksumXml);
        
        // 7. Arhivează (Salvare XML, HTML, PDF și ZIP)
        Path arhivaPath = exporter.arhiveazaRaportZComplet(dataStr, htmlContent, xmlContent);
        
        // 8. Finalizare Zi Fiscală (Actualizează DB)
        dbService.marcheazaZiuaCaInchisa(today, raportZObject.getHeader().getNumarRaport());
        
        System.out.println("✅ Raport Z generat și arhivat cu succes: " + arhivaPath);
        return arhivaPath;
    }
    
    /**
     * Generează Raport Lunar pentru o lună specificată
     */
    public RaportLunarData generateRaportLunar(String lunaAn) throws Exception {
        System.out.println("🔄 Generare Raport Lunar pentru: " + lunaAn);
        
        // 1. Parsează luna și anul
        String[] parts = lunaAn.split("-");
        int an = Integer.parseInt(parts[0]);
        int luna = Integer.parseInt(parts[1]);
        
        // 2. Preia toate rapoartele Z din luna respectivă
        List<RaportDataDTO> rapoarteZDinLuna = dbService.getRapoarteZDinLuna(an, luna);
        
        if (rapoarteZDinLuna.isEmpty()) {
            throw new IllegalStateException("Nu există rapoarte Z pentru luna " + lunaAn);
        }
        
        // 3. Agregă datele
        RaportLunarData raportLunarData = new RaportLunarData();
        
        // Date firma
        raportLunarData.setDenumireFirma(getDenumireFirma());
        raportLunarData.setCui(getCUI());
        raportLunarData.setLunaAn(getNumeLuna(luna) + " " + an);
        raportLunarData.setLunaNume(getNumeLuna(luna));
        raportLunarData.setAn(String.valueOf(an));
        
        // Date curente
        LocalDateTime now = LocalDateTime.now();
        raportLunarData.setDataGenerare(now.format(dateFormatter));
        raportLunarData.setOraGenerare(now.format(timeFormatter));
        
        // Calculează totalurile
        double totalBrutLuna = 0, totalTva11Luna = 0, totalTva21Luna = 0;
        double totalCashLuna = 0, totalCardLuna = 0, totalVoucherLuna = 0;
        int totalBonuriLuna = 0, zileLucratoare = rapoarteZDinLuna.size();
        
        for (RaportDataDTO raport : rapoarteZDinLuna) {
            totalBrutLuna += raport.totalBrut;
            totalTva11Luna += raport.tva11;
            totalTva21Luna += raport.tva21;
            totalCashLuna += raport.cash;
            totalCardLuna += raport.card;
            totalVoucherLuna += raport.voucher;
            totalBonuriLuna += raport.nrBonuri;
        }
        
        // Populează totalurile
        raportLunarData.setLunaTotalBrut(String.format("%.2f", totalBrutLuna));
        raportLunarData.setLunaNrBonuri(totalBonuriLuna);
        raportLunarData.setLunaZileLucratoare(zileLucratoare);
        raportLunarData.setLunaMedieZilnica(String.format("%.2f", totalBrutLuna / zileLucratoare));
        raportLunarData.setLunaTotalTva11(String.format("%.2f", totalTva11Luna));
        raportLunarData.setLunaTotalTva21(String.format("%.2f", totalTva21Luna));
        raportLunarData.setLunaTotalCash(String.format("%.2f", totalCashLuna));
        raportLunarData.setLunaTotalCard(String.format("%.2f", totalCardLuna));
        
        // Calculează procentele
        double procentCash = (totalCashLuna / totalBrutLuna) * 100;
        double procentCard = (totalCardLuna / totalBrutLuna) * 100;
        raportLunarData.setProcentCash(String.format("%.1f", procentCash));
        raportLunarData.setProcentCard(String.format("%.1f", procentCard));
        
        // Generează tabelele HTML
        raportLunarData.setTabelZilnic(genereazaTabelZilnic(rapoarteZDinLuna));
        raportLunarData.setTabelRapoarteZ(genereazaTabelRapoarteZ(rapoarteZDinLuna));
        
        // Checksum
        raportLunarData.setChecksumRaport(UUID.randomUUID().toString().replace("-", ""));
        
        // 4. Generează HTML-ul
        String htmlContent = exporter.genereazaRaportLunar(raportLunarData);
        
        // 5. Salvează fișierul
        String numeFisier = "raport_lunar_" + lunaAn;
        String caleFisier = "arhiva_rapoarte/" + an + "/" + String.format("%02d", luna) + "/" + numeFisier + ".html";
        exporter.scrieFisier(htmlContent, caleFisier);
        
        System.out.println("✅ Raport Lunar generat cu succes: " + caleFisier);
        return raportLunarData;
    }
    
    /**
     * Metodă helper pentru popularea structurii POJO RaportZ din datele agregate
     */
    private RaportZ populeazaRaportZ(RaportDataDTO date, String dataStr, String timeStr) {
        RaportZ raport = new RaportZ();

        // Populează Header
        Header header = new Header();
        header.setDenumireFurnizor(getDenumireFirma());
        header.setCui(getCUI());
        header.setAdresa(getAdresaPunct());
        header.setNrRegistru(getNrAparatFiscal());
        header.setNumarRaport("Z" + dbService.getNextRaportZNumber());
        header.setData(dataStr);
        header.setOra(timeStr);
        header.setOperator(getOperatorCurent());
        raport.setHeader(header);

        // Populează Detalii TVA (cu noile cote 11% și 21%)
        List<CotaTVA> cote = new ArrayList<>();
        cote.add(new CotaTVA(11, 
            String.format("%.2f", date.baza11), 
            String.format("%.2f", date.tva11), 
            String.format("%.2f", date.total11)
        ));
        cote.add(new CotaTVA(21, 
            String.format("%.2f", date.baza21), 
            String.format("%.2f", date.tva21), 
            String.format("%.2f", date.total21)
        ));
        cote.add(new CotaTVA(0, 
            String.format("%.2f", date.baza0), 
            "0.00", 
            String.format("%.2f", date.total0)
        ));
        raport.setDetaliiTVA(new DetaliiTVA(cote));

        // Populează Încasări
        Incasari incasari = new Incasari();
        incasari.setCash(String.format("%.2f", date.cash));
        incasari.setCard(String.format("%.2f", date.card));
        incasari.setVoucher(String.format("%.2f", date.voucher));
        incasari.setTotalZi(String.format("%.2f", date.totalBrut));
        raport.setIncasari(incasari);

        // Populează Indicatori
        Indicatori indicatori = new Indicatori();
        indicatori.setNumarBonuri(date.nrBonuri);
        indicatori.setNumarAnulari(date.nrAnulari);
        indicatori.setSumaAnulari(String.format("%.2f", date.sumaAnulata));
        indicatori.setBonMax(String.format("%.2f", date.bonMax));
        indicatori.setBonMin(String.format("%.2f", date.bonMin));
        indicatori.setMedieBon(String.format("%.2f", date.totalBrut / date.nrBonuri));
        raport.setIndicatori(indicatori);
        
        // Populează Meta
        Checksum checksum = new Checksum("SHA256", "");
        Meta meta = new Meta();
        meta.setGeneratDe("FriendsPOS v1.0");
        meta.setChecksum(checksum);
        meta.setDataGenerare(dataStr);
        meta.setOraGenerare(timeStr);
        meta.setVersiuneFormat("OPANAF146-2018");
        raport.setMeta(meta);

        return raport;
    }
    
    /**
     * Metodă helper pentru generarea conținutului HTML
     */
    private String genereazaHtmlContent(RaportZ raportZObject, String dataStr, String timeStr) {
        try {
            // Încarcă șablonul HTML pentru Raport Z
            String htmlTemplate = dbService.loadHtmlTemplate("raport_z");
            
            // Înlocuiește placeholder-urile cu datele din obiectul RaportZ
            String htmlContent = htmlTemplate
                .replace("{DENUMIRE_FIRMA}", raportZObject.getHeader().getDenumireFurnizor())
                .replace("{CUI}", raportZObject.getHeader().getCui())
                .replace("{ADRESA_PUNCT}", raportZObject.getHeader().getAdresa())
                .replace("{NR_APARAT_FISCAL}", raportZObject.getHeader().getNrRegistru())
                .replace("{NUMAR_RAPORT_Z}", raportZObject.getHeader().getNumarRaport())
                .replace("{DATA_RAPORT}", raportZObject.getHeader().getData())
                .replace("{ORA_INCHIDERE}", raportZObject.getHeader().getOra())
                .replace("{OPERATOR_CURENT}", raportZObject.getHeader().getOperator())
                .replace("{DATA_CURENTA}", dataStr)
                .replace("{ORA_CURENTA}", timeStr)
                .replace("{TOTAL_GENERAL_BRUT}", raportZObject.getIncasari().getTotalZi())
                .replace("{NR_BONURI_EMISE}", String.valueOf(raportZObject.getIndicatori().getNumarBonuri()))
                .replace("{NR_ANULARI}", String.valueOf(raportZObject.getIndicatori().getNumarAnulari()))
                .replace("{SUMA_ANULATA}", raportZObject.getIndicatori().getSumaAnulari())
                .replace("{BON_MAX}", raportZObject.getIndicatori().getBonMax())
                .replace("{BON_MIN}", raportZObject.getIndicatori().getBonMin())
                .replace("{CHECKSUM_SHA256}", raportZObject.getMeta().getChecksum().getValue());
            
            // Populează datele TVA
            if (!raportZObject.getDetaliiTVA().getCoteTVA().isEmpty()) {
                for (CotaTVA cota : raportZObject.getDetaliiTVA().getCoteTVA()) {
                    if (cota.getProcent() == 11) {
                        htmlContent = htmlContent
                            .replace("{BAZA_11}", cota.getBaza())
                            .replace("{TVA_11}", cota.getTva())
                            .replace("{TOTAL_11}", cota.getTotal());
                    } else if (cota.getProcent() == 21) {
                        htmlContent = htmlContent
                            .replace("{BAZA_21}", cota.getBaza())
                            .replace("{TVA_21}", cota.getTva())
                            .replace("{TOTAL_21}", cota.getTotal());
                    } else if (cota.getProcent() == 0) {
                        htmlContent = htmlContent
                            .replace("{BAZA_0}", cota.getBaza())
                            .replace("{TVA_0}", cota.getTva())
                            .replace("{TOTAL_0}", cota.getTotal());
                    }
                }
            }
            
            return htmlContent;
            
        } catch (Exception e) {
            System.err.println("Eroare la generarea HTML: " + e.getMessage());
            return "<html><body><h1>Eroare la generarea raportului</h1></body></html>";
        }
    }
    
    /**
     * Generează tabelul zilnic pentru raportul lunar
     */
    private String genereazaTabelZilnic(List<RaportDataDTO> rapoarteZDinLuna) {
        StringBuilder tabelHtml = new StringBuilder();
        
        for (RaportDataDTO raport : rapoarteZDinLuna) {
            tabelHtml.append(String.format(
                "<tr><td class=\"left\">%s</td><td>%.2f</td><td>%.2f</td><td>%.2f</td><td>%d</td><td>%.2f</td><td>%.2f</td></tr>",
                LocalDate.now().format(dateFormatter), // Data ar trebui să vină din raport
                raport.totalBrut,
                raport.tva11,
                raport.tva21,
                raport.nrBonuri,
                raport.cash,
                raport.card
            ));
        }
        
        return tabelHtml.toString();
    }
    
    /**
     * Generează tabelul rapoartelor Z pentru raportul lunar
     */
    private String genereazaTabelRapoarteZ(List<RaportDataDTO> rapoarteZDinLuna) {
        StringBuilder tabelHtml = new StringBuilder();
        
        for (int i = 0; i < rapoarteZDinLuna.size(); i++) {
            String numarRaport = "Z" + String.format("%06d", i + 1);
            tabelHtml.append(String.format(
                "<tr><td class=\"left\">%s</td><td class=\"left\">%s</td><td><span class=\"badge bg-success\">Generat</span></td><td class=\"left\">Închidere normală</td></tr>",
                LocalDate.now().format(dateFormatter),
                numarRaport
            ));
        }
        
        return tabelHtml.toString();
    }
    
    // Metode helper pentru configurația firmei
    private String getDenumireFirma() {
        return "SC RESTAURANT TRATTORIA SRL";
    }
    
    private String getCUI() {
        return "RO12345678";
    }
    
    private String getAdresaPunct() {
        return "Strada Principală 123, Sector 1, București";
    }
    
    private String getNrAparatFiscal() {
        return "FISCAL001";
    }
    
    private String getOperatorCurent() {
        return "Operator Sistem";
    }
    
    private String getNumeLuna(int luna) {
        String[] luni = {"", "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
                        "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"};
        return luni[luna];
    }
}

/**
 * DTO (Data Transfer Object) pentru datele agregate din DB
 */
class RaportDataDTO {
    public final double baza11, tva11, total11;
    public final double baza21, tva21, total21;
    public final double baza0, tva0, total0;
    public final double totalBrut;
    public final int nrBonuri, nrAnulari;
    public final double sumaAnulata, bonMax, bonMin;
    public final double cash, card, voucher;

    public RaportDataDTO(double b11, double t11, double tot11, double b21, double t21, double tot21, 
                         double b0, double t0, double tot0, double tBrut, int nBon, int nAn, 
                         double sAn, double bMax, double bMin, double c, double ca, double v) {
        this.baza11 = b11; this.tva11 = t11; this.total11 = tot11;
        this.baza21 = b21; this.tva21 = t21; this.total21 = tot21;
        this.baza0 = b0; this.tva0 = t0; this.total0 = tot0;
        this.totalBrut = tBrut;
        this.nrBonuri = nBon; this.nrAnulari = nAn; this.sumaAnulata = sAn;
        this.bonMax = bMax; this.bonMin = bMin;
        this.cash = c; this.card = ca; this.voucher = v;
    }
}

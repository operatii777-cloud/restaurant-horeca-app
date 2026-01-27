package filters;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Filter pentru logging-ul tuturor request-urilor API
 * Monitorizează performanța și înregistrează toate operațiunile
 */
public class LoggingFilter implements Filter {
    
    private static final DateTimeFormatter TIMESTAMP_FORMAT = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("✅ Logging Filter inițializat");
    }
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Captează informațiile despre request
        long startTime = System.currentTimeMillis();
        String method = httpRequest.getMethod();
        String requestURI = httpRequest.getRequestURI();
        String queryString = httpRequest.getQueryString();
        String userAgent = httpRequest.getHeader("User-Agent");
        String remoteAddr = httpRequest.getRemoteAddr();
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMAT);
        
        // Log request-ul de intrare
        logRequest(method, requestURI, queryString, remoteAddr, userAgent, timestamp);
        
        try {
            // Continuă cu request-ul
            chain.doFilter(request, response);
            
            // Log response-ul de ieșire
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = httpResponse.getStatus();
            logResponse(requestURI, statusCode, duration, timestamp);
            
        } catch (Exception e) {
            // Log erorile
            long duration = System.currentTimeMillis() - startTime;
            logError(requestURI, e.getMessage(), duration, timestamp);
            throw e;
        }
    }
    
    private void logRequest(String method, String requestURI, String queryString, 
                           String remoteAddr, String userAgent, String timestamp) {
        
        StringBuilder log = new StringBuilder();
        log.append("📥 REQUEST [").append(timestamp).append("] ");
        log.append(method).append(" ").append(requestURI);
        
        if (queryString != null && !queryString.isEmpty()) {
            log.append("?").append(queryString);
        }
        
        log.append(" | IP: ").append(remoteAddr);
        
        if (userAgent != null && !userAgent.isEmpty()) {
            // Truncatează user agent-ul dacă este prea lung
            String shortUserAgent = userAgent.length() > 100 ? 
                userAgent.substring(0, 100) + "..." : userAgent;
            log.append(" | UA: ").append(shortUserAgent);
        }
        
        System.out.println(log.toString());
    }
    
    private void logResponse(String requestURI, int statusCode, long duration, String timestamp) {
        StringBuilder log = new StringBuilder();
        log.append("📤 RESPONSE [").append(timestamp).append("] ");
        log.append(requestURI);
        log.append(" | Status: ").append(statusCode);
        
        // Adaugă indicatori de performanță
        if (duration < 100) {
            log.append(" | ⚡ ").append(duration).append("ms (FAST)");
        } else if (duration < 500) {
            log.append(" | 🟢 ").append(duration).append("ms (NORMAL)");
        } else if (duration < 1000) {
            log.append(" | 🟡 ").append(duration).append("ms (SLOW)");
        } else {
            log.append(" | 🔴 ").append(duration).append("ms (VERY SLOW)");
        }
        
        // Adaugă indicatori pentru status codes
        if (statusCode >= 200 && statusCode < 300) {
            log.append(" ✅");
        } else if (statusCode >= 400 && statusCode < 500) {
            log.append(" ⚠️");
        } else if (statusCode >= 500) {
            log.append(" ❌");
        }
        
        System.out.println(log.toString());
    }
    
    private void logError(String requestURI, String errorMessage, long duration, String timestamp) {
        StringBuilder log = new StringBuilder();
        log.append("❌ ERROR [").append(timestamp).append("] ");
        log.append(requestURI);
        log.append(" | Duration: ").append(duration).append("ms");
        log.append(" | Error: ").append(errorMessage);
        
        System.out.println(log.toString());
    }
    
    @Override
    public void destroy() {
        System.out.println("🔴 Logging Filter distrus");
    }
}

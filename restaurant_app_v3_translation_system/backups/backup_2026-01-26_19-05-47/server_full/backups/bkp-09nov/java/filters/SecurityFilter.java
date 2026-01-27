package filters;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Filter pentru securitatea operațiunilor fiscale
 * Verifică autentificarea și autorizarea pentru operațiuni critice
 */
public class SecurityFilter implements Filter {
    
    private static final String[] PROTECTED_ENDPOINTS = {
        "/api/fiscal/report-z",
        "/api/fiscal/retransmit-monthly",
        "/api/fiscal/sync-all",
        "/api/fiscal/validate-xml"
    };
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("✅ Security Filter inițializat");
    }
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String requestURI = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();
        
        System.out.println("🔒 Security Filter: " + method + " " + requestURI);
        
        // Verifică dacă endpoint-ul este protejat
        boolean isProtected = isProtectedEndpoint(requestURI);
        
        if (isProtected) {
            // Verifică autentificarea pentru operațiuni critice
            if (!isAuthenticated(httpRequest)) {
                sendUnauthorizedResponse(httpResponse);
                return;
            }
            
            // Verifică autorizarea pentru operațiuni fiscale
            if (!isAuthorized(httpRequest)) {
                sendForbiddenResponse(httpResponse);
                return;
            }
            
            // Log operațiunea critică
            logCriticalOperation(httpRequest);
        }
        
        // Continuă cu request-ul
        chain.doFilter(request, response);
    }
    
    private boolean isProtectedEndpoint(String requestURI) {
        for (String endpoint : PROTECTED_ENDPOINTS) {
            if (requestURI.contains(endpoint)) {
                return true;
            }
        }
        return false;
    }
    
    private boolean isAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null) {
            System.out.println("❌ Nu există sesiune activă");
            return false;
        }
        
        String userId = (String) session.getAttribute("userId");
        String userRole = (String) session.getAttribute("userRole");
        
        if (userId == null || userRole == null) {
            System.out.println("❌ Utilizator neautentificat");
            return false;
        }
        
        System.out.println("✅ Utilizator autentificat: " + userId + " (" + userRole + ")");
        return true;
    }
    
    private boolean isAuthorized(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        String userRole = (String) session.getAttribute("userRole");
        
        // Doar admin și manager pot efectua operațiuni fiscale critice
        return "admin".equals(userRole) || "manager".equals(userRole);
    }
    
    private void logCriticalOperation(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        String userId = (String) session.getAttribute("userId");
        String userRole = (String) session.getAttribute("userRole");
        String userIP = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        
        System.out.println("🚨 OPERAȚIUNE CRITICĂ FISCALĂ:");
        System.out.println("   Utilizator: " + userId + " (" + userRole + ")");
        System.out.println("   Endpoint: " + request.getMethod() + " " + request.getRequestURI());
        System.out.println("   IP: " + userIP);
        System.out.println("   User-Agent: " + userAgent);
        System.out.println("   Timestamp: " + java.time.Instant.now());
    }
    
    private void sendUnauthorizedResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json; charset=UTF-8");
        response.getWriter().write(
            "{\"success\":false,\"error\":\"Necesită autentificare pentru această operațiune\",\"code\":401}"
        );
    }
    
    private void sendForbiddenResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json; charset=UTF-8");
        response.getWriter().write(
            "{\"success\":false,\"error\":\"Nu aveți permisiuni pentru această operațiune\",\"code\":403}"
        );
    }
    
    @Override
    public void destroy() {
        System.out.println("🔴 Security Filter distrus");
    }
}

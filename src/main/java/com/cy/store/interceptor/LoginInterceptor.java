package com.cy.store.interceptor;

import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

public class LoginInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Object obj = request.getSession().getAttribute("uid");
        if (obj == null) {
            String uri = request.getRequestURI();
            if (uri != null && (uri.startsWith("/web/") || uri.endsWith(".html"))) {
                response.sendRedirect("/web/login.html");
                return false;
            }

            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json;charset=UTF-8");
            // 为了兼容前端 $.ajax(dataType: 'JSON') 的 success 回调，这里返回 200 + JSON
            response.setStatus(HttpServletResponse.SC_OK);
            PrintWriter writer = response.getWriter();
            writer.write("{\"state\":4005,\"message\":\"未登录\",\"data\":null}");
            writer.flush();
            return false;
        }

        return true;
    }
}

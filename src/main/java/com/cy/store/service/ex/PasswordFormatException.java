// 新增自定义异常：密码格式异常
package com.cy.store.service.ex;

public class PasswordFormatException extends ServiceException {
    public PasswordFormatException() {
        super();
    }

    public PasswordFormatException(String message) {
        super(message);
    }

    public PasswordFormatException(String message, Throwable cause) {
        super(message, cause);
    }

    public PasswordFormatException(Throwable cause) {
        super(cause);
    }

    protected PasswordFormatException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}

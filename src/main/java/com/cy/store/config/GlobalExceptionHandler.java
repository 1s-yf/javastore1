package com.cy.store.config;

import com.cy.store.util.JsonResult;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import javax.servlet.http.HttpServletRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseBody
    public JsonResult<Void> handleMaxUploadSize(MaxUploadSizeExceededException e, HttpServletRequest request) {
        JsonResult<Void> result = new JsonResult<>();
        result.setState(6001);
        result.setMessage("上传的文件太大，请选择较小的文件");
        return result;
    }

    @ExceptionHandler(org.springframework.web.multipart.MultipartException.class)
    @ResponseBody
    public JsonResult<Void> handleMultipartException(Exception e, HttpServletRequest request) {
        JsonResult<Void> result = new JsonResult<>();
        result.setState(6005);
        result.setMessage("文件上传失败：" + e.getMessage());
        return result;
    }
}

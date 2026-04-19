package com.cy.store.controller;

import com.cy.store.controller.ex.FileEmptyException;
import com.cy.store.controller.ex.FileSizeException;
import com.cy.store.controller.ex.FileStateException;
import com.cy.store.controller.ex.FileTypeException;
import com.cy.store.controller.ex.FileUploadIOException;
import com.cy.store.entity.User;
import com.cy.store.service.IUserService;
import com.cy.store.util.JsonResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpSession;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController//@controller+@ResponseBody
@RequestMapping("users")
public class UserController extends BaseController{
    @Autowired
    private IUserService userService;

    //@ResponseBody//表示此方法响应结果以json格式进行数据的响应给前端
    @RequestMapping("reg")
    public JsonResult<Void> reg(User user) {
        userService.reg(user);
        //出错会自动到BaseController中处理异常，如无异常则返回Ok,只有O大写
        return  new JsonResult<>(Ok);
    }

    @RequestMapping("login")
    public JsonResult<User> login(String username, String password, HttpSession session) {
        User data = userService.login(username, password);

        session.setAttribute("uid",data.getUid());
        session.setAttribute("username",data.getUsername());
        System.out.println(getuidFromSession(session));
        System.out.println(getUsernameFromSession(session));
        return new JsonResult<User>(Ok,data);
    }

    @RequestMapping("status")
    public JsonResult<Boolean> status(HttpSession session) {
        Object uid = session.getAttribute("uid");
        Object username = session.getAttribute("username");
        boolean loggedIn = uid != null && username != null;
        return new JsonResult<>(Ok, loggedIn);
    }

    @RequestMapping("logout")
    public JsonResult<Void> logout(HttpSession session) {
        try {
            session.invalidate();
        } catch (IllegalStateException e) {
        }
        return new JsonResult<>(Ok);
    }

    @RequestMapping("change_password")
    public JsonResult<Void> changPassword(String oldPassword,String newPassword,HttpSession session) {
        Integer uid = getuidFromSession(session);
        String username = getUsernameFromSession(session);
        userService.changePassword(oldPassword,uid,username,newPassword);
        return new JsonResult<Void>(Ok);
    }

    @RequestMapping("get_by_uid")
    public JsonResult<User> getByUid(HttpSession session) {
        User data = userService.getByUid(getuidFromSession(session));
        return new JsonResult<>(Ok,data);
    }

    @RequestMapping("change_info")
    public JsonResult<Void> changeInfo(User user, HttpSession session) {
        Integer uid = getuidFromSession(session);
        String usernamem = getUsernameFromSession(session);
        userService.changeInfo(uid,usernamem,user);
        return new JsonResult<>(Ok);
    }

    public static final int AVATAR_MAX_SIZE = 10 * 1024 *1024;

    public static final List<String> AVATAR_TYPE = new ArrayList<>();
    static {
        AVATAR_TYPE.add("image/jpeg");
        AVATAR_TYPE.add("image/png");
        AVATAR_TYPE.add("image/bmp");
        AVATAR_TYPE.add("image/gif");
    }

    @RequestMapping("change_avatar")
    public JsonResult<String> changeAvatar(HttpSession session, MultipartFile file) {
         if (file == null || file.isEmpty()) {
             throw new FileEmptyException("文件为空");
         }
         if (file.getSize() > AVATAR_MAX_SIZE) {
             throw new FileSizeException("文件大小超出限制");
         }
         if (!AVATAR_TYPE.contains(file.getContentType())) {
             throw new FileTypeException("文件类型不支持");
         }

         String parent = session.getServletContext().getRealPath("upload");
         System.out.println("[Avatar] getRealPath('upload') = " + parent);
         if (parent == null) {
             parent = System.getProperty("user.dir") + File.separator + "upload";
             System.out.println("[Avatar] fallback upload dir = " + parent);
         }
         File dir = new File(parent);
         if (!dir.exists()) {
             boolean created = dir.mkdirs();
             System.out.println("[Avatar] mkdirs result = " + created + ", path = " + dir.getAbsolutePath());
         }

         String orignalFilename = file.getOriginalFilename();
        System.out.println("[Avatar] OriginalFilename=" + orignalFilename + ", size=" + file.getSize() + ", contentType=" + file.getContentType());
        String suffix = null;
        if (orignalFilename != null) {
            int dotIndex = orignalFilename.lastIndexOf(".");
            if (dotIndex >= 0 && dotIndex < orignalFilename.length() - 1) {
                suffix = orignalFilename.substring(dotIndex);
            }
        }
        if (suffix == null) {
            String ct = file.getContentType();
            if ("image/jpeg".equals(ct)) {
                suffix = ".jpg";
            } else if ("image/png".equals(ct)) {
                suffix = ".png";
            } else if ("image/gif".equals(ct)) {
                suffix = ".gif";
            } else if ("image/bmp".equals(ct)) {
                suffix = ".bmp";
            } else {
                suffix = ".png";
            }
        }
        String filename = UUID.randomUUID().toString().toUpperCase() + ".png";
        File dest = new File(dir, filename);

        try {
            BufferedImage srcImage = ImageIO.read(file.getInputStream());
            if (srcImage == null) {
                throw new FileTypeException("无法解析图片文件");
            }
            int sw = srcImage.getWidth();
            int sh = srcImage.getHeight();
            int cropSize = Math.min(sw, sh);
            int x = (sw - cropSize) / 2;
            int y = (sh - cropSize) / 2;
            BufferedImage cropped = srcImage.getSubimage(x, y, cropSize, cropSize);
            BufferedImage resized = new BufferedImage(200, 200, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2d = resized.createGraphics();
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.drawImage(cropped, 0, 0, 200, 200, null);
            g2d.dispose();
            ImageIO.write(resized, "png", dest.getAbsoluteFile());
            System.out.println("[Avatar] file saved (200x200) to: " + dest.getAbsolutePath());
        } catch (IllegalStateException e) {
            System.out.println("[Avatar] IllegalStateException: " + e.getMessage());
            e.printStackTrace();
            throw new FileStateException("文件状态异常");
        } catch (IOException e) {
            System.out.println("[Avatar] IOException: " + e.getMessage());
            e.printStackTrace();
            throw new FileUploadIOException("文件读写异常");
        }

        Integer uid = getuidFromSession(session);
        String username = getUsernameFromSession(session);
        String avatar = "/upload/" + filename;
        System.out.println("[Avatar] updating DB: uid=" + uid + ", avatar=" + avatar);
        userService.changeAvatar(uid,avatar,username);
        //
        return new JsonResult<>(Ok,avatar);

    }
}

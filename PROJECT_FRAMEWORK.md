# JavaStore 项目框架文档

> 本文档用于快速了解项目结构，便于环境配置和开发

## 一、技术栈概览

| 层级 | 技术 |
|------|------|
| 后端框架 | Spring Boot 2.7.9 |
| JDK版本 | Java 1.8 |
| 持久层 | MyBatis 2.3.0 |
| 数据库 | MySQL (mysql-connector-j) |
| 构建工具 | Maven |
| 前端 | HTML + JavaScript + Bootstrap3 |

## 二、项目结构

```
JavaStore-master/
├── pom.xml                          # Maven配置
├── src/
│   ├── main/
│   │   ├── java/com/cy/store/       # 主代码目录
│   │   │   ├── StoreApplication.java # 启动类 (@MapperScan已配置)
│   │   │   ├── config/              # 配置类
│   │   │   │   └── LoginInterceptorConfigurer.java  # 登录拦截器配置
│   │   │   ├── controller/          # 控制层 (11个文件)
│   │   │   │   ├── BaseController.java      # 统一异常处理基类
│   │   │   │   ├── UserController.java      # 用户相关接口
│   │   │   │   ├── AddressController.java   # 收货地址接口
│   │   │   │   ├── DistrictController.java  # 省市区接口
│   │   │   │   ├── ProductController.java   # 商品接口
│   │   │   │   └── ex/              # 文件上传异常类
│   │   │   ├── service/             # 业务层
│   │   │   │   ├── IUserService.java        # 用户服务接口
│   │   │   │   ├── IAddressService.java     # 地址服务接口
│   │   │   │   ├── IDistrictService.java    # 省市区服务接口
│   │   │   │   ├── IProductService.java     # 商品服务接口
│   │   │   │   ├── impl/            # 服务实现类
│   │   │   │   │   ├── UserServiceImpl.java
│   │   │   │   │   ├── AddressServiceImpl.java
│   │   │   │   │   ├── DistrictServiceImpl.java
│   │   │   │   │   └── ProductServiceImpl.java
│   │   │   │   └── ex/              # 业务异常类 (11个)
│   │   │   ├── mapper/              # 数据访问层 (DAO)
│   │   │   │   ├── UserMapper.java
│   │   │   │   ├── AddressMapper.java
│   │   │   │   ├── DistrictMapper.java
│   │   │   │   └── ProductMapper.java
│   │   │   ├── entity/              # 实体类
│   │   │   │   ├── BaseEntity.java      # 基础实体 (含createTime等)
│   │   │   │   ├── User.java
│   │   │   │   ├── Address.java
│   │   │   │   ├── District.java
│   │   │   │   └── Product.java
│   │   │   ├── interceptor/         # 拦截器
│   │   │   │   └── LoginInterceptor.java   # 登录状态拦截
│   │   │   └── util/
│   │   │       └── JsonResult.java      # 统一响应格式
│   │   └── resources/
│   │       ├── application.properties    # 配置文件
│   │       ├── mapper/                   # MyBatis XML映射文件
│   │       │   ├── UserMapper.xml
│   │       │   ├── AddressMapper.xml
│   │       │   ├── DistrictMapper.xml
│   │       │   └── ProductMapper.xml
│   │       └── static/                   # 静态资源
│   │           ├── index.html            # 首页
│   │           ├── bootstrap3/           # Bootstrap框架
│   │           ├── css/                  # 样式文件
│   │           ├── js/                   # JS脚本
│   │           ├── images/               # 图片资源
│   │           └── web/                  # 前端页面 (24个HTML)
│   │               ├── login.html        # 登录页
│   │               ├── register.html     # 注册页
│   │               ├── index.html       # 商城首页
│   │               ├── product.html      # 商品详情
│   │               ├── cart.html         # 购物车
│   │               ├── orderConfirm.html # 订单确认
│   │               ├── payment.html      # 支付页
│   │               ├── address.html      # 地址管理
│   │               └── ...
│   └── test/java/                   # 测试代码
└── NotCode/                         # 非代码资源
    ├── sql_src/                     # 数据库初始化SQL
    │   ├── t_user.sql               # 用户表
    │   ├── t_cart.sql               # 购物车表
    │   ├── t_order.sql              # 订单表
    │   ├── t_product.sql            # 商品表
    │   └── t_dict_district.sql      # 省市区字典表
    ├── store_init/                  # 项目素材
    └── 商城项目笔记.md                # 学习笔记
```

## 三、数据库配置

**配置文件位置**: `src/main/resources/application.properties`

```properties
# 数据库连接 (需修改为本地配置)
spring.datasource.url=jdbc:mysql://localhost:3306/store?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=root

# MyBatis配置
mybatis.mapper-locations=classpath:mapper/*.xml
mybatis.configuration.map-underscore-to-camel-case=true

# 文件上传限制
spring.servlet.multipart.maxFileSize=10MB
spring.servlet.multipart.maxRequestSize=15MB

# 业务配置
user.address.max-count=20
```

## 四、数据库表结构

| 表名 | 说明 | 对应实体 |
|------|------|----------|
| t_user | 用户表 | User |
| t_address | 收货地址表 | Address |
| t_dict_district | 省市区字典表 | District |
| t_product | 商品表 | Product |
| t_cart | 购物车表 | - |
| t_order | 订单表 | - |

## 五、核心功能模块

### 1. 用户模块 (User)
- 注册 / 登录 / 登出
- 修改密码 / 个人信息
- 头像上传

### 2. 收货地址模块 (Address)
- 添加 / 删除 / 修改地址
- 默认地址设置
- 地址数量限制 (max 20)

### 3. 省市区模块 (District)
- 省市区三级联动数据

### 4. 商品模块 (Product)
- 商品列表 / 详情
- 热销排行

### 5. 购物车 & 订单模块
- 购物车增删改查
- 订单确认 / 支付流程

## 六、统一响应格式

**JsonResult<T>** - 所有接口返回统一结构:
```java
{
    "state": 200,        // 状态码: 200成功, 其他为错误码
    "message": "提示信息", // 错误时的提示
    "data": {}           // 返回的数据对象
}
```

## 七、异常处理体系

### Controller层异常 (文件上传相关)
- `FileUploadException` - 上传基础异常
- `FileEmptyException` - 文件为空
- `FileSizeException` - 文件大小超限
- `FileTypeException` - 文件类型不支持
- `FileStateException` / `FileUploadIOException`

### Service层异常 (业务逻辑相关)
- `ServiceException` - 业务异常基类
- `UsernameDuplicatedException` - 用户名重复
- `UserNotFoundException` - 用户不存在
- `PasswordNotMatchException` - 密码不匹配
- `AddressCountLimitException` - 地址数量超限
- `InsertException` / `UpdateException` / `DeleteException` - 数据库操作异常

## 八、环境配置步骤

### 1. 数据库准备
```bash
# 1. 创建数据库
CREATE DATABASE store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. 执行SQL脚本 (按顺序)
# NotCode/sql_src/t_dict_district.sql  (省市区数据量大，先执行)
# NotCode/sql_src/t_user.sql
# NotCode/sql_src/t_product.sql
# NotCode/sql_src/t_cart.sql
# NotCode/sql_src/t_order.sql
```

### 2. 修改数据库配置
编辑 `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/store?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
spring.datasource.username=你的用户名
spring.datasource.password=你的密码
```

### 3. 运行项目
```bash
# 方式1: Maven命令
mvn spring-boot:run

# 方式2: 直接运行主类
# com.cy.store.StoreApplication
```

### 4. 访问项目
- 首页: http://localhost:8080/web/index.html
- 登录: http://localhost:8080/web/login.html
- 注册: http://localhost:8080/web/register.html

## 九、关键路径速查

| 用途 | 路径 |
|------|------|
| 启动类 | `com.cy.store.StoreApplication` |
| 配置文件 | `src/main/resources/application.properties` |
| MyBatis XML | `src/main/resources/mapper/` |
| 前端页面 | `src/main/resources/static/web/` |
| SQL脚本 | `NotCode/sql_src/` |

## 十、注意事项

1. **MySQL版本**: 建议 5.7+ 或 8.0+
2. **时区设置**: URL中已配置 `serverTimezone=Asia/Shanghai`
3. **头像上传**: 头像存储路径需确保有写入权限
4. **省市区数据**: `t_dict_district.sql` 文件较大 (~133KB)，包含完整中国省市区数据

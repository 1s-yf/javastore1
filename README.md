# 电脑商城项目 (JavaStore)

> 基于 Spring Boot + MyBatis + MySQL 的电脑商城 Web 应用

---

## 一、技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 后端框架 | Spring Boot | 2.7.9 |
| JDK | OpenJDK | 1.8 |
| 持久层 | MyBatis | 2.3.0 |
| 数据库 | MySQL | 8.0+ |
| 构建工具 | Maven (Maven Wrapper) | 3.8.7 |
| 前端 | HTML + jQuery + Bootstrap3 | — |

---

## 二、环境配置（从零开始）

### 2.1 前置要求

- **JDK 1.8**（推荐 [Eclipse Temurin](https://adoptium.net/)）
- **MySQL 8.0+**
- 不需要单独安装 Maven，项目自带 Maven Wrapper（`mvnw.cmd`）

### 2.2 安装 JDK

1. 下载并安装 JDK 1.8
2. 设置系统环境变量 `JAVA_HOME`，指向 JDK 安装目录（注意不是 `jre` 目录）
   ```
   例如：JAVA_HOME = C:\Program Files\Eclipse Foundation\jdk-8.0.302.8-hotspot
   ```
3. 验证：打开终端执行 `java -version`，确认输出 `1.8.x`

### 2.3 安装 MySQL

**Windows（推荐用 winget）：**
```powershell
winget install --id Oracle.MySQL --accept-package-agreements
winget install --id Oracle.MySQLWorkbench --accept-package-agreements   # 可选，图形化管理工具
```

**安装后需要初始化数据库实例：**

1. 创建数据目录：
   ```powershell
   mkdir "C:\ProgramData\MySQL\MySQL Server 8.4\Data"
   ```

2. 初始化数据库（管理员终端执行）：
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --initialize-insecure --basedir="C:\Program Files\MySQL\MySQL Server 8.4" --datadir="C:\ProgramData\MySQL\MySQL Server 8.4\Data"
   ```

3. 创建配置文件 `C:\ProgramData\MySQL\MySQL Server 8.4\my.ini`：
   ```ini
   [mysqld]
   basedir=C:/Program Files/MySQL/MySQL Server 8.4/
   datadir=C:/ProgramData/MySQL/MySQL Server 8.4/Data
   port=3306
   character-set-server=utf8mb4
   default-time-zone='+08:00'

   [client]
   default-character-set=utf8mb4
   ```

4. 注册 Windows 服务（管理员 PowerShell）：
   ```powershell
   New-Service -Name "MySQL84" -BinaryPathName "`"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe`" --defaults-file=`"C:\ProgramData\MySQL\MySQL Server 8.4\my.ini`"" -DisplayName "MySQL84" -StartupType Automatic
   Start-Service MySQL84
   ```

5. 设置 root 密码（初始密码为空）：
   ```powershell
   & "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root --skip-password -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'root'; FLUSH PRIVILEGES;"
   ```

### 2.4 初始化项目数据库

```powershell
# 定义 mysql 路径变量（方便后续使用）
$mysql = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"

# 1. 创建数据库
& $mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS store CHARACTER SET utf8 COLLATE utf8_general_ci;"

# 2. 导入表结构和数据（使用 gbk 字符集避免 COMMENT 编码报错）
& $mysql -u root -proot store --default-character-set=gbk -e "source NotCode/sql_src/t_user.sql"
& $mysql -u root -proot store --default-character-set=gbk -e "source NotCode/sql_src/t_cart.sql"
& $mysql -u root -proot store --default-character-set=gbk -e "source NotCode/sql_src/t_order.sql"
& $mysql -u root -proot store --default-character-set=gbk -e "source NotCode/sql_src/t_product.sql"

# 3. 省市区表需要特殊处理（name 字段需要加宽）
& $mysql -u root -proot store -e "DROP TABLE IF EXISTS t_dict_district; CREATE TABLE t_dict_district (id int NOT NULL AUTO_INCREMENT, parent varchar(6) DEFAULT NULL, code varchar(6) DEFAULT NULL, name varchar(50) DEFAULT NULL, PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8;"

# 提取 INSERT 语句单独导入
[IO.File]::ReadAllLines('NotCode/sql_src/t_dict_district.sql', [Text.Encoding]::UTF8) | Where-Object { $_ -match '^(LOCK|INSERT|UNLOCK)' } | Set-Content '_tmp.sql' -Encoding UTF8
& $mysql -u root -proot store --default-character-set=utf8 -e "source _tmp.sql"
Remove-Item '_tmp.sql'
```

> **注意**：`t_user.sql` 第一行含 `CREATE DATABASE store`，如果数据库已存在会报 ERROR 1007，可以忽略，不影响后续建表。

### 2.5 检查配置文件

确认 `src/main/resources/application.properties` 中数据库连接信息与你的环境一致：

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/store?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=root
```

### 2.6 启动项目

```powershell
# 1. 确保 MySQL 服务已启动
Start-Service MySQL84

# 2. 设置 JAVA_HOME（如果未永久配置）
$env:JAVA_HOME='你的JDK安装路径'

# 3. 在项目根目录执行
.\mvnw.cmd spring-boot:run
```

看到以下日志说明启动成功：
```
Started StoreApplication in x.xxx seconds
Tomcat started on port(s): 8080 (http)
```

### 2.7 访问项目

| 页面 | 地址 |
|------|------|
| 商城首页 | http://localhost:8080/web/index.html |
| 登录 | http://localhost:8080/web/login.html |
| 注册 | http://localhost:8080/web/register.html |

---

## 三、项目结构

```
src/main/java/com/cy/store/
├── StoreApplication.java          # 启动类
├── config/
│   └── LoginInterceptorConfigurer # 登录拦截器配置（白名单机制）
├── interceptor/
│   └── LoginInterceptor           # 登录拦截器（检查 session 中 uid）
├── controller/                    # 控制层
│   ├── BaseController             # 统一异常处理 + session 工具方法
│   ├── UserController             # 用户：注册/登录/改密/改资料/上传头像
│   ├── AddressController          # 地址：增/删/设默认/列表
│   ├── DistrictController         # 省市区：按 parent 查询
│   ├── ProductController          # 商品：热销列表/按ID查详情
│   └── ex/                        # 文件上传相关异常类 (6个)
├── service/                       # 业务层
│   ├── IUserService / impl        # 用户业务
│   ├── IAddressService / impl     # 地址业务
│   ├── IDistrictService / impl    # 省市区业务
│   ├── IProductService / impl     # 商品业务
│   └── ex/                        # 业务异常类 (11个)
├── mapper/                        # 数据访问层
│   ├── UserMapper                 # 用户 CRUD
│   ├── AddressMapper              # 地址 CRUD
│   ├── DistrictMapper             # 省市区查询
│   └── ProductMapper              # 商品查询（热销 + 按ID）
├── entity/                        # 实体类
│   ├── BaseEntity                 # 公共字段（创建人/时间/修改人/时间）
│   ├── User / Address / District / Product
└── util/
    └── JsonResult<T>              # 统一 JSON 响应格式 {state, message, data}

src/main/resources/
├── application.properties         # 应用配置
├── mapper/*.xml                   # MyBatis XML 映射
└── static/                        # 前端静态资源
    ├── web/                       # 24 个 HTML 页面
    ├── js/                        # JavaScript 脚本
    ├── css/                       # 样式文件
    ├── images/                    # 图片资源
    └── bootstrap3/                # Bootstrap 3 框架

NotCode/sql_src/                   # 数据库初始化 SQL（5 个文件）
```

### 数据库表

| 表名 | 说明 | 对应实体/Mapper |
|------|------|----------------|
| t_user | 用户表 | User / UserMapper |
| t_address | 收货地址表 | Address / AddressMapper |
| t_dict_district | 省市区字典 (3523条) | District / DistrictMapper |
| t_product | 商品表 (56条) | Product / ProductMapper |
| t_product_category | 商品分类表 | 无对应代码 |
| t_cart | 购物车表 | **无对应代码** |
| t_order | 订单表 | **无对应代码** |
| t_order_item | 订单商品表 | **无对应代码** |

---

## 四、已完成功能

| 模块 | 功能 | 前端页面 | 后端接口 | 状态 |
|------|------|----------|----------|------|
| 用户 | 注册 | register.html | `POST /users/reg` | ✅ 完整 |
| 用户 | 登录 | login.html | `POST /users/login` | ✅ 完整 |
| 用户 | 修改密码 | password.html | `POST /users/change_password` | ✅ 完整 |
| 用户 | 个人资料 | userdata.html | `GET /users/get_by_uid` | ✅ 完整 |
| 用户 | 修改资料 | userdata.html | `POST /users/change_info` | ✅ 完整 |
| 用户 | 头像上传 | upload.html | `POST /users/change_avatar` | ✅ 完整 |
| 地址 | 新增地址 | addAddress.html | `POST /addresses/add_new_address` | ✅ 完整 |
| 地址 | 地址列表 | address.html | `GET /addresses/` | ✅ 完整 |
| 地址 | 设为默认 | address.html | `POST /addresses/{aid}/set_default` | ✅ 完整 |
| 地址 | 删除地址 | address.html | `POST /addresses/{aid}/delete` | ✅ 完整 |
| 省市区 | 三级联动 | addAddress.html | `GET /districts/?parent=` | ✅ 完整 |
| 商品 | 热销排行(首页4个) | index.html | `GET /products/hot_list` | ✅ 完整 |
| 商品 | 商品详情 | product.html | `GET /products/{id}/details` | ✅ 完整 |

---


# GROWEALTH Shopify Theme

Dawn-based theme for GROWEALTH. Connect to your Shopify store to develop and preview live.

---

## 如何连接 Shopify 直接开发（看最新效果）

在**本主题目录**下打开终端，执行：

```bash
cd /Users/leon/Documents/code/growealth-shopify-theme
npx shopify theme dev
```

首次运行会提示你：

1. **登录 / 选择店铺**（如 `growealth.myshopify.com` 或你的开发店铺）
2. 选好后会生成一个**开发主题**并给出预览地址

终端里会看到类似：

- **Preview URL**: `http://127.0.0.1:9292`（本地预览，改代码会热更新）
- **Theme editor**: 主题编辑器的链接
- **Shareable link**: 可分享给他人看的预览链接

之后你改 `sections/`、`templates/`、`assets/` 等，保存后刷新或等热更新即可在**该预览链接**里看到效果，这就是「主题直接连到 Shopify 上开发」的方式。

---

## 指定店铺（可选）

如果有多店铺，可以指定 store：

```bash
npx shopify theme dev --store=你的店铺.myshopify.com
```

---

## 未安装 Shopify CLI 时

已用 `npx` 时一般不需要全局安装。若想全局安装：

```bash
npm install -g @shopify/cli @shopify/theme
```

然后可直接用：

```bash
shopify theme dev
```

---

## 和静态原型的区别

| 方式 | 看到的是什么 |
|------|----------------|
| **`npx shopify theme dev`**（本 README） | 真实主题连到 Shopify，用店铺真实商品/内容，改 Liquid/CSS 实时生效 |
| **打开本地 `prototype-homepage.html`** | 静态 HTML 原型，不能连后台，只是设计稿 |

要看**线上/真实主题效果**，请用上面的 `theme dev`；原型文件只用于设计参考。

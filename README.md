# ZenParticles - AI & 手势控制粒子系统

这是一个基于 Web 的实时 3D 粒子系统，结合了 Google Gemini AI 和 MediaPipe 手势识别技术。用户可以通过手势与 3D 粒子进行交互，不仅可以操纵预设形状，还可以通过 AI 生成任意物体的粒子形态。

## ✨ 主要功能

1.  **🖐️ 手势交互控制**
    *   通过摄像头实时捕捉手部动作。
    *   **捏合/靠近**: 粒子聚拢，形成紧凑的形状。
    *   **张开/拉开**: 粒子扩散，模拟爆炸或呼吸效果。

2.  **🤖 Gemini AI 驱动**
    *   集成 Google Gemini 2.5 Flash 模型。
    *   支持自然语言输入（如“一只飞翔的鹰”），实时生成对应的 3D 粒子点云。

3.  **🎨 丰富的视觉效果**
    *   **预设模型**: 包含爱心、花朵、土星、禅定（佛像）、烟花等多种形态。
    *   **颜色自定义**: 提供多种粒子颜色选择，支持实时切换。
    *   **动态渲染**: 基于 Three.js 的高性能粒子渲染，支持 6000+ 粒子流畅运行。

4.  **🖥️ 现代化 UI**
    *   简洁的悬浮面板设计。
    *   实时摄像头调试视图（可切换）。
    *   响应式布局，适配不同屏幕尺寸。

## 🛠️ 技术栈

*   **框架**: [React 19](https://react.dev/)
*   **语言**: [TypeScript](https://www.typescriptlang.org/)
*   **3D 引擎**: [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
*   **AI 模型**: [Google GenAI SDK](https://github.com/google/google-api-javascript-client) (@google/genai)
*   **计算机视觉**: [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
*   **样式**: [Tailwind CSS](https://tailwindcss.com/)
*   **图标**: [Lucide React](https://lucide.dev/)

## 🚀 快速开始

1.  **配置 API Key**: 确保环境变量中配置了有效的 Google Gemini API Key (`API_KEY`)。
2.  **授予权限**: 打开应用时，允许浏览器访问摄像头权限。
3.  **开始交互**:
    *   确保双手在摄像头画面内。
    *   尝试选择不同的模型或颜色。
    *   在输入框中输入描述（例如 "Cyberpunk City"），点击生成。

## 📝 注意事项

*   请在光线充足的环境下使用，以确保 MediaPipe 能准确识别手势。
*   AI 生成的形状基于点云近似，适合表现物体的轮廓和抽象形态。

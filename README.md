# FloraCare 🌿 - AI-Powered Botanical Assistant & Gardening Journal

> **Identify, track, and master plant care with multimodal AI — inspired by real-world gardening volunteer experiences.**

FloraCare is a modern web application designed to help plant enthusiasts, home gardeners, and volunteers catalog their plants, receive AI-generated care instructions via Google Gemini 1.5 Flash Vision, and maintain personalized care schedules.

---

## 🌎 Background & Inspiration

This project was born out of hands-on experience during **Worldpackers volunteering trips**, working as a gardener and groundskeeper. During these volunteer experiences across different eco-lodges, farms, and hostels, identifying native flora and understanding specific watering, sunlight, and fertilizing needs was essential.

FloraCare was built to solve the real challenge of managing diverse plant species, bridging practical field learning with artificial intelligence.

---

## ✨ Features

- 📸 **Mobile Camera & Upload Integration**: Capture live photos of plants directly using smartphone/webcam cameras or upload from your media gallery.
- 🤖 **Multimodal AI Plant Identification**: Powered by **Google Gemini 1.5 Flash Vision**, FloraCare extracts:
  - Common and Botanical/Scientific names.
  - Watering volume (ml) and exact schedule frequency.
  - Ideal sunlight period (Morning Sun, Partial Shade, Full Sun) and daily exposure hours.
  - Best fertilizer recommendations (NPK formulas, Worm Humus, Bokashi) and feeding cycles.
  - Health diagnosis and practical cultivation tips.
- ✏️ **Full Manual Editing & Overrides**: Complete user freedom to manually adjust or override any field (common name, scientific name, watering schedule, sunlight habits, notes) or register plants entirely manually without AI.
- 🪴 **Interactive "My Garden" Collection**: Dashboard with visual hydrometer indicators, "Needs Water Today" alerts, and 1-click watering logs.
- 🔒 **Privacy First & Offline Simulation**: API keys are saved locally in the browser. Includes a realistic offline botanical fallback mode when no API key is provided.

---

## 🚀 Future Roadmap & Vision

- 👤 **User Authentication & Accounts**: Multi-user support with secure login so every gardener can manage their personal garden online.
- 🧳 **Worldpackers Volunteer Portfolio & Study Log**: Record plants cared for, studied, and cultivated during specific volunteer stays around the world, creating a verified gardening portfolio.
- 🎓 **Knowledge-Based Gardener Profiles**: Personalized profile leveling based on practical experience, offering tailored advice for beginners to advanced permaculturists.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, HTML5, CSS3 (Botanical HSL Design System)
- **Icons & UI**: Lucide-React
- **Database & Local Storage**: IndexedDB (`idb-keyval`) & LocalStorage
- **AI Vision Engine**: Google Gemini 1.5 Flash Multimodal Vision API
- **Deployment Ready**: Standard ES Modules / PWA manifest compatible with Netlify, Vercel, and GitHub Pages.

---

## 📜 Changelog

See the full [CHANGELOG.md](CHANGELOG.md) for detailed release history.

### [v1.0.0] - 2026-08-13
- ✨ **Initial Release**: Full implementation of FloraCare web app.
- 📸 **Camera & Storage**: Integrated native browser camera capture and IndexedDB photo persistence.
- 🤖 **Gemini AI Service**: Added Google Gemini 1.5 Flash Vision service with smart simulation fallback.
- ✏️ **Manual Edit System**: Full field editing for common names, botanical names, watering schedules, sunlight needs, and fertilizer notes.
- 🎨 **Botanical UI/UX**: Designed responsive emerald/earth design system with live plant count stats and watering confetti animations.
- 📦 **Deployment Package**: Added `manifest.json`, `vercel.json`, and `_redirects` for 1-click deployment.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

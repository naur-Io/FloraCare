# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- 👤 **User Authentication & Cloud Sync**: Multi-user account support to sync gardens across multiple devices.
- 🧳 **Worldpackers Volunteer Portfolio**: Dedicated logbook to record plants cultivated during volunteering stays across eco-lodges and farms.
- 🎓 **Gardener Profiles & Skill Levels**: Experience progression tailored for beginners up to advanced permaculture practitioners.
- 🔔 **Push Notifications & Care Reminders**: Browser-based notifications for watering and fertilizing schedules.
- 📊 **Growth Journal & History Log**: Timeline tracking plant growth with historic photo check-ins.

---

## [1.0.0] - 2026-08-13

### Added
- 🤖 **AI-Powered Plant Identification**:
  - Multimodal plant recognition using **Google Gemini 1.5 Flash Vision**.
  - Automated extraction of common names, botanical/scientific names, watering volume (ml), sunlight exposure, fertilization suggestions (NPK, humus, bokashi), and health diagnostics.
  - Realistic botanical fallback simulation when API keys are not provided.
  - Real-time status indicators in Navbar and modals distinguishing between Live Gemini AI and Botanical Simulation Mode.
- 📸 **Camera & Image Capture**:
  - Live in-app camera capture with front/back camera toggle support.
  - File upload picker for existing gallery photos.
  - Dynamic image preview with re-take and replace capabilities.
- 🪴 **Garden Management Dashboard ("My Garden")**:
  - Visual plant cards with hydrometer status indicators.
  - "Needs Water Today" dynamic alerting system based on watering intervals and timestamps.
  - 1-click watering action with animated confetti celebrations via `canvas-confetti`.
  - Delete and inspect plant details directly from the dashboard.
- ✏️ **Manual Registration & Full Editing**:
  - Complete form override allowing users to adjust or fully register plant data without AI.
  - Editable fields for common name, scientific name, watering schedule, sunlight requirements, and notes.
- 💾 **Local Storage & Privacy**:
  - High-capacity photo and metadata storage using browser IndexedDB (`idb-keyval`).
  - Secure local storage of Gemini API keys directly in the client browser.
- 🎨 **Botanical Design System**:
  - Custom responsive UI built with vanilla CSS tokens (emerald/forest color palette).
  - Modern iconography provided by `lucide-react`.
  - Accessible modal dialogs and smooth micro-interactions.
- 🚀 **PWA & Deployment Configurations**:
  - Web App Manifest (`manifest.json`) for progressive web app compatibility.
  - Production deployment configs for Netlify (`_redirects`) and Vercel (`vercel.json`).

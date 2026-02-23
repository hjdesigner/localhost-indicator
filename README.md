![Logo](./icon-active128.png)
# 🟣 Localhost Indicator

Never confuse localhost with production again!

A Chrome extension that provides clear visual indicators when you're working on localhost, preventing costly mistakes and confusion during development.

### Normal Site
![Logo](./not-localhost.png)

### Localhost Site
![Logo](./localhost.gif)

## 🎯 Problem
Ever spent 30 minutes debugging why your changes weren't showing up, only to realize you were testing on production instead of localhost? We've all been there.

## ✨ Solution
Localhost Indicator adds multiple visual cues that make it impossible to miss when you're on localhost:

- 🎯 Pulsing Favicon - Changes color between two purple shades
- 🟣 Tab Title Prefix - Adds 🟣 [DEV] before your page title
- ✨ Pulsing Extension Icon - Alternates between two icon states
- 🔵 Pulsing Badge - "DEV" badge with color animation

## 🚀 Installation

Option 1: Install from Chrome Web Store (Coming Soon)
Extension pending Chrome Web Store approval

Option 2: Install Manually
Download or Clone this repository:

Load the Extension:

Open Chrome and go to chrome://extensions/
Enable Developer mode (toggle in top right)
Click Load unpacked
Select the localhost-indicator folder


Done! Open http://localhost:3000 to see it in action


## 🔧 What URLs Are Detected?
The extension automatically detects these localhost patterns:

✅ localhost
✅ 127.0.0.1
✅ [::1] (IPv6 localhost)
✅ *.local (e.g., mysite.local)
✅ 192.168.x.x (local network)
✅ 10.x.x.x (local network)


📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
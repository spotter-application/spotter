<p align="center">
  <img src="/preview/icon.png?raw=true" alt="" height="100" />
</p>

# Spotter [![Thanks](https://bit.ly/saythankss)](https://github.com/sponsors/ziulev)

<a href="https://www.producthunt.com/posts/spotter-4?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-spotter-4" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=280842&theme=dark&period=daily" alt="Spotter - Productivity tool that allows you to launch everything | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

Productivity tool to launch everything (e.g. switch the next song, connect bluetooth device, set a timer, etc.) so you can stay focused on your current task.

* ❤️&nbsp;&nbsp;&nbsp;<b>Open source</b>
* 🤖&nbsp;&nbsp;&nbsp;<b>Native</b>
* 🔌&nbsp;&nbsp;&nbsp;<b>Plugins</b>
* ⌨️&nbsp;&nbsp;&nbsp;<b>Custom hotkeys</b>
* ⬆️&nbsp;&nbsp;&nbsp;<b>Sort options by frequency of use</b>
* 📦&nbsp;&nbsp;&nbsp;<b>Small size</b>

## 💬 Private community chat
[invitation link](https://t.me/joinchat/gOsSBJI5pU43ZWM8)

## Installation

```brew install --cask spotter```

Installation instructions and alternatives are available on https://spotter-application.github.io/getspotterapp

## Hotkeys
Default hotkey to run the app ```double shift```

## Plugins

### Applications
* ```<app_name>```

### Bluetooth
* ```bluetooth```
* ```<device_name>```

### Currency converter
* ```1 usd```
* ```100 euro in usd```

### System commands
* ```sleep```
* ```shutdown```
* ```restart```
* ```logout```

### Timer
* ```15m```

### Emoji
* ```e rocket```

### Kill applications
* ```<app_name> <tab> close```

### Applications dimensions
* ```save application positions```
* ```restore application positions```

### Spotify
* ```spotify <tab> play```
* ```spotify <tab> pause```
* ```spotify <tab> next```
* ```spotify <tab> previous```
* ```spotify <tab> mute```
* ```spotify <tab> unmute```
* ```spotify <tab> share```

### Calculator
* ```256/8```
* ```256*8=```

### Browser
* ```github.com```

### [Pass](https://www.passwordstore.org/)
* ```p email/gmail```

## The main idea

* 🔮&nbsp;&nbsp;&nbsp;Provide an api on the native level
* ⚛️&nbsp;&nbsp;&nbsp;React app uses it and implements various plugins

It will allow the application to remain native and be available for developing javascript/typescript plugins.

## Requirements
* macOS Big Sur

## Contributing
After cloning & setting up the local project you can push the changes to your github fork and make a pull request.

Contributions are always welcome, no matter how large or small.

## How to develop
**React native requirements:**
*  [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)  version 11.3.1 or newer

* Ensure to install Xcode Command Line Tools. Open Xcode, then choose “Preferences…” from the Xcode menu. Go to the Locations panel and install the tools by selecting the most recent version in the Command Line Tools dropdown.

* Install  [CocoaPods](https://guides.cocoapods.org/using/getting-started.html)
`sudo gem install cocoapods`

* Install  [Node.js](https://nodejs.org/)  version 12 LTS or newer via  [HomeBrew](https://brew.sh/)
 `brew install node`

* Install  [Watchman](https://facebook.github.io/watchman)
`brew install watchman`

**Project**
* Clone repo
`git clone  https://github.com/spotter-application/spotter.git`

* Install node modules
`cd spotter && npm i`

* Install pods
`npm run install:macos`

* Run project
`npm start`

## Troubleshooting

#### "spotter.app" is damaged and can’t be opened.
```xattr -cr /Applications/spotter.app```

#### The application "spotter" can’t be opened.
```chmod +x "/Applications/spotter.app/Contents/MacOS/Spotter"```

#### spotter can’t be opened because Apple cannot check it for malicious software.

Go to System Preference -> Security & Privacy -> General -> And Press "Open Anyway"

## License
GNU General Public License

<p align="center">
  <img src="/preview/icon.png?raw=true" alt="" height="100" />
</p>

# Spotter [![Thanks](https://bit.ly/saythankss)](https://github.com/sponsors/ziulev)

<a href="https://www.producthunt.com/posts/spotter-4?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-spotter-4" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=280842&theme=dark&period=daily" alt="Spotter - Productivity tool that allows you to launch everything | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

Productivity tool to launch everything.<br/>
Switch song, connect bluetooth device, set a timer, and a lot of other things.<br />
So you can stay focused on your current task.

* ❤️&nbsp;&nbsp;&nbsp;<b>Open source</b>
* 🤖&nbsp;&nbsp;&nbsp;<b>Native</b>
* 🔮&nbsp;&nbsp;&nbsp;<b>Fast</b>
* 📦&nbsp;&nbsp;&nbsp;<b>Lightweight</b>
* 🔌&nbsp;&nbsp;&nbsp;<b>[Plug-in support](https://github.com/ziulev/spotter-core/tree/main/packages)</b>
* ⬆️&nbsp;&nbsp;&nbsp;<b>Sort options by frequency of use</b>

## 💬 Community
[Telegram channel](https://t.me/joinchat/HG4MQi1-91Y0NGVk)

## ⌨️ Installation
```brew install --cask spotter```

Default hotkey to run the app ```double shift```

## 🔌 Plugins

- [Spotter team plugins](https://github.com/ziulev/spotter-core/tree/main/packages)

## 🤖 Requirements
* macOS Big Sur
* Node

## 🖤 How to develop

Contributions are always welcome, no matter how large or small.

**Requirements:**
* [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)

* [CocoaPods](https://guides.cocoapods.org/using/getting-started.html)
`sudo gem install cocoapods`

* [Node.js](https://nodejs.org/)
 `brew install node`

* [Watchman](https://facebook.github.io/watchman)
`brew install watchman`

**Run:**
* Clone repo
`git clone https://github.com/ziulev/spotter.git spotter && cd $_`

* Install deps
`yarn && npx pod-install`

* Run
`yarn start`

## ⚠️ Troubleshooting

#### Spotter can’t be opened because Apple cannot check it for malicious software.
Go to System Preference -> Security & Privacy -> General -> And Press "Open Anyway"

#### "Spotter.app" is damaged and can’t be opened.
```xattr -cr /Applications/Spotter.app```

#### The application "Spotter" can’t be opened.
```chmod +x "/Applications/Spotter.app/Contents/MacOS/Spotter"```

## License
GNU General Public License

# Maintainer: Denis Ziulev <ziulev@pm.me>
pkgname=spotter
pkgver=1.9.8
pkgrel=1
pkgdesc="Simple and powerful tool to launch everything"
arch=('x86_64')
url="https://github.com/spotter-application/spotter"
license=('GNU')
depends=()
makedepends=('flutter' 'cmake' 'ninja' 'clang')
provides=("$pkgname")
conflicts=("$pkgname")
source=("$pkgname-$pkgver.tar.xz"::"https://github.com/spotter-application/spotter/archive/refs/tags/$pkgver.tar.gz")
sha256sums=("SKIP")

build() {
  cd "$pkgname-$pkgver"

  flutter build linux --release
}

package() {
  cd "$pkgname-$pkgver"

  install -Dm755 build/linux/x64/release/bundle/spotter "$pkgdir/opt/$pkgname/spotter"
  install -Dm644 assets/resources/spotter.desktop "${pkgdir}/usr/share/applications/spotter.desktop"
  install -Dm644 assets/resources/spotter.svg "${pkgdir}/usr/share/icons/spotter.svg"

  cp -R build/linux/x64/release/bundle/data "$pkgdir/opt/$pkgname"
  cp -R build/linux/x64/release/bundle/lib "$pkgdir/opt/$pkgname"

  install -d "$pkgdir/usr/bin/"
  ln -s /opt/$pkgname/spotter "$pkgdir/usr/bin/spotter"
}

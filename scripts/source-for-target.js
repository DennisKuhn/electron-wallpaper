const os = require('os');

const platformsSources = {
    linux: 'src/electronwallpaper_linux.cc',
    win32: 'src/electronwallpaper_win.cc'
}

console.log(platformsSources[process.platform] || 'src/electronwallpaper_noop.cc');
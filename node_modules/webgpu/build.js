const fs = require("fs");
const ncp = require("ncp");
const { spawn } = require("child_process");

const pkg = require("./package.json");

const platform = process.platform;
const v8Version = process.versions.v8;
const nodeVersion = process.versions.node;
const architecture = process.arch;

ncp.limit = 16;

const dawnVersion = process.env.npm_config_dawnversion;
if (!dawnVersion) throw `No Dawn version --dawnversion specified!`;

const bypassBuild = !!process.env.npm_config_bypass_build;

const msvsVersion = process.env.npm_config_msvsversion || "";

const generatePath = `${pkg.config.GEN_OUT_DIR}/${dawnVersion}/${platform}`;

const unitPlatform = (
  platform === "win32" ? "win" :
  platform === "linux" ? "linux" :
  platform === "darwin" ? "darwin" :
  "unknown"
);

if (unitPlatform === "unknown") {
  process.stderr.write(`Unsupported platform!\n`);
  process.stderr.write(`Exiting..\n`);
  return;
}

// generated/version/
if (!fs.existsSync(generatePath)) {
  process.stderr.write(`Cannot find bindings for ${dawnVersion} in ${generatePath}\n`);
  process.stderr.write(`Exiting..\n`);
  return;
}

if (bypassBuild) {
  process.stderr.write(`Skipping build..\n`);
}

// build
// build/release
let buildDir = `${generatePath}/build/`;
let buildOutputDir = buildDir + "Release/";
if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);
if (!fs.existsSync(buildOutputDir)) fs.mkdirSync(buildOutputDir);

process.stdout.write(`
Compiling bindings for version ${dawnVersion}...
Platform: ${platform} | ${architecture}
Node: ${nodeVersion}
V8: ${v8Version}
`);

function copyFiles() {
  process.stdout.write(`\nCopying files..\n`);
  return new Promise(resolve => {
    // copy files into release folder
    let dawnDir = fs.readFileSync(pkg.config.DAWN_PATH, "utf-8");
    let dawnOutputDir = dawnDir + "/out/Shared";
    let baseDir = `./lib/${unitPlatform}/${architecture}`;
    let targetDir = buildOutputDir;
    let files = [
      // src folder
      [`./src/`, targetDir + "/../../src/"]
    ];
    // add win32 runtime files
    if (platform === "win32") {
      files.push([`${baseDir}/GLFW/glfw3.dll`, targetDir]);
      files.push([`${baseDir}/DXC/dxcompiler.dll`, targetDir]);
      files.push([`${baseDir}/DXC/dxil.dll`, targetDir]);
      // dawn dlls
      {
        //files.push([`${dawnOutputDir}/libc++.dll`, targetDir]);
        //files.push([`${dawnOutputDir}/libdawn.dll`, targetDir]);
        files.push([`${dawnOutputDir}/dawn_native.dll`, targetDir]);
        files.push([`${dawnOutputDir}/dawn_proc.dll`, targetDir]);
        files.push([`${dawnOutputDir}/dawn_wire.dll`, targetDir]);
        files.push([`${dawnOutputDir}/libshaderc.dll`, targetDir]);
        files.push([`${dawnOutputDir}/libshaderc_spvc.dll`, targetDir]);
      }
      // dawn libs
      {
        //files.push([`${dawnOutputDir}/libc++.dll.lib`, targetDir + "/../"]);
        //files.push([`${dawnOutputDir}/libdawn.dll.lib`, targetDir + "/../"]);
        files.push([`${dawnOutputDir}/dawn_native.dll.lib`, targetDir + "/../"]);
        files.push([`${dawnOutputDir}/dawn_proc.dll.lib`, targetDir + "/../"]);
        files.push([`${dawnOutputDir}/dawn_wire.dll.lib`, targetDir + "/../"]);
        files.push([`${dawnOutputDir}/libshaderc.dll.lib`, targetDir + "/../"]);
        files.push([`${dawnOutputDir}/libshaderc_spvc.dll.lib`, targetDir + "/../"]);
      }
    }
    // add darwin runtime files
    else if (platform === "darwin") {
      files.push([`${dawnOutputDir}/libdawn_native.dylib`, targetDir]);
      files.push([`${dawnOutputDir}/libdawn_proc.dylib`, targetDir]);
      files.push([`${dawnOutputDir}/libdawn_wire.dylib`, targetDir]);
      files.push([`${dawnOutputDir}/libshaderc_spvc.dylib`, targetDir]);
      files.push([`${dawnOutputDir}/libshaderc.dylib`, targetDir]);
      files.push([`${dawnOutputDir}/libc++.dylib`, targetDir]);
    }
    else if (platform === "linux") {
      files.push([`${dawnOutputDir}/libdawn_native.so`, targetDir]);
      files.push([`${dawnOutputDir}/libdawn_proc.so`, targetDir]);
      files.push([`${dawnOutputDir}/libdawn_wire.so`, targetDir]);
      files.push([`${dawnOutputDir}/libshaderc_spvc.so`, targetDir]);
      files.push([`${dawnOutputDir}/libshaderc.so`, targetDir]);
      files.push([`${dawnOutputDir}/libc++.so`, targetDir]);
    }
    let counter = 0;
    if (!files.length) return resolve(true);
    files.map(entry => {
      let source = entry[0];
      let target = entry[1];
      // copy single files
      let fileName = source.replace(/^.*[\\\/]/, "");
      let isFile = fileName.length > 0;
      if (isFile) target += "/" + fileName;
      // copy
      ncp(source, target, error => {
        process.stdout.write(`Copying ${source} -> ${target}\n`);
        if (error) {
          process.stderr.write(`Failed to copy ${source} -> ${target}\n`);
          throw error;
        }
      });
      if (counter++ >= files.length - 1) {
        process.stdout.write("Done!\n");
        resolve(true);
      }
    });
  });
};

function buildFiles() {
  process.stdout.write(`\nCompiling bindings..\n`);
  return new Promise(resolve => {
    let msargs = "";
    // add win32 vs version
    if (platform === "win32") {
      msargs += `--msvs_version ${msvsVersion}`;
    }
    let cmd = `cd ${generatePath} && node-gyp configure && node-gyp build`;
    let shell = spawn(cmd, { shell: true, stdio: "inherit" }, { stdio: "pipe" });
    shell.on("exit", error => {
      if (!error) {
        actionsAfter();
        process.stdout.write("Done!\n");
      }
      resolve(!error);
    });
  });
};

function inlineMemoryLayouts() {
  const addon = require(`${buildOutputDir}/addon-${platform}.node`);
  if (!addon.$getMemoryLayouts) return;
  process.stdout.write(`Inlining memory layouts..\n`);
  let memoryLayouts = addon.$getMemoryLayouts();
  if (!fs.existsSync(`${generatePath}/memoryLayouts.json`)) {
    process.stdout.write(`Pending bootstrapping, module should be re-generated!\n`);
  }
  fs.writeFileSync(`${generatePath}/memoryLayouts.json`, JSON.stringify(memoryLayouts, null, 2));
};

function actionsAfter() {
  //inlineMemoryLayouts();
};

(async function run() {
  await copyFiles();
  let buildSuccess = false;
  if (!bypassBuild) {
    buildSuccess = await buildFiles();
  } else {
    buildSuccess = true;
  }
  if (buildSuccess) {
    process.stdout.write(`\nSuccessfully compiled bindings for ${dawnVersion}!\n`);
  } else {
    process.stderr.write(`\nFailed to compile bindings for ${dawnVersion}!`);
  }
})();

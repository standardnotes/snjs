import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import crypto from 'crypto';
import { spawnSync as spawn } from 'child_process';
import { Features } from './dist/Domain/Feature/Features.js';
import { FeatureIdentifier } from './dist/Domain/Feature/FeatureIdentifier.js';

function zipDirectory(sourceDir, outPath) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', (err) => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

const SOURCE_FILES_PATH = 'src/Static';
const DIST_FILES_PATH = 'dist/static';

const copyFileOrDir = (src, dest) => {
  const isDir = fs.lstatSync(src).isDirectory();
  if (isDir) {
    ensureDirExists(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      entry.isDirectory()
        ? copyFileOrDir(srcPath, destPath)
        : fs.copyFileSync(srcPath, destPath);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
};

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const copyToDist = async (feature) => {
  ensureDirExists(DIST_FILES_PATH);

  const srcComponentPath = `${path.join(
    SOURCE_FILES_PATH,
    feature.identifier
  )}`;
  const targetComponentPath = `${path.join(
    DIST_FILES_PATH,
    feature.identifier
  )}`;

  ensureDirExists(targetComponentPath);

  for (const file of feature.static_files) {
    const srcFilePath = path.join(srcComponentPath, file);
    if (!fs.existsSync(srcFilePath)) {
      continue;
    }
    const targetFilePath = path.join(targetComponentPath, file);
    copyFileOrDir(srcFilePath, targetFilePath);
  }
};

const hasExistingRelease = async (repo, version) => {
  const child = spawn('gh', ['release', 'view', `--repo`, repo, `${version}`]);
  return child.stderr.toString().length === 0;
};

const createRelease = async (feature, zipPath) => {
  console.log(`Creating release for ${feature.identifier}`);
  const ghUpload = spawn('gh', [
    'release',
    'create',
    `${feature.version}`,
    zipPath,
    `--repo`,
    feature.git_repo,
    '--target',
    'main',
    '--title',
    feature.version,
  ]);

  const uploadError = ghUpload.stderr.toString();
  return uploadError;
};

const computeChecksum = async (zipPath, version) => {
  const zipData = fs.readFileSync(zipPath, 'base64');
  const base64 = crypto.createHash('sha256').update(zipData).digest('hex');
  const checksumProcess = spawn('sha256sum', [zipPath]);
  const checksumString = checksumProcess.stdout.toString();
  const binary = checksumString.split('  ')[0];
  return {
    version,
    base64,
    binary,
  };
};

const ChecksumsSrcPath = path.join(SOURCE_FILES_PATH, 'checksums.json');
const ChecksumsDistPath = path.join(DIST_FILES_PATH, 'checksums.json');
const Checksums = JSON.parse(fs.readFileSync(ChecksumsSrcPath).toString());
console.log('Loaded existing checksums', Checksums);

const processFeature = async (feature) => {
  // if (await hasExistingRelease(feature.git_repo, feature.version)) {
  //   console.log(
  //     `Feature ${feature.identifier} already has release ${feature.version}` +
  //       `skipping zip + publish and reusing existing checksum ${
  //         Checksums[feature.identifier]
  //       }`
  //   );
  //   continue;
  // }
  const directory = `src/Static/${feature.identifier}`;
  const outZip = `tmp/${feature.identifier}.zip`;
  await zipDirectory(directory, outZip);
  console.log(`Zipped to ${outZip}`);

  // const uploadError = await createRelease(feature, outZip);
  // if (uploadError.length > 0) {
  //   throw Error(
  //     `Error creating release ${feature.identifier}@${feature.version}, aborting process`
  //   );
  // }

  const checksum = await computeChecksum(outZip, feature.version);
  Checksums[feature.identifier] = checksum;
  console.log(`Computed checksums for ${feature.identifier}:`, checksum);

  copyToDist(feature);
};

// const TmpWhiteListedEditors = [
//   FeatureIdentifier.CodeEditor,
//   FeatureIdentifier.BoldEditor,
// ];

await (async () => {
  for (const feature of Features) {
    if (feature.download_url) {
      // if (!TmpWhiteListedEditors.includes(feature.identifier)) {
      //   continue;
      // }
      await processFeature(feature);
      console.log('\n\n');
    }
  }

  fs.writeFileSync(ChecksumsSrcPath, JSON.stringify(Checksums, undefined, 2));
  console.log('Succesfully wrote checksums', Checksums);
  copyFileOrDir(ChecksumsSrcPath, ChecksumsDistPath);
})();

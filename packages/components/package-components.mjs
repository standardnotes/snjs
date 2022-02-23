import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync as spawn } from 'child_process';
import {
  GetFeatures,
  GetDeprecatedFeatures,
} from '../features/dist/Domain/Feature/Features.js';
import { Runtime } from '../common/dist/Domain/DataType/Runtime.js';
const SOURCE_FILES_PATH = '../../node_modules';
import zip from '@standardnotes/deterministic-zip';

console.log('Beginning packaging procedure...');

const specificFeatureIdentifier = process.argv[2];
if (specificFeatureIdentifier) {
  console.log('Processing only', specificFeatureIdentifier);
}

const TmpDir = 'tmp';
const TmpZipDir = path.join(TmpDir);
const ComponentsDir = path.join('all');

const ChecksumsSrcPath = path.join(ComponentsDir, 'checksums.json');
const ChecksumsDistPath = path.join(ComponentsDir, 'checksums.json');
const Checksums = JSON.parse(fs.readFileSync(ChecksumsSrcPath).toString());
console.log('Loaded existing checksums from', ChecksumsSrcPath);

const LocationMapping = JSON.parse(
  fs.readFileSync('identifier-to-package.json')
);

async function zipDirectory(sourceDir, outPath) {
  return new Promise((resolve) => {
    zip(sourceDir, outPath, { cwd: sourceDir }, (err) => {
      console.log(`Zipped to ${outPath}`);
      resolve();
    });
  });
}

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

const copyToTmp = async (feature) => {
  const location = LocationMapping[feature.identifier];
  const srcComponentPath = path.join(SOURCE_FILES_PATH, location);
  const targetComponentPath = `${path.join(ComponentsDir, feature.identifier)}`;

  ensureDirExists(targetComponentPath);

  for (const file of feature.static_files) {
    const srcFilePath = path.join(srcComponentPath, file);
    if (!fs.existsSync(srcFilePath)) {
      continue;
    }
    const targetFilePath = path.join(targetComponentPath, file);
    copyFileOrDir(srcFilePath, targetFilePath);
  }

  return targetComponentPath;
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
    feature.git_repo_url,
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

const processFeature = async (feature) => {
  console.log('Processing feature', feature.identifier, '...');
  if (await hasExistingRelease(feature.git_repo_url, feature.version)) {
    console.log(
      `Feature ${feature.identifier} already has release ${feature.version} ` +
        `skipping zip + publish and reusing existing checksum ${JSON.stringify(
          Checksums[feature.identifier]
        )}`
    );
    return;
  }

  const distPath = await copyToTmp(feature);

  const directory = distPath;
  const outZip = `${TmpZipDir}/${feature.identifier}.zip`;
  await zipDirectory(directory, outZip);

  const uploadError = await createRelease(feature, outZip);
  if (uploadError.length > 0) {
    throw Error(
      `Error creating release ${feature.identifier}@${feature.version}, aborting process. ${uploadError}`
    );
  }

  const checksum = await computeChecksum(outZip, feature.version);
  Checksums[feature.identifier] = checksum;
  console.log(`Computed checksums for ${feature.identifier}:`, checksum);
};

await (async () => {
  ensureDirExists(TmpDir);
  ensureDirExists(TmpZipDir);

  const featuresToProcess = specificFeatureIdentifier
    ? [
        GetFeatures(Runtime.Dev).find(
          (feature) => feature.identifier === specificFeatureIdentifier
        ),
      ]
    : GetFeatures(Runtime.Dev).concat(GetDeprecatedFeatures());

  let index = 0;
  for (const feature of featuresToProcess) {
    if (index === 0) {
      console.log('\n---\n');
    }
    if (feature.download_url) {
      await processFeature(feature);
    } else {
      console.log(
        'Feature does not have download_url, not packaging',
        feature.identifier
      );
    }
    if (index !== featuresToProcess.length - 1) {
      console.log('\n---\n');
    }
    index++;
  }

  fs.writeFileSync(ChecksumsSrcPath, JSON.stringify(Checksums, undefined, 2));
  console.log('Succesfully wrote checksums to', ChecksumsSrcPath);
  copyFileOrDir(ChecksumsSrcPath, ChecksumsDistPath);
})();

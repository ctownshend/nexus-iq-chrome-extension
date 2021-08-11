/*
 * Copyright (c) 2019-present Sonatype, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {readFileSync} from 'fs';
import {PackageURL} from 'packageurl-js';
import {join} from 'path';
import {DATA_SOURCES, FORMATS, RepoType, REPOS} from '../Constants';
import {getArtifactDetailsFromDOM} from '../PageParsing';

describe('Repo1MavenOrg Page Parsing', () => {
  test('should parse a valid Repo1MavenOrg page', () => {
    const html = readFileSync(join(__dirname, 'testdata/Repo1MavenOrg.html'));

    window.document.body.innerHTML = html.toString();
    //https://search.maven.org/artifact/org.apache.struts/struts2-core/2.3.30/jar
    const rt: RepoType = {
      repoID: REPOS.repo1MavenOrg,
      url: '',
      repoFormat: FORMATS.maven,
      titleSelector: '',
      versionPath: '',
      dataSource: DATA_SOURCES.NEXUSIQ,
      appendVersionPath: ''
    };

    const packageURL: PackageURL = getArtifactDetailsFromDOM(
      rt,
      'https://repo1.maven.org/maven2/org/apache/struts/struts2-core/2.3.30/'
    );

    expect(packageURL).toBeDefined();
    expect(packageURL?.type).toBe('maven');
    expect(packageURL?.namespace).toBe('org.apache.struts');
    expect(packageURL?.name).toBe('struts2-core');
    expect(packageURL?.version).toBe('2.3.30');
  });
});

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
import {PackageURL} from 'packageurl-js';
import {DATA_SOURCES, FORMATS} from '../utils/Constants';
import {Artifact} from './Artifact';

export class PyPIArtifact extends Artifact {
  constructor(
    readonly name: string,
    readonly version: string,
    readonly qualifier: string = '',
    readonly extension: string = 'tar.gz'
  ) {
    super(FORMATS.pypi, null, DATA_SOURCES.NEXUSIQ, name, version);
  }

  public display(): string {
    return this.name;
  }

  public toPurl(): string {
    const qualifiers = {extension: this.extension};

    return new PackageURL(
      this.format,
      undefined,
      this.name,
      this.version,
      qualifiers,
      undefined
    ).toString();
  }
}

module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: "eslint:recommended",
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    _: false,
    $: false,
    axios: false,
    CVSS: false,
    chrome: false,
    messageTypes: false,
    addCookies: false,
    addDataOSSIndex: false,
    beginEvaluation: false,
    BuildSettings: false,
    BuildSettingsFromGlobal: false,
    checkPageIsHandled: false,
    dataSources: false,
    evaluateComponent: false,
    GetActiveTab: false,
    GetCVEDetails: false,
    NexusFormat: false,
    NexusFormatMaven: false,
    removeCookies: false,
    formats: false,
    nexusRepoformats: false,
    artifact: false,
    setArtifact: false,
    settings: false,
    nexusArtifact: false,
    hasVulns: false,
    GetAllVersions: false,
    setHasVulns: false,
    Insight: false,
    styleCVSS: false,
    MavenCoordinates: false,
    SetHash: false,
    CVSSDetails: false,
    getRemediation: false,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "no-constant-condition": "off",
    "no-global-assign": "off",
    "no-case-declarations": "off",
    "no-unused-vars": [
      "off",
      { vars: "all", args: "after-used", ignoreRestSiblings: false },
    ],
    "no-irregular-whitespace": [
      "off",
      { vars: "all", args: "after-used", ignoreRestSiblings: false },
    ],
    "no-unreachable": [
      "off",
      { vars: "all", args: "after-used", ignoreRestSiblings: false },
    ],
  },
};

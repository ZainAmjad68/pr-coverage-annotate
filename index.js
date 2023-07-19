const core = require('@actions/core');
const {Octokit} = require('@octokit/rest');
const fetch = require("node-fetch");
const {Toolkit} = require('actions-toolkit');
const getDiffWithLineNumbers = require('./git_diff');
const coverageReportToJs = require('./lcov-to-json');

const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE;

Toolkit.run(async (tools) => {
  try {
    const githubToken = core.getInput('token');
    const octokit = new Octokit({
      previews: ['antiope'],
      auth: githubToken,
      request: {fetch}
    });

    let prData = await getDiffWithLineNumbers('HEAD^1');
    console.log(`******* PR Data ********`);
    prData.forEach((fileData) => {
      console.log('--------------');
      console.log(`File: ${fileData.fileName}`);
      fileData.data.forEach((lineData) => {
        console.log(lineData);
      });
      console.log('--------------');
    });

    const coverageReportPath = core.getInput('coverage-info-path');
    let coverageJSON = await coverageReportToJs(coverageReportPath);
    console.log(`******* Coverage Data ********`);
    coverageJSON.forEach((fileCoverage) => {
      console.log('--------------');
      console.log(fileCoverage);
      if (fileCoverage.functions && fileCoverage.functions.details) {
        console.log(fileCoverage.functions);
        fileCoverage.functions.details.forEach((detail) => {
          console.log(`fileCoverage.functions.details: `, detail);
        });
      }
      if (fileCoverage.lines && fileCoverage.lines.details) {
        console.log(fileCoverage.lines);
        fileCoverage.lines.details.forEach((detail) => {
          console.log(`fileCoverage.lines.details: `, detail);
        });
      }
      console.log('--------------');
    });

  } catch (error) {
    tools.exit.failure(error.message);
  }

  // If we got this far things were a success
  tools.exit.success('PR Scan and Warn Analysis completed successfully!')
});
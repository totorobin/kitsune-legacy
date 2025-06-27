export default {
  default: {
    paths: ['tests/cucumber/features/**/*.feature'],
    require: ['tests/cucumber/step_definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:cucumber-report.html'],
    publishQuiet: true
  }
};

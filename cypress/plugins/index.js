const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('before:run', async () => {
        console.log('Running setup tasks before tests...');
      });

      on('after:run', async () => {
        console.log('Running cleanup tasks after tests...');
      });

      return config;
    },
  },
});

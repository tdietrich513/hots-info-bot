const shell = require("shelljs");

shell.cp("secrets.json", "dist/");
shell.cp("-R", "heroes-talents/hero/.", "dist/hero-data/");
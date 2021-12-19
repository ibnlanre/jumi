//  "tailwind:build": "npx tailwindcss -i styles/global.css -o styles/build.css",

const clc = require("chalk");
const program = require("commander");
const pkg = require("./package.json");
const cssPurge = require("./lib/css-purge");
const PurgeCSS = require("purgecss");
const fs = require("fs");

const purgecss = new Purgecss({
  content: ["out/**/*.html"],
  css: ["out/app.css"],
  fontFace: true,
});
const purgecssResult = purgecss.purge();

fs.writeFile("out/app.purged.css", purgecssResult[0].css, function (err) {
  if (err) {
    return console.log(err);
  }

  console.log("The file was saved!");
}); 

const purgeCSSResults = new PurgeCSS().purge({
  content: ["**/*.html"],
  css: ["**/*.css"],
});

program
  .version(pkg.version)
  .option("-c, --cssinput - CSS <the css>", "The CSS to purge")
  .option(
    "-i, --input - CSS file(s) <input filenames, foldernames or url>",
    "The CSS file(s) to parse"
  )
  .option(
    "-m, --inputhtml - HTML file(s) <input html filenames, foldernames or url>",
    "The HTML file(s) to parse for CSS"
  )
  .option(
    "-o, --output - CSS file <output filename>",
    "The new css filename to output as"
  )
  .option(
    "-f, --customconfig - <config filename> - run with custom config filename",
    "Global Workflow - All options must be defined in a json file"
  )
  .option(
    "-d, --defaultconfig - run with default config file",
    "Local Workflow - All options are defined in a config_css.json"
  )
  .option(
    "-v, --verbose - displays internal messages",
    "Outputs CSS-PURGE activity"
  )
  .parse(process.argv);

var options = {};

if (program.cssinput) {
  if (program.output) {
    options = {
      css_output: program.output,
      verbose: program.verbose ? true : false,
    };

    if (program.customconfig === undefined) {
      options.trim = true;
      options.shorten = true;
    }

    cssPurge.purgeCSS(program.cssinput, options, function (error, result) {
      if (error) console.log(error);
      else console.log(result);
    });
  } else {
    options = {
      verbose: program.verbose ? true : false,
    };

    if (program.customconfig === undefined) {
      options.trim = true;
      options.shorten = true;
    }

    cssPurge.purgeCSS(program.cssinput, options, function (error, result) {
      if (error) console.log(error);
      else console.log(result);
    });
  }
} else if (program.input && program.inputhtml && program.output) {
  options = {
    css: program.input,
    css_output: program.output,
    special_reduce_with_html: true,
    html: program.inputhtml,
    verbose: program.verbose ? true : false,
  };

  if (program.customconfig === undefined) {
    options.trim = true;
    options.shorten = true;
  }

  cssPurge.purgeCSSFiles(
    options,
    program.customconfig !== undefined ? program.customconfig : "cmd_default"
  );
} else if (program.input && program.inputhtml) {
  options = {
    css: program.input,
    css_output:
      program.input.substr(0, program.input.lastIndexOf(".")) + ".min.css",
    special_reduce_with_html: true,
    html: program.inputhtml,
    verbose: program.verbose ? true : false,
  };

  if (program.customconfig === undefined) {
    options.trim = true;
    options.shorten = true;
  }

  cssPurge.purgeCSSFiles(
    options,
    program.customconfig !== undefined ? program.customconfig : "cmd_default"
  );
} else if (program.input && program.output) {
  options = {
    css: program.input,
    css_output: program.output,
    verbose: program.verbose ? true : false,
  };

  if (program.customconfig === undefined) {
    options.trim = true;
    options.shorten = true;
  }

  cssPurge.purgeCSSFiles(
    options,
    program.customconfig !== undefined ? program.customconfig : "cmd_default"
  );
} else if (program.input) {
  options = {
    css: program.input,
    css_output:
      program.input.substr(0, program.input.lastIndexOf(".")) + ".min.css",
    verbose: program.verbose ? true : false,
  };

  if (program.customconfig === undefined) {
    options.trim = true;
    options.shorten = true;
  }

  cssPurge.purgeCSSFiles(
    options,
    program.customconfig !== undefined ? program.customconfig : "cmd_default"
  );
} else if (program.customconfig) {
  cssPurge.purgeCSSFiles(null, "" + program.customconfig);
} else if (program.defaultconfig) {
  cssPurge.purgeCSSFiles();
} else {
  program.help();
}


// program
//   .command("generate")
//   .option(
//     "-t, --tables <tables>",
//     "Comma delimited list of tables to generate schema from",
//     list
//   )
//   .description("Generate Cube.js schema from DB tables schema")
//   .action((options) =>
//     generateSchema(options).catch((e) =>
//       displayError(e.stack || e, { dbType: options.dbType })
//     )
//   )
//   .on("--help", () => {
//     console.log("");
//     console.log("Examples:");
//     console.log("");
//     console.log("  $ cubejs generate -t orders,customers");
//   });
#!/usr/bin/env node

"use strict"

/**
 * Set environment variables.
 */

process.env.NODE_ENV = "test"

/**
 * Dependencies
 */

const path = require("path")
const fs = require("fs")

/**
 * Constants
 */

const base = path.join(__dirname, "..", "..")
const package_json_path = path.join(base, 'package.json')
const index_js_path = path.join(base, 'index.js')
const seed_sql_path = path.join(base, 'test', 'seed.sql')

/**
 * Locals
 */

let main_script, app, db

/**
 * Set the main script to load
 */

if (!fs.existsSync(package_json_path)) {
  main_script = index_js_path
} else {
  let config = JSON.parse(fs.readFileSync(package_json_path))

  if (config.main === undefined || config.main === '') {
    main_script = index_js_path
  } else {
    main_script = path.resolve(config.main)
  }
}

/**
 * Load the main script
 */

if (fs.existsSync(main_script)) {
  app = require(main_script)

  /**
   * Require the db interface
   */

  if (!Object.keys(app.locals).includes('db')) {
    throw Error("Missing 'db' on app.locals {Object}."); return
  }

  /**
   * Read seed data.
   */

  let sql = fs.readFileSync(seed_sql_path, "utf8")

  /**
   * Load seed data.
   */

  app.locals.db.query(sql, [], (err, result) => {
    if (err) { throw Error(err); return }
    console.log("Loaded seed data into database.")
    app.locals.db.end()
  })
}

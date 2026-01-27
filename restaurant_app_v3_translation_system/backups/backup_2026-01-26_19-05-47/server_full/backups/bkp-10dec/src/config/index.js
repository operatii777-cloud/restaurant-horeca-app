/**
 * ENTERPRISE MODULE
 * Phase: E2 - Config Aggregator
 * DO NOT DELETE – Main configuration entry point
 * 
 * Purpose: Main config aggregator - exports all configuration modules
 * Created in PHASE E2
 */

module.exports = {
  env: require('./env'),
  paths: require('./paths'),
  constants: require('./constants'),
  db: require('./db')
};


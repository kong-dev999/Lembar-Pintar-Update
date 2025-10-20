#!/usr/bin/env node

/**
 * Security Checker
 *
 * Checks for common security issues before committing code
 *
 * Usage:
 *   node scripts/check-security.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Patterns to search for
const SENSITIVE_PATTERNS = [
  { pattern: /password\s*=\s*['"][^'"]{3,}['"]/gi, name: 'Hardcoded Password' },
  { pattern: /api[_-]?key\s*=\s*['"][^'"]{10,}['"]/gi, name: 'API Key' },
  { pattern: /secret\s*=\s*['"][^'"]{10,}['"]/gi, name: 'Secret Key' },
  { pattern: /token\s*=\s*['"][^'"]{10,}['"]/gi, name: 'Token' },
  { pattern: /DATABASE_URL\s*=\s*['"]postgresql:\/\/[^'"]+['"]/gi, name: 'Database URL' },
  { pattern: /mongodb(\+srv)?:\/\/[^\s'"]+/gi, name: 'MongoDB Connection String' },
  { pattern: /sk_live_[a-zA-Z0-9]{24,}/g, name: 'Stripe Live Secret Key' },
  { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS Access Key ID' },
  { pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/g, name: 'Private Key' },
];

// Files/directories to skip
const SKIP_PATTERNS = [
  'node_modules',
  '.next',
  '.git',
  'out',
  'build',
  'dist',
  '.env.sample',
  '.env.production.example',
  'check-security.js', // Skip this file itself
];

let issuesFound = 0;
let filesScanned = 0;

function shouldSkip(filePath) {
  return SKIP_PATTERNS.some(pattern => filePath.includes(pattern));
}

function scanFile(filePath) {
  if (shouldSkip(filePath)) return;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    filesScanned++;

    SENSITIVE_PATTERNS.forEach(({ pattern, name }) => {
      const matches = content.match(pattern);
      if (matches) {
        if (issuesFound === 0) {
          console.log(`\n${colors.red}${colors.bold}⚠️  Security Issues Found!${colors.reset}\n`);
        }

        issuesFound++;
        console.log(`${colors.red}[${issuesFound}]${colors.reset} ${colors.bold}${name}${colors.reset}`);
        console.log(`    File: ${colors.cyan}${filePath}${colors.reset}`);
        matches.forEach(match => {
          // Mask sensitive parts
          const masked = match.replace(/['"][^'"]{3,}['"]/, '***REDACTED***');
          console.log(`    Found: ${colors.yellow}${masked}${colors.reset}`);
        });
        console.log('');
      }
    });
  } catch (error) {
    // Skip files that can't be read (binary files, etc)
  }
}

function scanDirectory(dir) {
  try {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);

      if (shouldSkip(fullPath)) return;

      try {
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stat.isFile()) {
          scanFile(fullPath);
        }
      } catch (error) {
        // Skip files we can't access
      }
    });
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
}

function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const stagedFiles = status
      .split('\n')
      .filter(line => line.startsWith('A ') || line.startsWith('M '))
      .map(line => line.substring(3));

    if (stagedFiles.length > 0) {
      console.log(`\n${colors.blue}${colors.bold}Checking staged files...${colors.reset}\n`);

      stagedFiles.forEach(file => {
        if (shouldSkip(file)) return;

        // Check specific sensitive files
        if (file === '.env' || file.endsWith('.env.local') || file.endsWith('.env.production')) {
          issuesFound++;
          console.log(`${colors.red}${colors.bold}⛔ CRITICAL: Environment file staged!${colors.reset}`);
          console.log(`    File: ${colors.cyan}${file}${colors.reset}`);
          console.log(`    ${colors.yellow}Remove with: git reset HEAD ${file}${colors.reset}\n`);
        }
      });
    }
  } catch (error) {
    // Not a git repository or git not installed
  }
}

function checkEnvFiles() {
  const sensitiveEnvFiles = ['.env', '.env.local', '.env.production'];

  sensitiveEnvFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.trim().length > 0) {
          // File exists and has content - that's good, it means it's in use
          // But we need to make sure it's in .gitignore
        }
      } catch (error) {
        // Skip
      }
    }
  });
}

function checkGitignore() {
  if (!fs.existsSync('.gitignore')) {
    issuesFound++;
    console.log(`${colors.red}${colors.bold}⛔ CRITICAL: .gitignore file not found!${colors.reset}\n`);
    return;
  }

  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  const requiredPatterns = [
    '.env',
    'node_modules/',
    '.next/',
    '/public/uploads/',
  ];

  const missing = requiredPatterns.filter(pattern =>
    !gitignoreContent.includes(pattern)
  );

  if (missing.length > 0) {
    issuesFound++;
    console.log(`${colors.yellow}${colors.bold}⚠️  Warning: .gitignore incomplete${colors.reset}`);
    console.log(`    Missing patterns: ${colors.cyan}${missing.join(', ')}${colors.reset}\n`);
  }
}

function main() {
  console.log(`\n${colors.bold}${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║     🔒 Security Check Starting...        ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`);

  // Check .gitignore
  console.log(`${colors.bold}1. Checking .gitignore...${colors.reset}`);
  checkGitignore();

  // Check git status for staged files
  console.log(`${colors.bold}2. Checking git status...${colors.reset}`);
  checkGitStatus();

  // Scan all files
  console.log(`${colors.bold}3. Scanning files for sensitive data...${colors.reset}\n`);
  scanDirectory('.');

  // Summary
  console.log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}Scan Complete${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}\n`);

  console.log(`Files scanned: ${colors.cyan}${filesScanned}${colors.reset}`);

  if (issuesFound === 0) {
    console.log(`\n${colors.green}${colors.bold}✅ No security issues found!${colors.reset}`);
    console.log(`${colors.green}Your code looks safe to commit.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ Found ${issuesFound} security issue(s)!${colors.reset}`);
    console.log(`${colors.yellow}Please fix these issues before committing.${colors.reset}\n`);

    console.log(`${colors.bold}Recommended actions:${colors.reset}`);
    console.log(`1. Remove sensitive data from code`);
    console.log(`2. Move credentials to .env file (already in .gitignore)`);
    console.log(`3. For production, use AWS Amplify Environment Variables`);
    console.log(`4. Run: ${colors.cyan}git status${colors.reset} to check staged files`);
    console.log(`5. Run: ${colors.cyan}git reset HEAD <file>${colors.reset} to unstage\n`);

    process.exit(1);
  }
}

// Run the security check
main();
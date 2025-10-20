# Amplify Gen 2 Backend Configuration

This directory contains the Amplify Gen 2 backend configuration for this application.

## 📁 Structure

```
amplify/
├── auth/
│   └── resource.ts      # Auth configuration (references existing Cognito pool)
├── data/
│   └── resource.ts      # Data configuration (not used - using Prisma)
├── backend.ts           # Main backend definition
├── package.json         # Amplify package config
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## 🎯 Purpose

This Amplify Gen 2 structure is set up to **reference an existing Cognito User Pool** rather than creating a new one.

### Why This Setup?

1. **Existing Cognito Pool**: We manually created a Cognito User Pool in AWS Console
2. **Dual Auth Strategy**: NextAuth for local development, Cognito for production
3. **Amplify Best Practices**: Following Amplify Gen 2 structure recommendations
4. **Type Safety**: TypeScript configuration for better development experience

## 📝 Important Notes

### auth/resource.ts

This file **does NOT create a new Cognito User Pool**. It references the existing pool:

```typescript
export const auth = {
  type: 'existing',
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
} as const;
```

If you want to create a NEW Cognito pool instead, uncomment the `defineAuth()` section in the file.

### data/resource.ts

This file is not used because we use **Prisma** for database operations, not Amplify Data.

If you want to use Amplify Data in the future, uncomment the example schema in the file.

### backend.ts

Minimal configuration since we're:
- Referencing existing Cognito (not creating new)
- Using Prisma for database (not Amplify Data)

## 🚀 Deployment

The actual Cognito configuration is loaded from `amplify_outputs.json`, which is generated at build time from environment variables.

See `scripts/generate-amplify-outputs.js` for the generation logic.

## 🔒 Security

- Credentials are NEVER hardcoded in these files
- All sensitive data comes from environment variables
- `amplify_outputs.json` is gitignored (contains actual credentials)

## 📚 Related Files

- **Root `amplify_outputs.json`**: Generated config file (gitignored)
- **Root `amplify_outputs.example.json`**: Template for reference
- **`scripts/generate-amplify-outputs.js`**: Build-time generator script
- **`src/lib/auth/`**: Auth abstraction layer (JavaScript)

## 🛠️ Maintenance

When updating Cognito configuration:

1. Update environment variables in Amplify Console
2. Redeploy app (will regenerate `amplify_outputs.json`)
3. No need to modify files in this directory

## 📖 Documentation

For full setup instructions, see:
- `COGNITO_SETUP.md` - Complete setup guide
- `DEPLOYMENT_CHECKLIST_COGNITO.md` - Deployment checklist
- `CHANGES_SUMMARY.md` - All file changes

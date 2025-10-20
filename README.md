# LEMBAR PINTAR

Repository Development untuk Platform SaaS **Lembar Pintar** - Platform desain edukasi modern untuk guru, siswa, dan kreator.

Stack: Next.js, Tailwind CSS, Prisma ORM, AWS Cognito, PostgreSQL

---

## Prasyarat

Pastikan sudah terinstall:

1. **Node.js 18+** - https://nodejs.org/
2. **PostgreSQL 14+** - https://www.postgresql.org/download/
3. **Git** - https://git-scm.com/

**PENTING:** Setiap developer wajib menggunakan database PostgreSQL lokal sendiri untuk development.

---

## Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd lembar-pintar
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database Lokal
Buat database PostgreSQL baru di komputer Anda:
```sql
CREATE DATABASE lembar_pintar_dev;
```

### 4. Konfigurasi Environment
```bash
cp .env.sample .env
```

Edit file `.env` dengan kredensial database lokal Anda:
```bash
# Database lokal 
DATABASE_URL="postgresql://username:password@localhost:5432/lembar_pintar_dev"

# App Config
APP_URL="http://localhost:3000"
NODE_ENV="development"

# AWS Cognito (sudah include env sample)
NEXT_PUBLIC_AWS_REGION="ap-southeast-2"
NEXT_PUBLIC_COGNITO_USER_POOL_ID="ap-southeast-2_k2dfYv2Ct"
NEXT_PUBLIC_COGNITO_CLIENT_ID="<ask-lead-dev>"
COGNITO_CLIENT_SECRET="<ask-lead-dev>"

### 5. Setup Database Schema
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed  # Optional: isi sample data
```

### 6. Jalankan Development Server
```bash
npm run dev
```

Aplikasi berjalan di: **http://localhost:3000**

## Command Penting

```bash
npm run dev          # Development server
npm run build        # Build production
npm run lint         # Check code quality

npx prisma studio    # Database admin UI
npx prisma migrate dev    # Update database schema
```

---

## Struktur Project

```
src/
├── pages/           # Next.js pages & API routes
├── components/      # React components
├── sections/        # Landing page sections
├── lib/             # Utilities & config
├── contexts/        # React contexts (Auth, etc)
└── hooks/           # Custom React hooks

prisma/
└── schema.prisma    # Database schema

public/
└── images/          # Static assets
```

## Tim Pengembangan

**Lead Developer:** Tim Kongstudio
**Team:** Safjar S, Arif
**Current Sprint:** Persiapan audit fungsional (7 Oktober 2025)

---

## Selamat Mengerjakan, Developer!

**Tips:**
- `npx prisma studio` - Lihat database visual
- `Progress.md` - Roadmap pengembangan
**Terakhir diperbarui:** 4 Oktober 2025
---


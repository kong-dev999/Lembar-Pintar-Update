-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('MEMBER', 'OWNER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('FREE', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('TEMPLATE', 'ELEMENT', 'PHOTO', 'VIDEO', 'FONT');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('PUBLISHED', 'PENDING', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'UNLISTED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ElementFormat" AS ENUM ('SVG', 'PNG', 'JPEG', 'GIF', 'LOTTIE', 'MP4', 'WEBM');

-- CreateEnum
CREATE TYPE "DesignStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CollaboratorRole" AS ENUM ('VIEWER', 'EDITOR', 'OWNER');

-- CreateEnum
CREATE TYPE "FontStyle" AS ENUM ('normal', 'italic');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('PX', 'MM', 'CM', 'IN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "GlobalRole" NOT NULL DEFAULT 'USER',
    "emailVerified" TIMESTAMP(3),
    "verificationToken" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "workspaceCode" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "inviter" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "teamRole" "TeamRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPayment" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "email" TEXT,
    "subscriptionType" "SubscriptionType" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Design" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "polotnoJson" JSONB NOT NULL,
    "thumbnailUrl" TEXT,
    "workspaceId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "folderId" TEXT,
    "status" "DesignStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignVersion" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "polotnoJson" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignCollaborator" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'PUBLISHED',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "workspaceId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "assetableId" TEXT NOT NULL,
    "assetableType" TEXT NOT NULL,
    "isSystemAsset" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "unit" "Unit" NOT NULL DEFAULT 'PX',
    "pages" JSONB NOT NULL,
    "colorPalette" JSONB,
    "fontPalette" JSONB,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2),

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Element" (
    "id" TEXT NOT NULL,
    "format" "ElementFormat" NOT NULL,
    "colorable" BOOLEAN NOT NULL DEFAULT false,
    "animated" BOOLEAN NOT NULL DEFAULT false,
    "loop" BOOLEAN,
    "sourceFileId" TEXT NOT NULL,
    "previewFileId" TEXT NOT NULL,
    "price" DECIMAL(10,2),

    CONSTRAINT "Element_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "ratio" DOUBLE PRECISION NOT NULL,
    "color" TEXT,
    "originalFileId" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "ratio" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "fps" INTEGER NOT NULL,
    "originalFileId" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Font" (
    "id" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "subsets" TEXT[],
    "weights" TEXT[],
    "styles" "FontStyle"[],
    "previewText" TEXT NOT NULL DEFAULT 'Almost before we knew it, we had left the ground.',
    "price" DECIMAL(10,2),

    CONSTRAINT "Font_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FontFile" (
    "id" TEXT NOT NULL,
    "fontId" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "style" "FontStyle" NOT NULL DEFAULT 'normal',
    "subset" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "FontFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mime" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoPreview" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "size" TEXT NOT NULL,

    CONSTRAINT "PhotoPreview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoPreview" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "VideoPreview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2),
    "allowPrint" BOOLEAN NOT NULL,
    "allowVideo" BOOLEAN NOT NULL,
    "allowResale" BOOLEAN NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,

    CONSTRAINT "TemplateCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TemplateTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElementCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,

    CONSTRAINT "ElementCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElementTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ElementTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,

    CONSTRAINT "PhotoCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PhotoTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,

    CONSTRAINT "VideoCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "VideoTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TemplateToTemplateCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TemplateToTemplateTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ElementToElementCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ElementToElementTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PhotoToPhotoCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PhotoToPhotoTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_VideoToVideoCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_VideoToVideoTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userCode_key" ON "User"("userCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_workspaceCode_key" ON "Workspace"("workspaceCode");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_inviteCode_key" ON "Workspace"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Member_workspaceId_email_key" ON "Member"("workspaceId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPayment_paymentId_key" ON "CustomerPayment"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPayment_customerId_key" ON "CustomerPayment"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "DesignVersion_designId_version_key" ON "DesignVersion"("designId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "DesignCollaborator_designId_userId_key" ON "DesignCollaborator"("designId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_slug_key" ON "Asset"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "File_url_key" ON "File"("url");

-- CreateIndex
CREATE UNIQUE INDEX "License_name_key" ON "License"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateCategory_name_key" ON "TemplateCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateCategory_slug_key" ON "TemplateCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateTag_name_key" ON "TemplateTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ElementCategory_name_key" ON "ElementCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ElementCategory_slug_key" ON "ElementCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ElementTag_name_key" ON "ElementTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoCategory_name_key" ON "PhotoCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoCategory_slug_key" ON "PhotoCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoTag_name_key" ON "PhotoTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VideoCategory_name_key" ON "VideoCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VideoCategory_slug_key" ON "VideoCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VideoTag_name_key" ON "VideoTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_TemplateToTemplateCategory_AB_unique" ON "_TemplateToTemplateCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_TemplateToTemplateCategory_B_index" ON "_TemplateToTemplateCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TemplateToTemplateTag_AB_unique" ON "_TemplateToTemplateTag"("A", "B");

-- CreateIndex
CREATE INDEX "_TemplateToTemplateTag_B_index" ON "_TemplateToTemplateTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ElementToElementCategory_AB_unique" ON "_ElementToElementCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_ElementToElementCategory_B_index" ON "_ElementToElementCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ElementToElementTag_AB_unique" ON "_ElementToElementTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ElementToElementTag_B_index" ON "_ElementToElementTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PhotoToPhotoCategory_AB_unique" ON "_PhotoToPhotoCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_PhotoToPhotoCategory_B_index" ON "_PhotoToPhotoCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PhotoToPhotoTag_AB_unique" ON "_PhotoToPhotoTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PhotoToPhotoTag_B_index" ON "_PhotoToPhotoTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_VideoToVideoCategory_AB_unique" ON "_VideoToVideoCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_VideoToVideoCategory_B_index" ON "_VideoToVideoCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_VideoToVideoTag_AB_unique" ON "_VideoToVideoTag"("A", "B");

-- CreateIndex
CREATE INDEX "_VideoToVideoTag_B_index" ON "_VideoToVideoTag"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_inviter_fkey" FOREIGN KEY ("inviter") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignVersion" ADD CONSTRAINT "DesignVersion_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignCollaborator" ADD CONSTRAINT "DesignCollaborator_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignCollaborator" ADD CONSTRAINT "DesignCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Element" ADD CONSTRAINT "Element_sourceFileId_fkey" FOREIGN KEY ("sourceFileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Element" ADD CONSTRAINT "Element_previewFileId_fkey" FOREIGN KEY ("previewFileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_originalFileId_fkey" FOREIGN KEY ("originalFileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_originalFileId_fkey" FOREIGN KEY ("originalFileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FontFile" ADD CONSTRAINT "FontFile_fontId_fkey" FOREIGN KEY ("fontId") REFERENCES "Font"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FontFile" ADD CONSTRAINT "FontFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoPreview" ADD CONSTRAINT "PhotoPreview_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoPreview" ADD CONSTRAINT "PhotoPreview_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPreview" ADD CONSTRAINT "VideoPreview_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoPreview" ADD CONSTRAINT "VideoPreview_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateToTemplateCategory" ADD CONSTRAINT "_TemplateToTemplateCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateToTemplateCategory" ADD CONSTRAINT "_TemplateToTemplateCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "TemplateCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateToTemplateTag" ADD CONSTRAINT "_TemplateToTemplateTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateToTemplateTag" ADD CONSTRAINT "_TemplateToTemplateTag_B_fkey" FOREIGN KEY ("B") REFERENCES "TemplateTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ElementToElementCategory" ADD CONSTRAINT "_ElementToElementCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Element"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ElementToElementCategory" ADD CONSTRAINT "_ElementToElementCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "ElementCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ElementToElementTag" ADD CONSTRAINT "_ElementToElementTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Element"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ElementToElementTag" ADD CONSTRAINT "_ElementToElementTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ElementTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhotoToPhotoCategory" ADD CONSTRAINT "_PhotoToPhotoCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhotoToPhotoCategory" ADD CONSTRAINT "_PhotoToPhotoCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "PhotoCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhotoToPhotoTag" ADD CONSTRAINT "_PhotoToPhotoTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Photo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhotoToPhotoTag" ADD CONSTRAINT "_PhotoToPhotoTag_B_fkey" FOREIGN KEY ("B") REFERENCES "PhotoTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoToVideoCategory" ADD CONSTRAINT "_VideoToVideoCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoToVideoCategory" ADD CONSTRAINT "_VideoToVideoCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "VideoCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoToVideoTag" ADD CONSTRAINT "_VideoToVideoTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VideoToVideoTag" ADD CONSTRAINT "_VideoToVideoTag_B_fkey" FOREIGN KEY ("B") REFERENCES "VideoTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

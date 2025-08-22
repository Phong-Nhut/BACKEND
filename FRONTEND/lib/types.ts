export interface RegisterRequest {
  email: string
  password?: string
  role: string
  fullName?: string
  portfolioUrl?: string
  experienceYears?: number
}

export interface LoginRequest {
  email: string
  password?: string
}

export interface AuthResponse {
  token: string
  role: string
  email: string
  id?: number
  userId?: number
}

export interface User {
  id: number
  email: string
  role: "GUEST" | "PLAYER" | "DEVELOPER" | "DESIGNER" | "ADMIN"
  status: "PENDING" | "APPROVED" | "REJECTED"
  fullName?: string
  portfolioUrl?: string
  experienceYears?: number
  createdAt?: string
  avatarUrl?: string
}

export interface Game {
  id: number
  name: string
  description: string
  requirements: string
  previewImageUrl: string
  apkFileUrl: string
  supportLeaderboard: boolean
  supportPoints: boolean
  status: "PENDING" | "APPROVED" | "REJECTED"
  developerId: number
  apiKeyMessage?: string
}

export interface ApprovalRequest {
  userId: number
  status: "APPROVED" | "REJECTED"
}

export interface GameApprovalRequest {
  gameId: number
  status: "APPROVED" | "REJECTED"
}

export interface Review {
  id: number
  playerId: number
  playerName: string
  gameId: number
  rating: number
  comment: string
  status: "APPROVED" | "PENDING" | "REJECTED"
  createdAt: string
}

export interface ReviewRequest {
  gameId: number
  rating: number
  comment: string
}

export interface LeaderboardEntry {
  playerId: number
  playerName: string
  totalPoints: number
  rank: number
}

export interface PointTransaction {
  id: number
  playerId: number
  gameId: number
  actionType: "DOWNLOAD_GAME" | "WRITE_REVIEW"
  points: number
  createdAt: string
}

export interface Asset {
  id: number
  name: string
  description: string
  fileUrl: string
  previewUrl?: string
  previewImageUrl?: string
  type: "FREE" | "PAID"
  price?: number
  tags: string
  fileType: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  designerId: number
  designerName: string
  designerAvatarUrl?: string
  createdAt: string
}

export interface PaymentInfo {
  id: number
  userId?: number
  accountNumber: string
  bankName: string
  accountHolderName: string
  qrCodeUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface DepositRequestCreate {
  amount: string
  transactionNote?: string
}

export interface DepositRequest {
  id: number
  userId: number
  userEmail: string
  userName: string
  amount: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  transactionNote?: string
  adminNote?: string
  approvedById?: number
  approvedByEmail?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface DepositApprovalRequest {
  status: "APPROVED" | "REJECTED"
  adminNote?: string
}

export interface TransactionApprovalRequest {
  reason?: string
}

export interface GiftDTO {
  id: number
  name: string
  description?: string
  imageUrl?: string
  pointCost: number
  quantity: number
  developerId: number
  developerName: string
  createdAt: string
}

export interface GiftTransactionDTO {
  id: number
  playerId: number
  giftId: number
  pointsSpent: number // Changed from pointCost to pointsSpent to match backend
  createdAt: string // Changed from redeemedAt to createdAt to match backend
}

export interface TransactionResponse {
  id: number
  type: "ASSET_PURCHASE" // Backend uses TransactionType enum
  amount: number
  platformFee: number
  designerAmount: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  buyerEmail: string
  sellerEmail: string
  assetName: string
  approvedByEmail?: string
  approvedAt?: string
  rejectionReason?: string
  createdAt: string
}

export interface PurchasedAssetResponse {
  assetId: number
  assetName: string
  description: string
  fileUrl: string
  type: "FREE" | "PAID"
  price: number
  tags: string
  fileType: string
  designerEmail: string
  purchasedAt: string
  transactionId: number
}

export interface PurchaseAssetRequest {
  assetId: number
}

export interface LeaderboardResponse {
  playerId: number
  playerEmail: string
  totalPoints: number
  rank: number
}

export interface PlayerDeveloperPoints {
  developerId: number
  totalPoints: number
}

export interface PointTransactionResponse {
  id: number
  playerId: number
  gameId?: number
  actionType: "DOWNLOAD_GAME" | "WRITE_REVIEW"
  points: number
  createdAt: string
}

export interface WithdrawRequestCreate {
  amount: number
  userNote?: string
}

export interface WithdrawRequest {
  id: number
  userId: number
  userEmail: string
  userName: string
  amount: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  userNote?: string
  adminNote?: string
  bankName: string
  accountNumber: string
  accountHolderName: string
  approvedById?: number
  approvedByEmail?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface WithdrawApprovalRequest {
  status: "APPROVED" | "REJECTED"
  adminNote?: string
}

export interface PaymentInfoRequest {
  accountNumber: string
  bankName: string
  accountHolderName: string
  qrCodeUrl?: string
}

export interface GiftUploadRequest {
  name: string
  description?: string
  pointCost: number
  quantity: number
  imageFile?: File
}

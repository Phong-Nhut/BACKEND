import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Game,
  GameApprovalRequest,
  ApprovalRequest,
  Review,
  ReviewRequest,
  Asset,
  PaymentInfo,
  DepositRequestCreate,
  DepositRequest,
  DepositApprovalRequest,
  TransactionResponse,
  PurchasedAssetResponse,
  LeaderboardEntry,
  WithdrawRequestCreate,
  WithdrawRequest,
  WithdrawApprovalRequest,
  GiftDTO,
  GiftTransactionDTO,
} from "./types"

const API_BASE_URL = "http://localhost:8080/api/v1"

async function getAuthToken(): Promise<string | null> {
  try {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user: AuthResponse = JSON.parse(userStr)
      return user.token
    }
  } catch (e) {
    console.error("Could not parse user from localStorage", e)
  }
  return null
}

async function getCurrentUser(): Promise<User | null> {
  try {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const authResponse: AuthResponse = JSON.parse(userStr)
      // You might need to fetch full user details from backend
      return {
        id: authResponse.id || authResponse.userId || 0,
        email: authResponse.email,
        role: authResponse.role as any,
        status: "APPROVED", // Assuming logged in users are approved
      }
    }
  } catch (e) {
    console.error("Could not parse user from localStorage", e)
  }
  return null
}

async function fetchWrapper(url: string, options: RequestInit = {}) {
  const token = await getAuthToken()
  const headers = {
    ...options.headers,
  }

  if (token) {
    ;(headers as any)["Authorization"] = `Bearer ${token}`
  }

  if (!(options.body instanceof FormData)) {
    ;(headers as any)["Content-Type"] = "application/json"
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "An unknown error occurred" }))
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
  }

  if (response.headers.get("content-type")?.includes("application/json")) {
    return response.json()
  }
  return response.text()
}

// Auth
export const registerUser = (data: RegisterRequest): Promise<AuthResponse> => {
  return fetchWrapper(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const loginUser = (data: LoginRequest): Promise<AuthResponse> => {
  return fetchWrapper(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Admin
export const getPendingUsers = (): Promise<User[]> => {
  return fetchWrapper(`${API_BASE_URL}/admin/pending`)
}

export const approveUser = (userId: number, status: "APPROVED" | "REJECTED"): Promise<string> => {
  const payload: ApprovalRequest = { userId, status }
  return fetchWrapper(`${API_BASE_URL}/admin/approve`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export const getPendingGames = (): Promise<Game[]> => {
  return fetchWrapper(`${API_BASE_URL}/admin/games/pending`)
}

export const approveGame = (gameId: number, status: "APPROVED" | "REJECTED"): Promise<string> => {
  const payload: GameApprovalRequest = { gameId, status }
  return fetchWrapper(`${API_BASE_URL}/admin/game-approve`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export const getAdminAllUsers = (): Promise<User[]> => {
  return fetchWrapper(`${API_BASE_URL}/admin/users/all`)
}

export const getAdminAllGames = (): Promise<Game[]> => {
  return fetchWrapper(`${API_BASE_URL}/admin/games/all`)
}

//CẬP NHẬT DELETE USER
export const deleteUser = (userId: number): Promise<string> => {
  return fetchWrapper(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
  })
}

// Games
export const getPublicGames = (): Promise<Game[]> => {
  return fetchWrapper(`${API_BASE_URL}/games/public`)
}

export const getGameById = (id: number): Promise<Game> => {
  return fetchWrapper(`${API_BASE_URL}/games/${id}`)
}

export const createGame = (data: FormData): Promise<Game> => {
  return fetchWrapper(`${API_BASE_URL}/games/create`, {
    method: "POST",
    body: data,
  })
}

// Update game details
export const updateGame = (gameId: number, data: FormData): Promise<Game> => {
  return fetchWrapper(`${API_BASE_URL}/games/${gameId}`, {
    method: "PUT",
    body: data,
  })
}

// Delete game
export const deleteGame = (gameId: number): Promise<string> => {
  return fetchWrapper(`${API_BASE_URL}/games/${gameId}`, {
    method: "DELETE",
  })
}

export const getMyGames = (): Promise<Game[]> => {
  return fetchWrapper(`${API_BASE_URL}/games/my-games`)
}

export const getGamesByDeveloper = (developerId: number): Promise<Game[]> => {
  return fetchWrapper(`${API_BASE_URL}/games/developer/${developerId}`)
}

// Reviews
export const getGameReviews = (gameId: number): Promise<Review[]> => {
  return fetchWrapper(`${API_BASE_URL}/reviews/${gameId}`)
}

export const submitReview = (reviewData: ReviewRequest): Promise<Review> => {
  return fetchWrapper(`${API_BASE_URL}/reviews`, {
    method: "POST",
    body: JSON.stringify(reviewData),
  })
}

// Points & Download Tracking
export const trackDownloadAndGetUrl = async (playerId: number, gameId: number): Promise<string> => {
  const token = await getAuthToken()
  if (!token) {
    throw new Error("Authentication required")
  }

  try {
    const response = await fetch(`${API_BASE_URL}/points/track-download?playerId=${playerId}&gameId=${gameId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      redirect: "manual", // Don't follow redirects automatically
    })

    // Handle redirect response (3xx status codes)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("Location")
      if (location) {
        console.log("Redirect URL received:", location)
        return location
      }
    }

    // Handle error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Download tracking failed" }))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    // Handle successful response (shouldn't happen with redirect, but just in case)
    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      const data = await response.json()
      if (data.url) return data.url
    } else {
      const text = await response.text()
      if (text.startsWith("http")) return text
    }

    throw new Error("Could not get download URL from response")
  } catch (error) {
    console.error("Download tracking error:", error)
    throw error
  }
}

// Get direct APK URL without point tracking (for repeat downloads or non-players)
export const getDirectApkUrl = async (gameId: number): Promise<string> => {
  const game = await getGameById(gameId)
  if (!game.apkFileUrl) {
    throw new Error("APK file URL not available")
  }
  return game.apkFileUrl
}

// Leaderboard
export const getLeaderboard = (): Promise<LeaderboardEntry[]> => {
  // This is a deprecated function - components should use getLeaderboardByDeveloper instead
  // For now, return empty array to prevent import errors
  console.warn("getLeaderboard is deprecated. Use getLeaderboardByDeveloper instead.")
  return Promise.resolve([])
}

// Assets
export const uploadAsset = (data: FormData): Promise<Asset> => {
  return fetchWrapper(`${API_BASE_URL}/assets/upload`, {
    method: "POST",
    body: data,
  })
}

export const getMyAssets = (): Promise<Asset[]> => {
  return fetchWrapper(`${API_BASE_URL}/assets/my-assets`)
}

export const getPublicAssets = (): Promise<Asset[]> => {
  return fetchWrapper(`${API_BASE_URL}/assets/public`)
}

export const getFreeAssets = (): Promise<Asset[]> => {
  return fetchWrapper(`${API_BASE_URL}/assets/free`)
}

export const getPaidAssets = (): Promise<Asset[]> => {
  return fetchWrapper(`${API_BASE_URL}/assets/paid`)
}

export const searchAssetsByTag = (tag: string): Promise<Asset[]> => {
  return fetchWrapper(`${API_BASE_URL}/assets/search?tag=${encodeURIComponent(tag)}`)
}

// Admin asset management
export const getPendingAssets = (): Promise<Asset[]> => {
  return fetchWrapper(`${API_BASE_URL}/assets/pending`)
}

export const approveAsset = (assetId: number): Promise<Asset> => {
  return fetchWrapper(`${API_BASE_URL}/assets/${assetId}/approve`, {
    method: "PUT",
  })
}

export const rejectAsset = (assetId: number, reason?: string): Promise<Asset> => {
  const url = reason
    ? `${API_BASE_URL}/assets/${assetId}/reject?reason=${encodeURIComponent(reason)}`
    : `${API_BASE_URL}/assets/${assetId}/reject`
  return fetchWrapper(url, {
    method: "PUT",
  })
}

// Asset purchase transaction APIs
export const purchaseAsset = (assetId: number): Promise<{ message: string; transactionId: number }> => {
  return fetchWrapper(`${API_BASE_URL}/transactions/purchase`, {
    method: "POST",
    body: JSON.stringify({ assetId }),
  })
}

export const getMyAssetPurchases = (
  page = 0,
  size = 10,
): Promise<{ content: TransactionResponse[]; totalElements: number; totalPages: number }> => {
  return fetchWrapper(`${API_BASE_URL}/transactions/my-purchases?page=${page}&size=${size}`)
}

export const getPurchasedAssets = (
  page = 0,
  size = 10,
): Promise<{ content: PurchasedAssetResponse[]; totalElements: number; totalPages: number }> => {
  return fetchWrapper(`${API_BASE_URL}/transactions/purchased-assets?page=${page}&size=${size}`)
}

// Payment Info Management (Admin)
export const createOrUpdatePaymentInfo = (data: FormData): Promise<PaymentInfo> => {
  return fetchWrapper(`${API_BASE_URL}/payment-info`, {
    method: "POST",
    body: data,
  })
}

export const getActivePaymentInfo = (): Promise<PaymentInfo> => {
  return fetchWrapper(`${API_BASE_URL}/payment-info`)
}

export const getMyPaymentInfo = (): Promise<PaymentInfo> => {
  return fetchWrapper(`${API_BASE_URL}/payment-info/my-info`)
}

// Deposit Request Management
export const createDepositRequest = (data: DepositRequestCreate): Promise<DepositRequest> => {
  return fetchWrapper(`${API_BASE_URL}/deposits`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const getMyDepositRequests = (
  page = 0,
  size = 10,
): Promise<{ content: DepositRequest[]; totalElements: number; totalPages: number }> => {
  return fetchWrapper(`${API_BASE_URL}/deposits/my-requests?page=${page}&size=${size}`)
}

export const getPendingDepositRequests = (
  page = 0,
  size = 10,
): Promise<{ content: DepositRequest[]; totalElements: number; totalPages: number }> => {
  return fetchWrapper(`${API_BASE_URL}/deposits/pending?page=${page}&size=${size}`)
}

export const approveDepositRequest = (requestId: number, data: DepositApprovalRequest): Promise<DepositRequest> => {
  return fetchWrapper(`${API_BASE_URL}/deposits/${requestId}/approve`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export const getDepositRequestById = (requestId: number): Promise<DepositRequest> => {
  return fetchWrapper(`${API_BASE_URL}/deposits/${requestId}`)
}

export const getUserBalance = (): Promise<{ balance: number }> => {
  return fetchWrapper(`${API_BASE_URL}/users/balance`)
}

// Helper function to get current user
export { getCurrentUser }

// API to get all developers for player dashboard
export const getAllDevelopers = (): Promise<User[]> => {
  return fetchWrapper(`${API_BASE_URL}/users/developers`)
}

// Points system API endpoints based on backend analysis
export const getPlayerPointsByDeveloper = (
  playerId: number,
): Promise<{ developerId: number; totalPoints: number }[]> => {
  return fetchWrapper(`${API_BASE_URL}/points/player/${playerId}/by-developer`)
}

export const getPlayerPointsForDeveloper = (playerId: number, developerId: number): Promise<number> => {
  return fetchWrapper(`${API_BASE_URL}/points/player/${playerId}/developer/${developerId}`)
}

export const getPlayerTransactions = (playerId: number): Promise<any[]> => {
  return fetchWrapper(`${API_BASE_URL}/points/transactions/${playerId}`)
}

export const getDeveloperLeaderboard = (developerId: number): Promise<{ playerId: number; totalPoints: number }[]> => {
  return fetchWrapper(`${API_BASE_URL}/points/developer/${developerId}/leaderboard`)
}

export const getLeaderboardByDeveloper = (developerId: number): Promise<any[]> => {
  return fetchWrapper(`${API_BASE_URL}/leaderboard/developer/${developerId}`)
}

// Admin transaction management APIs
export const getPendingTransactions = (
  page = 0,
  size = 10,
): Promise<{ content: TransactionResponse[]; totalElements: number; totalPages: number }> => {
  return fetchWrapper(`${API_BASE_URL}/transactions/pending?page=${page}&size=${size}`)
}

export const getAllTransactions = (
  page = 0,
  size = 10,
): Promise<{ content: TransactionResponse[]; totalElements: number; totalPages: number }> => {
  return fetchWrapper(`${API_BASE_URL}/transactions/all?page=${page}&size=${size}`)
}

export const approveTransaction = (transactionId: number): Promise<TransactionResponse> => {
  return fetchWrapper(`${API_BASE_URL}/transactions/${transactionId}/approve`, {
    method: "PUT",
  })
}

export const rejectTransaction = (transactionId: number, reason?: string): Promise<TransactionResponse> => {
  return fetchWrapper(`${API_BASE_URL}/transactions/${transactionId}/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason: reason || "Transaction rejected by admin" }),
  })
}

// User Profile Management
export const uploadAvatar = (file: File): Promise<{ avatarUrl: string }> => {
  const formData = new FormData()
  formData.append("avatar", file)

  return fetchWrapper(`${API_BASE_URL}/avatar/upload`, {
    method: "POST",
    body: formData,
  })
}

export const updateUserProfile = (profileData: { avatarUrl?: string }): Promise<User> => {
  return fetchWrapper(`${API_BASE_URL}/users/profile`, {
    method: "PUT",
    body: JSON.stringify(profileData),
  })
}

export const getUserProfile = (): Promise<User> => {
  return fetchWrapper(`${API_BASE_URL}/users/profile`)
}

// Asset Management
export const updateAsset = (assetId: number, data: FormData): Promise<Asset> => {
  return fetchWrapper(`${API_BASE_URL}/assets/${assetId}`, {
    method: "PUT",
    body: data,
  })
}

export const deleteAsset = (assetId: number): Promise<string> => {
  return fetchWrapper(`${API_BASE_URL}/assets/${assetId}`, {
    method: "DELETE",
  })
}

// Withdraw Request Management
export const createWithdrawRequest = (data: WithdrawRequestCreate): Promise<WithdrawRequest> => {
  return fetchWrapper(`${API_BASE_URL}/withdraws`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const getMyWithdrawRequests = (
  page = 0,
  size = 10,
): Promise<{ content: WithdrawRequest[]; totalElements: number; totalPages: number }> => {
  return fetchWrapper(`${API_BASE_URL}/withdraws/my-requests?page=${page}&size=${size}`)
}

export const getPendingWithdrawRequests = (
  page = 0,
  size = 10,
): Promise<{ content: WithdrawRequest[]; totalElements: number; totalPages: number }> => {
  return fetchWrapper(`${API_BASE_URL}/withdraws/pending?page=${page}&size=${size}`)
}

export const approveWithdrawRequest = (requestId: number, data: WithdrawApprovalRequest): Promise<WithdrawRequest> => {
  return fetchWrapper(`${API_BASE_URL}/withdraws/${requestId}/approve`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export const getWithdrawRequestById = (requestId: number): Promise<WithdrawRequest> => {
  return fetchWrapper(`${API_BASE_URL}/withdraws/${requestId}`)
}

// Gift Management APIs
export const uploadGift = (data: FormData): Promise<GiftDTO> => {
  return fetchWrapper(`${API_BASE_URL}/gifts/upload`, {
    method: "POST",
    body: data,
  })
}

export const getAllGifts = (): Promise<GiftDTO[]> => {
  return fetchWrapper(`${API_BASE_URL}/gifts`)
}

export const getMyGifts = (): Promise<GiftDTO[]> => {
  return fetchWrapper(`${API_BASE_URL}/gifts/my-gifts`)
}

export const redeemGift = (playerId: number, giftId: number): Promise<GiftTransactionDTO> => {
  return fetchWrapper(`${API_BASE_URL}/gifts/redeem?playerId=${playerId}&giftId=${giftId}`, {
    method: "POST",
  })
}

export const getGiftTransactions = (playerId: number): Promise<GiftTransactionDTO[]> => {
  return fetchWrapper(`${API_BASE_URL}/gifts/transactions?playerId=${playerId}`)
}

export const getMyGiftTransactions = (playerId: number): Promise<GiftTransactionDTO[]> => {
  return fetchWrapper(`${API_BASE_URL}/gifts/transactions?playerId=${playerId}`)
}

export const updateGift = (giftId: number, data: FormData): Promise<GiftDTO> => {
  return fetchWrapper(`${API_BASE_URL}/gifts/${giftId}`, {
    method: "PUT",
    body: data,
  })
}

export const deleteGift = (giftId: number): Promise<string> => {
  return fetchWrapper(`${API_BASE_URL}/gifts/${giftId}`, {
    method: "DELETE",
  })
}

export const getGiftsByDeveloper = (developerId: number): Promise<GiftDTO[]> => {
  return fetchWrapper(`${API_BASE_URL}/gifts/developer/${developerId}`)
}

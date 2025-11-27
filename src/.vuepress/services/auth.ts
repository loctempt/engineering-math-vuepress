import { login as walineLogin } from '@waline/client'
import type { UserInfo } from '../stores/user.ts'

// Server configuration
const SERVER_CONFIG = {
  serverURL: 'https://waline.fantastic-mathematics.work/',
  lang: 'zh-CN'
}

// Error types
export interface AuthError {
  code: string
  message: string
}

// Login credentials
export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

// Authentication service
export const authService = {
  /**
   * Login with email and password
   */
  async login(): Promise<{ user: UserInfo; token: string }> {
    try {
      const result = await walineLogin({
        serverURL: SERVER_CONFIG.serverURL,
        lang: SERVER_CONFIG.lang
      })

      // The login function from @waline/client handles the actual authentication
      // It will return user info if successful
      if (result && result.token) {
        return {
          user: {
            display_name: result.display_name,
            email: result.email,
            url: result.url,
            token: result.token,
            avatar: result.avatar,
            mailMd5: result.mailMd5,
            objectId: result.objectId,
            type: result.type
          },
          token: result.token
        }
      } else {
        throw new Error('Login failed: No token received')
      }
    } catch (error) {
      console.error('Login error:', error)

      // Handle different error types
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`)
      } else {
        throw new Error('Login failed: Unknown error occurred')
      }
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Waline doesn't have a specific logout API, so we just clear local state
      // The server will handle session invalidation
      console.log('User logged out')
    } catch (error) {
      console.error('Logout error:', error)
      throw new Error('Logout failed')
    }
  },

  /**
   * Validate current token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // We can validate the token by trying to get user info
      // For now, we'll assume the token is valid if it exists
      // In a real implementation, you might call an API endpoint
      return !!token
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  },

  /**
   * Refresh user token
   */
  async refreshToken(): Promise<string> {
    try {
      // Waline doesn't have a token refresh API
      // Users need to log in again if token expires
      throw new Error('Token refresh not supported. Please log in again.')
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(token: string | null): boolean {
    return !!token && this.validateToken(token).catch(() => false)
  },

  /**
   * Get server configuration
   */
  getServerConfig() {
    return { ...SERVER_CONFIG }
  }
}

// Export for use in components
export default authService
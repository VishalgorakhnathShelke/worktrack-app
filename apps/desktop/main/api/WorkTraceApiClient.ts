import type {
  Account,
  ConnectionStatus,
  LoginCredentials,
  SignUpCredentials
} from '../../shared/connection'
import { ConnectionSettingsStore } from './ConnectionSettingsStore'

interface ApiAccount {
  user_id: string
  tenant_id: string
  company_name: string
  email: string
  role: Account['role']
}

interface ApiAuthSession {
  access_token: string
  account: ApiAccount
}

export class WorkTraceApiClient {
  constructor(private readonly settings: ConnectionSettingsStore) {}

  async signup(credentials: SignUpCredentials): Promise<ConnectionStatus> {
    this.settings.assertSecureStorage()
    const apiUrl = this.settings.normalizeApiUrl(credentials.apiUrl)
    const session = await this.publicRequest<ApiAuthSession>(apiUrl, '/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: credentials.companyName,
        email: credentials.email,
        password: credentials.password
      })
    })
    return this.settings.saveSession(
      apiUrl,
      session.access_token,
      mapAccount(session.account)
    )
  }

  async login(credentials: LoginCredentials): Promise<ConnectionStatus> {
    this.settings.assertSecureStorage()
    const apiUrl = this.settings.normalizeApiUrl(credentials.apiUrl)
    const session = await this.publicRequest<ApiAuthSession>(apiUrl, '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    })
    return this.settings.saveSession(
      apiUrl,
      session.access_token,
      mapAccount(session.account)
    )
  }

  async logout(): Promise<ConnectionStatus> {
    try {
      await this.request('/auth/logout', { method: 'POST' })
    } finally {
      return this.settings.clearSession()
    }
  }

  async testConnection(): Promise<ConnectionStatus> {
    if (!this.settings.getStatus().hasSession) {
      return this.settings.getStatus()
    }
    this.settings.setChecking()
    try {
      const response = await this.request('/auth/me')
      const account = mapAccount((await response.json()) as ApiAccount)
      return await this.settings.setConnected(account)
    } catch (error) {
      return this.settings.setError(error)
    }
  }

  async request(path: string, init: RequestInit = {}): Promise<Response> {
    const connection = await this.settings.resolve()
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${connection.apiToken}`)
    if (connection.tenantId) {
      headers.set('X-Tenant-ID', connection.tenantId)
    }
    const response = await fetch(`${connection.apiUrl}${path}`, {
      ...init,
      headers,
      signal: AbortSignal.timeout(15_000)
    })
    await requireSuccess(response)
    return response
  }

  private async publicRequest<T>(
    apiUrl: string,
    path: string,
    init: RequestInit
  ): Promise<T> {
    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      signal: AbortSignal.timeout(15_000)
    })
    await requireSuccess(response)
    return (await response.json()) as T
  }
}

async function requireSuccess(response: Response): Promise<void> {
  if (response.ok) {
    return
  }
  let detail = `WorkTrace API returned ${response.status}.`
  try {
    const payload = (await response.json()) as { detail?: string | Array<{ msg?: string }> }
    if (typeof payload.detail === 'string') {
      detail = payload.detail
    } else if (Array.isArray(payload.detail)) {
      detail = payload.detail.map((item) => item.msg).filter(Boolean).join(', ') || detail
    }
  } catch {
    // Keep the status-based message for non-JSON responses.
  }
  throw new Error(detail)
}

function mapAccount(account: ApiAccount): Account {
  return {
    userId: account.user_id,
    tenantId: account.tenant_id,
    companyName: account.company_name,
    email: account.email,
    role: account.role
  }
}

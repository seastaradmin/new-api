/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { SystemStatus } from '@/features/auth/types'
import { api } from '@/lib/api'
import { STATUS_QUERY_KEY } from '@/lib/status-query'
import { useSystemConfigStore } from '@/stores/system-config-store'

import { SignIn } from '..'

const statusFixture: SystemStatus = {
  success: true,
  register_enabled: true,
  password_login_enabled: true,
  user_agreement_enabled: true,
  privacy_policy_enabled: true,
  self_use_mode_enabled: false,
  passkey_login: false,
  wechat_login: false,
  github_oauth: false,
  discord_oauth: false,
  oidc_enabled: false,
  linuxdo_oauth: false,
  telegram_oauth: false,
  turnstile_check: false,
}

const queryClients: QueryClient[] = []

function renderSignIn(status: Partial<SystemStatus> = {}) {
  const rootRoute = createRootRoute({ component: Outlet })
  const authRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: '/(auth)',
  })
  const signInRoute = createRoute({
    getParentRoute: () => authRoute,
    path: '/sign-in',
    component: SignIn,
  })
  const signUpRoute = createRoute({
    getParentRoute: () => authRoute,
    path: '/sign-up',
    component: () => <div>Sign-up destination</div>,
  })
  const forgotPasswordRoute = createRoute({
    getParentRoute: () => authRoute,
    path: '/forgot-password',
    component: () => <div>Forgot-password destination</div>,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      authRoute.addChildren([signInRoute, signUpRoute, forgotPasswordRoute]),
    ]),
    history: createMemoryHistory({ initialEntries: ['/sign-in'] }),
  })

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  queryClients.push(queryClient)
  queryClient.setQueryData(STATUS_QUERY_KEY, { ...statusFixture, ...status })

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  window.localStorage.clear()
  useSystemConfigStore.setState(useSystemConfigStore.getInitialState(), true)
  useSystemConfigStore.setState((state) => ({
    ...state,
    loading: false,
    config: { ...state.config, systemName: 'Paper Station' },
  }))
})

afterEach(() => {
  queryClients.splice(0).forEach((client) => client.clear())
  window.localStorage.clear()
  useSystemConfigStore.setState(useSystemConfigStore.getInitialState(), true)
})

describe('sign-in layout', () => {
  it('places the brand in the page header and centers the compact, unframed sign-in column', async () => {
    renderSignIn()

    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Sign in',
    })
    expect(heading).toHaveClass('text-2xl')
    expect(heading).not.toHaveClass('font-serif')
    expect(screen.getByRole('banner')).toHaveTextContent('Paper Station')
    expect(screen.getByRole('main')).toHaveClass(
      'mx-auto',
      'flex',
      'w-full',
      'max-w-[26rem]',
      'flex-1',
      'flex-col',
      'justify-center'
    )

    const panel = screen.getByRole('region', { name: 'Authentication' })
    expect(panel).not.toHaveClass('border-2')
    expect(panel).not.toHaveTextContent('Authentication')
  })

  it('keeps legal consent and the sign-up switch available', async () => {
    renderSignIn()

    expect(
      await screen.findByRole('checkbox', { name: /I have read and agree/ })
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toBeVisible()
  })

  it('exposes the primary action by accessible name', async () => {
    renderSignIn()

    const submit = await screen.findByRole('button', { name: 'Sign in' })
    expect(submit).toBeVisible()
    expect(submit).toHaveClass('w-full')
  })

  it('renders the copyright footer with the configured system name', async () => {
    renderSignIn()

    const footer = await screen.findByRole('contentinfo')
    expect(footer).toHaveTextContent(/©\s*\d{4}/)
    expect(footer).toHaveTextContent('Paper Station')
  })

  it('shows configured alternative login methods before credentials and keeps consent gating', async () => {
    renderSignIn({ passkey_login: true, github_oauth: true })
    const user = userEvent.setup()

    const passkey = await screen.findByRole('button', {
      name: 'Sign in with Passkey',
    })
    const github = screen.getByRole('button', { name: /Continue with GitHub/ })
    const username = screen.getByRole('textbox', { name: 'Username or Email' })
    expect(
      passkey.compareDocumentPosition(github) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      github.compareDocumentPosition(username) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(passkey).toBeDisabled()
    expect(github).toBeDisabled()

    await user.click(
      screen.getByRole('checkbox', { name: /I have read and agree/ })
    )
    expect(github).toBeEnabled()
  })

  it('keeps disabled login methods out of the form', async () => {
    renderSignIn({ password_login_enabled: false, github_oauth: true })

    expect(
      await screen.findByRole('button', { name: /Continue with GitHub/ })
    ).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Sign in with Passkey' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('textbox', { name: 'Username or Email' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Sign in' })
    ).not.toBeInTheDocument()
  })

  it('supports password-manager autofill, pasting, and toggling password visibility', async () => {
    renderSignIn()
    const user = userEvent.setup()

    const username = await screen.findByRole('textbox', {
      name: 'Username or Email',
    })
    const password = screen.getByLabelText('Password', { exact: true })
    expect(username).toHaveAttribute('autocomplete', 'username')
    expect(password).toHaveAttribute('autocomplete', 'current-password')
    await user.click(password)
    await user.paste('password-manager-fixture')
    expect(password).toHaveAttribute('type', 'password')
    await user.click(
      screen.getByRole('button', { name: 'Toggle password visibility' })
    )
    expect(password).toHaveAttribute('type', 'text')
    expect(password).toHaveValue('password-manager-fixture')
  })

  it('blocks credential submission until legal consent and then uses the existing login API', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({
      data: { success: false, message: 'Login failed' },
    })
    const error = vi.spyOn(toast, 'error')
    renderSignIn()
    const user = userEvent.setup()

    await user.type(
      await screen.findByRole('textbox', { name: 'Username or Email' }),
      'layout-user'
    )
    await user.type(
      screen.getByLabelText('Password', { exact: true }),
      'login-fixture'
    )
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() =>
      expect(error).toHaveBeenCalledWith(
        'Please agree to the legal terms first'
      )
    )
    expect(post).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole('checkbox', { name: /I have read and agree/ })
    )
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() =>
      expect(post).toHaveBeenCalledExactlyOnceWith(
        '/api/user/login?turnstile=',
        { username: 'layout-user', password: 'login-fixture' },
        expect.anything()
      )
    )
  })
})

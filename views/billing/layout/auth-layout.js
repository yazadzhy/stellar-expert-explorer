import React from 'react'
import {isSignedIn} from '../../../business-logic/billing/billing-session'
import {isImpersonating} from '../../../business-logic/billing/impersonation'
import {useSession} from '../auth/auth-session'
import LoginFormView from '../auth/login-form-view'
import AccountRestoreView from '../auth/account-restore-view'
import SetPasswordView from '../auth/set-password-view'
import SegmentLoader from '../utils/segment-loader-view'

/**
 * Log in to the dashboard
 * @param {'user'|'admin'} role - the access dashboard requires
 * @param {*} children
 * @return {JSX.Element}
 */
export default function AuthLayout({role, children}) {
    const userSession = useSession()
    //an impersonation token carries no roles at all
    const isAllowed = (role === 'user' && isImpersonating()) || hasRole(role, userSession)

    if (!isSignedIn())
        return <LoginFormView/>
    if (!userSession.synced)
        return <SegmentLoader/>
    if (userSession.mustSetPassword)
        return <SetPasswordView/>
    if (userSession.inactive)
        return <AccountRestoreView/>
    if (!isAllowed)
        return <LoginFormView/>
    //show content
    return children
}

/**
 * Whether a session may see a dashboard of this kind
 * @param {'user'|'admin'} role
 * @param {{roles: String[]}} session
 * @return {Boolean}
 * @private
 */
function hasRole(role, {roles}) {
    return (roles?.length ? roles : ['user']).includes(role)
}
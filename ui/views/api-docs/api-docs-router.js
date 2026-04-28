import React from 'react'
import {Route, Switch} from 'react-router'
import {Auth0Provider} from '@auth0/auth0-react'
import config from '../../app.config.json'
import NotFoundView from '../pages/not-found-page-view'
import ApiDocumentationIntroPage from './pages/api-documentation-intro-page'
import ApiDocumentationPathPage from './pages/api-documentation-path-page'
import ApiDocumentationTagPage from './pages/api-documentation-tag-page'

export default function ApiDocsRouter({match}) {
    const {path} = match
    const params = {
        domain: config.auth0.domain,
        clientId: config.auth0.clientId,
        useRefreshTokens: true,
        cacheLocation: "localstorage",
        authorizationParams: {
            redirect_uri: window.location.origin + '/api-docs',
            audience: config.auth0.audience,
            scope: "openid profile email"
        }
    }
    return <Auth0Provider {...params}>
        <Switch>
            <Route path={`${path}/:tag/:method/:id`} component={ApiDocumentationPathPage}/>
            <Route path={`${path}/:tag`} component={ApiDocumentationTagPage}/>
            <Route path={`${path}/`} component={ApiDocumentationIntroPage}/>
            <Route component={NotFoundView}/>
        </Switch>
    </Auth0Provider>
}
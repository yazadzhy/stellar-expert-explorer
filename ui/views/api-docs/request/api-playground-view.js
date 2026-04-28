import React, {useCallback, useEffect, useState} from 'react'
import {useAuth0} from '@auth0/auth0-react'
import {Button, ButtonGroup, CodeBlock, CopyToClipboard} from '@stellar-expert/ui-framework'
import config from '../../../app.config.json'
import ApiPlaygroundParametersView from './api-playground-parameters-view'
import buildRequestString from './api-request-builder'

export default function ApiPlaygroundView({path, data = {}}) {
    const {parameters: params} = data
    const {isAuthenticated, loginWithPopup, logout: auth0Logout, getAccessTokenSilently} = useAuth0()
    const [inProgress, setInProgress] = useState(false)
    const [requestParams, setRequestParams] = useState()
    const [response, setResponse] = useState('')
    const requestString = buildRequestString(path, params, requestParams)
    const isValid = validateParams(params, requestParams)

    useEffect(() => {
        if (!params)
            return null
        const requestParamsDefault = params?.reduce((prev, current) => {
            const defaultValue = current.schema.default || (current.schema.enum ? current.schema.enum[0] : null)
            if (defaultValue) {
                prev[current.name] = defaultValue
            }
            return prev
        }, {})
        setRequestParams(requestParamsDefault)
    }, [params])

    const authorize = useCallback(async () => {
        await loginWithPopup()
    }, [])

    const logout = useCallback(async () => {
        await auth0Logout({
            openUrl: false
        })
    }, [auth0Logout])

    const onSend = useCallback(async () => {
        setInProgress(true)
        const token = await getAccessTokenSilently()
        fetch(config.apiEndpoint + requestString, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(r => {
                return typeof r === 'object' ? r.json() : {error: 'Unable to get a response'}
            })
            .then(res => {
                if (res?.error) {
                    notify({type: 'error', message: res.error || 'Unable to get a response'})
                }
                const responseString = typeof res !== 'object' ? res.toString() : JSON.stringify(res, null, 2)
                setResponse(responseString)
            })
            .finally(() => setInProgress(false))
            .catch(e => notify({type: 'error', message: e.message || 'Unable to get a response'}))
    }, [requestString, data])

    return <div>
        <div className="dual-layout">
            <h3>Run API request</h3>
            {!isAuthenticated ? <a href="#" className="micro-space" onClick={authorize}>Log in/Sign Up</a> :
                <a href="#" className="micro-space" onClick={logout}>Log out</a>}
        </div>
        <hr/>
        {isAuthenticated && <div className="space">
            {params && <ApiPlaygroundParametersView params={params} updateRequestParam={setRequestParams}/>}
            <CodeBlock className="space">{requestString}</CodeBlock>
            <ButtonGroup inline>
                <Button disabled={!isValid || inProgress} onClick={onSend} className="micro-space" style={{width:'50%'}}>Try it</Button>
                <CopyRequestStringView text={requestString}/>
            </ButtonGroup>
            {response && <CodeBlock>{response}</CodeBlock>}
            <hr className="flare"/>
        </div>}
    </div>
}

function CopyRequestStringView({text}) {
    const [copied, setCopied] = useState(false)
    const onClick = useCallback(() => setCopied(true), [])
    const onMouseEnter = useCallback(() => setCopied(false), [])

    return <CopyToClipboard text={text} icon={false}>
        <Button outline={copied} className="micro-space" onClick={onClick} onMouseEnter={onMouseEnter} style={{width:'50%'}}>
            <i className={copied ? 'icon icon-ok' : 'icon-copy active-icon'}/>&nbsp;
            {copied ? 'Copied' : 'Copy'}
        </Button>
    </CopyToClipboard>
}

function validateParams(params, requestParams) {
    return true
}
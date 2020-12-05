import React, { useContext } from 'react'
import { Redirect, Route, RouteProps, useLocation } from "react-router-dom";
import { APPLICATION_CONTEXT, VIEW_CONTEXT } from '../lib';
import { LINKS } from '../lib/links';

export function AuthGuard(props: RouteProps) {
    const ctx = useContext(APPLICATION_CONTEXT)
    const viewCTX = useContext(VIEW_CONTEXT)
    const location = useLocation()

    return (
        <Route {...props}>
            {ctx.signedIn() && viewCTX.user ? (
                props.children
            ) : (
                    <Redirect to={{
                        pathname: LINKS.login,
                        state: {
                            from: location
                        }
                    }} />
                )
            }
        </Route>
    )
}


/**
 * HOC for rendering components based on the authenticated state of the application.
 * This HOC is used for conditionally rendering authentication views (like login pages) or redirect if the user is already authenticated.
 * 
 * @param children View to render
 */
export function AuthHandler({ children }: any) {
    const ctx = useContext(APPLICATION_CONTEXT)
    const viewCTX = useContext(VIEW_CONTEXT)
    const location = useLocation()

    if (ctx.signedIn() && viewCTX.user) {
        const { from } = (location.state as any) || { from: { pathname: '/' } }
        return <Redirect to={from} />
    } else {
        return children
    }
}
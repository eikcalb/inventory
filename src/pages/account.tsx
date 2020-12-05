import { LockOutlined, SmileFilled, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Popconfirm, Result } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthHandler } from "../components/guard";
import { APPLICATION_CONTEXT, VIEW_CONTEXT } from "../lib";
import { LINKS } from '../lib/links';

export function AccountPage() {
    const ctx = useContext(APPLICATION_CONTEXT)
    const viewCTX = useContext(VIEW_CONTEXT)
    const [state, setState] = useState({ loading: false, showPopup: false })

    const onClick = useCallback(async () => {
        setState({ ...state, loading: true })
        try {
            await ctx.logout()
            message.success('Signed out successfully!')
        } catch (e) {
            console.log(e)
            message.error(e.message || 'Failed to sign out!')
        } finally {
            setState({ ...state, loading: false })
        }
    }, [state])

    useEffect(() => {
        const title = viewCTX.title
        viewCTX.setTitle('Account')

        return () => viewCTX.setTitle(title)
    }, [])

    return (
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <Result status='info' icon={<SmileFilled />} subTitle={`Signed in as ${ctx.user!.username}`} extra={
                <Popconfirm visible={state.showPopup} onCancel={() => setState({ ...state, showPopup: false })} onConfirm={onClick} title='Sign out of application?'>
                    <Button danger type='primary' shape='round' onClick={() => setState({ ...state, showPopup: true })} loading={state.loading}>SIGN OUT</Button>
                </Popconfirm>
            } />
        </div>
    )
}

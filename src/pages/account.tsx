import { ExclamationCircleOutlined, LockOutlined, SmileFilled, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Popconfirm, Result } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthHandler } from "../components/guard";
import { APPLICATION_CONTEXT, VIEW_CONTEXT } from "../lib";
import { LINKS } from '../lib/links';

export function AccountPage() {
    const ctx = useContext(APPLICATION_CONTEXT)
    const viewCTX = useContext(VIEW_CONTEXT)
    const [state, setState] = useState({ loading: false, })

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
        viewCTX.setTitle('Account')
    }, [])

    return (
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <Result status='info' icon={<SmileFilled />} subTitle={`Currently authenticated user is ${ctx.user!.username}`} extra={
                <Button danger type='primary' shape='round' onClick={() => {
                    Modal.confirm({
                        title: 'Do you want to sign out?',
                        icon: <ExclamationCircleOutlined />,
                        content: 'If you sign out, data stored will not be lost, but you will be unable to get back into the application without access to the Internet',
                        okText: 'sign out',
                        cancelText: 'cancel',
                        onOk: onClick
                    });
                }} loading={state.loading}>SIGN OUT</Button>
            } />
        </div>
    )
}

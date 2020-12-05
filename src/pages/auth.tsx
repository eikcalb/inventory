import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import React, { useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthHandler } from "../components/guard";
import { APPLICATION_CONTEXT } from "../lib";
import { LINKS } from '../lib/links';

export function AuthPage() {
    const ctx = useContext(APPLICATION_CONTEXT)
    const [state, setState] = useState({ loading: false })

    const onSubmit = useCallback(async ({ username, password }) => {
        setState({ ...state, loading: true })
        try {
            await ctx.login(username, password)
            message.success('Login successful!')
        } catch (e) {
            console.log(e)
            message.error(e.message || 'Failed to login!')
        } finally {
            setState({ ...state, loading: false })
        }
    }, [state])

    return (
        <AuthHandler >
            <div style={{ display: 'flex', flex: 1, justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <Form onFinish={onSubmit}>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, whitespace: false, type: 'email', message: 'Please input your username!' }]}
                    >
                        <Input allowClear prefix={<UserOutlined />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, pattern: /.{6,}/i, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            type="password"
                            placeholder="Password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button loading={state.loading} block shape='round' type="primary" htmlType="submit">{state.loading ? ' ' : 'LOG IN'}</Button>
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'center' }}>
                        <Link to={LINKS.register}>Create a new account</Link>
                    </Form.Item>
                </Form>
            </div>
        </AuthHandler>
    )
}

export function RegisterPage() {
    const ctx = useContext(APPLICATION_CONTEXT)
    const [state, setState] = useState({ loading: false })

    const onSubmit = useCallback(async ({ username, password }) => {
        setState({ ...state, loading: true })
        try {
            await ctx.register(username, password)
            message.success('Registration successful!')
        } catch (e) {
            console.log(e)
            message.error(e.message || 'Failed to register!')
        } finally {
            setState({ ...state, loading: false })
        }
    }, [state])

    return (
        <AuthHandler >
            <div style={{ display: 'flex', flex: 1, justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <Form onFinish={onSubmit}>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, whitespace: false, type: 'email', message: 'Please input your username!' }]}
                    >
                        <Input allowClear prefix={<UserOutlined />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, pattern: /.{6,}/i, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            type="password"
                            placeholder="Password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button loading={state.loading} block shape='round' type='primary' htmlType="submit">{state.loading ? ' ' : 'REGISTER'}</Button>
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'center' }}>
                        <Link to={LINKS.login}>Login with existing account</Link>
                    </Form.Item>
                </Form>
            </div>
        </AuthHandler>
    )
}
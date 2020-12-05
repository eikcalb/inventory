import React from 'react'
import { Layout, Menu, Progress } from "antd";
import { LoadingOutlined } from '@ant-design/icons';

export function BodyFragment(props: { children?: any, loading?: boolean, header?: React.ReactElement }) {
    return (
        <Layout className='is-clipped is-relative' style={{ flex: 1, height: '100vh' }}>
            {props.header ?
                // <Layout.Header className='px-0' style={{ zIndex: 10, width: '100%', backgroundColor: '#00426b', color: 'white' }}>
                props.header
                // </Layout.Header>
                : null
            }
            <Layout style={{ overflowY: 'auto' }}>
                <Layout.Content className='is-flex' style={{ minHeight: 'initial', flex: 1 }}>
                    {props.loading ?
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <LoadingOutlined style={{ fontSize: '3em', color: '#448' }} spin />
                        </div>
                        : props.children}
                </Layout.Content>
                <Layout.Footer className='px-6 py-4 has-text-centered'>&copy; eikcalb {new Date().getFullYear()}</Layout.Footer>
            </Layout>
        </Layout>

    )
}
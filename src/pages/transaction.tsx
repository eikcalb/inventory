import { ArrowLeftOutlined, CloudUploadOutlined, DatabaseOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Image, Input, InputNumber, Typography, message, Modal, Popconfirm, Skeleton, Spin, Upload, List, Row, Col, Space, Tag, Radio } from 'antd';
import { RcCustomRequestOptions } from 'antd/lib/upload/interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { log } from '..';
import { unix } from "moment";
import { APPLICATION_CONTEXT, VIEW_CONTEXT } from "../lib";
import { CurrencyFormatter, IProduct, ITransaction, Product, TransactionType } from '../lib/product';

async function getBase64(img: any): Promise<string> {
    return new Promise((res) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => res(reader.result as string));
        reader.readAsDataURL(img);
    })
}

function TransactionListItem({ item }: { item: ITransaction }) {
    const generateDescription = useCallback(() => {
        let text = ""

        item.updates.forEach((update, i) => {
            const { name, data: { price, quantity } } = update
            if (i > 0) {
                text += ', '
            }
            text += `${name} (\u20A6 ${price}, ${quantity} pieces)`
        })


        return text
    }, [item])

    const dateAdded = unix(item.dateAdded / 1000)

    return (
        <List.Item onClick={() => { }} className='is-hoverable'
            key={item.id}
            actions={[
                <span>by {item.initiator}</span>,
                <span>{dateAdded.calendar()}</span>
            ]}
        >
            <List.Item.Meta
                description={generateDescription()}
                title={<Space><p className='is-uppercase'>{item.type}</p>{item.localOnly ? <Tag icon={<CloudUploadOutlined />} color='warning'>OFFLINE</Tag> : null}</Space>}
            />
        </List.Item>
    )
}


export function ViewTransactionsPage() {
    const ctx = useContext(APPLICATION_CONTEXT)
    const viewCTX = useContext(VIEW_CONTEXT)
    const [state, setState] = useState({ loading: false, items: [] as ITransaction[] })

    const fetchTransactions = useCallback(() => {
        viewCTX.setTitle('View Transactions')
        const unsubscribe = Product.getTransactions({
            add: (data) => {
                state.items.push(data)
                const items = state.items.sort((a, b) => a.dateAdded < b.dateAdded ? 1 : a.dateAdded > b.dateAdded ? -1 : 0)
                setState(state => ({ ...state, items: [...items] }))
            },
            remove: (data) => {
                const items = state.items.filter(v => v.id !== data.id)
                setState(state => ({ ...state, items: [...items] }))
            },
            change: (data) => {
                const index = state.items.findIndex(v => v.id === data.id)
                state.items[index] = data
                let items = state.items
                setState(state => ({ ...state, items: [...items] }))
            }
        })
        return () => { unsubscribe() }
    }, [viewCTX, state])

    useEffect(fetchTransactions, [])

    return (
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', flexDirection: 'column', alignItems: 'stretch', margin: 20, padding: '2em 5em' }}>
            <List
                dataSource={state.items}
                size='large'
                itemLayout='vertical'
                loading={state.loading}
                pagination={{ position: 'bottom', pageSize: 20 }}
                bordered
                renderItem={(item) => (
                    <TransactionListItem item={item} />
                )}
            />
        </div>
    )
}


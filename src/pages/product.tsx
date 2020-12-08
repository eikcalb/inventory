import { ArrowLeftOutlined, CloudUploadOutlined, DatabaseOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Image, Input, InputNumber, Typography, message, Modal, Popconfirm, Skeleton, Spin, Upload, List, Row, Col, Space, Tag, Radio } from 'antd';
import { RcCustomRequestOptions } from 'antd/lib/upload/interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { log } from '..';
import { APPLICATION_CONTEXT, VIEW_CONTEXT } from "../lib";
import { CurrencyFormatter, IProduct, Product, TransactionType } from '../lib/product';

async function getBase64(img: any): Promise<string> {
    return new Promise((res) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => res(reader.result as string));
        reader.readAsDataURL(img);
    })
}

function ProductListItem({ item, onClick }: { item: IProduct, onClick: any }) {
    const [state, setState] = useState({ loading: false })

    return (
        <Skeleton active loading={state.loading} >
            <List.Item onClick={() => onClick(item)} className='is-hoverable'
                key={item.id}
                actions={[
                    <span>{'\u20a6'} {CurrencyFormatter.format(item.price)}</span>,
                    <span>{item.quantity.toLocaleString()} pcs. remaining</span>
                ]}
                extra={
                    <img
                        onLoad={() => setState({ ...state, loading: false })}
                        width={100}
                        alt={item.name}
                        src={item.localPhotoURL}
                    />
                }
            >
                <List.Item.Meta
                    description={item.description}
                    title={<Space><p className='is-uppercase'>{item.name}</p>{item.localOnly ? <Tag icon={<CloudUploadOutlined />} color='warning'>OFFLINE</Tag> : null}</Space>}
                />
            </List.Item>
        </Skeleton >
    )
}

function ProductDetails({ item: itemProp, onClose }: { item: IProduct, onClose: any }) {
    const ctx = useContext(APPLICATION_CONTEXT)
    const [state, setState] = useState({ confirmDelete: false, loading: false, saving: false, modal: false, item: itemProp, editType: TransactionType.SALE })
    const [form, setForm] = useState({ price: itemProp.price, quantity: 0 })

    const { item } = state

    return (
        <Drawer
            width={600}
            placement='right'
            visible={!!item}
            closable={false}
            destroyOnClose
            onClose={onClose}
            maskStyle={{ backgroundColor: '#111a' }}
        >
            <p className='has-text-weight-bold is-uppercase'>
                {item.name}
            </p>
            <Row>
                <Col span={24}>
                    <Image width={'100%'} src={item.localPhotoURL} />
                </Col>
            </Row>
            <Row className='my-4'>
                <Col span={24} style={{ textAlign: 'center' }}>
                    <Typography.Paragraph>{item.description}</Typography.Paragraph>
                </Col>
            </Row>

            <Row className='my-1'>
                <Col span={4}>
                    <Typography.Paragraph className='has-text-grey'>Price</Typography.Paragraph>
                </Col>
                <Col span={20} style={{ textAlign: 'center' }}>
                    <Typography.Paragraph>{`\u20A6`} {CurrencyFormatter.format(item.price)}</Typography.Paragraph>
                </Col>
            </Row>

            <Row className='my-1 mb-6'>
                <Col span={4}>
                    <Typography.Paragraph className='has-text-grey'>Quantity</Typography.Paragraph>
                </Col>
                <Col span={20} style={{ textAlign: 'center' }}>
                    <Typography.Paragraph>{item.quantity.toLocaleString()} pieces available</Typography.Paragraph>
                </Col>
            </Row>

            <Row>
                <Col span={24} style={{ justifyContent: 'center', display: 'flex' }}>
                    <Space>
                        <Button shape='round' icon={<ArrowLeftOutlined />} onClick={onClose}>Back</Button>
                        <Button onClick={() => setState({ ...state, modal: true })} disabled={state.loading} type='primary' shape='round'>New Transaction</Button>


                        <Popconfirm onCancel={() => setState({ ...state, confirmDelete: false })} onConfirm={async () => {
                            setState({ ...state, loading: true })
                            try {
                                await Product.removeProduct(item)
                                setState({ ...state, loading: false })
                                message.success('Removed product successfully!')
                                onClose()
                            } catch (e) {
                                message.error(e.message || 'Failed to delete product!')
                                setState({ ...state, loading: false })
                            }
                        }} title='Delete this product?' visible={state.confirmDelete}>
                            <Button danger loading={state.loading} onClick={() => setState({ ...state, confirmDelete: true })} shape='round'>Delete Product</Button>
                        </Popconfirm>
                    </Space>
                </Col>
            </Row>

            {state.modal ?
                <Modal
                    centered
                    destroyOnClose
                    keyboard={false}
                    title={'Register Sale or Purchase'}
                    closable={false}
                    maskClosable={false}
                    visible={state.modal}
                    okText='Update'
                    okType='primary'
                    onOk={async () => {
                        setState({ ...state, saving: true })
                        try {
                            const updated = await Product.updateProductValue(ctx, item, form, state.editType)
                            setState({ ...state, saving: false, modal: false, item: updated })
                            message.success('Updated product successfully!')
                        } catch (e) {
                            message.error(e.message || 'Failed to update product!')
                            setState({ ...state, saving: false })
                        }
                    }}
                    onCancel={() => setState({ ...state, modal: false })}
                    confirmLoading={state.saving}
                    cancelButtonProps={{ disabled: state.saving }}
                >
                    <Radio.Group buttonStyle='solid' style={{ display: 'flex', justifyContent: 'center' }}
                        onChange={e => setState({ ...state, editType: e.target.value })} value={state.editType}>
                        <Radio.Button value={TransactionType.SALE}>Sale</Radio.Button>
                        <Radio.Button value={TransactionType.PURCHASE}>Purchase</Radio.Button>
                    </Radio.Group>

                    <Typography.Paragraph className='has-text-grey is-size-7 my-4 has-text-centered'>Set the price and quantity for this {state.editType === TransactionType.SALE ? 'sale' : 'purchase'}</Typography.Paragraph>

                    <Form
                    >
                        <Form.Item
                            initialValue={form.price}
                            name="price"
                            label={`Product Price (\u20A6)`}
                            rules={[{ required: true, type: 'number', message: 'Please provide product price!' }]}
                        >
                            <InputNumber
                                onChange={price => setForm({ ...form, price: price as number })} min={0} placeholder="" />
                        </Form.Item>

                        <Form.Item
                            initialValue={form.quantity}
                            name="quantity"
                            label='Product Quantity'
                            rules={[{ required: true, type: 'number', message: 'Please provide product quantity!' }]}
                        >
                            <InputNumber onChange={(quantity) => setForm({ ...form, quantity: quantity as number })} min={0} placeholder="" />
                        </Form.Item>
                    </Form>
                </Modal>
                : null}
        </Drawer>
    )
}

export function AddProductPage() {
    const ctx = useContext(APPLICATION_CONTEXT)
    const viewCTX = useContext(VIEW_CONTEXT)
    const [state, setState] = useState({ loading: false, showPopup: false, imageURL: '', file: null as null | File })

    const { Dragger } = Upload

    const onAddProduct = useCallback(async (values) => {
        setState({ ...state, loading: true, showPopup: false })
        // TODO: Before saving new product, confirm network status
        try {
            await new Promise((res, rej) => {
                let uploadStarted = false
                Modal.confirm({
                    title: 'Add new product?',
                    content: 'Selected media will be uploaded to cloud and the product will be synchronized with all users once uploaded',
                    okText: 'Add',
                    okType: 'primary',
                    onOk: async () => {
                        // Upload product file
                        try {
                            uploadStarted = true
                            const success = await Product.addProduct(ctx, {
                                ...values,
                                image: values.image.file.originFileObj,
                            })
                            res(success)
                        } catch (e) {
                            rej(e)
                        } finally {
                            uploadStarted = false
                        }
                    },
                    cancelButtonProps: { loading: uploadStarted },
                    onCancel: (close) => {
                        if (uploadStarted) {
                            message.info('Cannot cancel when upload is in progress!')
                        } else {
                            rej(new Error('You cancelled product upload attempt!'))
                            close()
                        }
                    }
                })
            })
            message.success('Product added successfully!')
        } catch (e) {
            console.log(e)
            message.error(e.message || 'Failed to add product!')
        } finally {
            setState({ ...state, loading: false, showPopup: false })
        }
    }, [state])

    useEffect(() => {
        viewCTX.setTitle('Add Product')
    }, [])

    return (
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', flexDirection: 'column', alignItems: 'stretch', margin: 20, padding: '2em 5em' }}>
            <Spin spinning={state.loading}>
                <Form onFinish={onAddProduct} >
                    <Form.Item
                        rules={[{ required: true, message: 'Product image is required!' }]}
                        name='image'>
                        <Dragger name='image' accept='image/*' className='avatar-uploader' showUploadList={false} multiple={false} listType='picture-card'
                            customRequest={async (options: RcCustomRequestOptions) => {
                                // Dummy request. 
                                // File will be uploaded upon submit.
                            }}
                            onChange={async (info) => {
                                const imageURL: string = await getBase64(info.file.originFileObj)
                                setState({ ...state, imageURL, file: info.file.originFileObj as File })
                            }}>
                            {state.imageURL ?
                                <Image width={400} preview={false} src={state.imageURL} alt="avatar" style={{ width: '100%' }} />
                                :
                                <>
                                    <p className='ant-upload-drag-icon'><DatabaseOutlined /></p>
                                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                    <p className="ant-upload-hint">Select the image to describe this product</p>
                                </>
                            }
                        </Dragger>
                    </Form.Item>
                    <Form.Item
                        name="name"
                        rules={[{ required: true, type: 'string', message: 'Please provide product name!' }]}
                    >
                        <Input allowClear placeholder="Product Name" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        rules={[{ required: true, min: 10, message: 'Please provide a meaningful description for this product!' }]}
                    >
                        <Input.TextArea
                            autoSize={{ minRows: 5 }}
                            allowClear
                            showCount
                            maxLength={2000}
                            placeholder="Product Description"
                        />
                    </Form.Item>

                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Form.Item
                            name="price"
                            label={`Product Price (\u20A6)`}
                            rules={[{ required: true, type: 'number', message: 'Please provide product price!' }]}
                        >
                            <InputNumber min={0} placeholder="" />
                        </Form.Item>

                        <Form.Item
                            name="quantity"
                            label='Product Quantity'
                            rules={[{ required: true, type: 'number', message: 'Please provide product quantity!' }]}
                        >
                            <InputNumber min={0} placeholder="" />
                        </Form.Item>
                    </div>

                    <Form.Item>
                        <Button block icon={<PlusOutlined />} type='primary' shape='round' loading={state.loading} htmlType='submit'>ADD PRODUCT</Button>
                    </Form.Item>
                </Form>
            </Spin>
        </div>
    )
}

export function ViewProductsPage() {
    const ctx = useContext(APPLICATION_CONTEXT)
    const viewCTX = useContext(VIEW_CONTEXT)
    const [state, setState] = useState({ loading: false, items: [] as IProduct[], drawer: null as IProduct | null })

    const fetchProducts = useCallback(() => {
        viewCTX.setTitle('View Products')
        const unsubscribe = Product.getProducts({
            add: (data) => {
                state.items.push(data)
                const items = state.items.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
                setState(state => ({ ...state, items: [...items] }))
            },
            remove: (data) => {
                console.log('removed', data, state.items)
                const items = state.items.filter(v => v.id !== data.id)
                setState(state => ({ ...state, items: [...items] }))
            },
            change: (data) => {
                const index = state.items.findIndex(v => v.id === data.id)
                const old = state.items[index]
                state.items[index] = data
                let items = state.items
                console.log('changed', data, items)

                // If the product name changed, we have to sort the products
                if (old.name !== data.name) {
                    items = items.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
                }
                setState(state => ({ ...state, items: [...items] }))
            }
        })
        return () => { unsubscribe() }
    }, [viewCTX, state])

    useEffect(fetchProducts, [])

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
                    <ProductListItem onClick={() => setState({ ...state, drawer: item })} item={item} />
                )}
            />
            {state.drawer ?
                <ProductDetails onClose={() => setState({ ...state, drawer: null })} item={state.drawer} />
                : null}
        </div>
    )
}


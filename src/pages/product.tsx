import { DatabaseOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Image, Input, InputNumber, message, Modal, Popconfirm, Spin, Upload } from 'antd';
import { RcCustomRequestOptions } from 'antd/lib/upload/interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { APPLICATION_CONTEXT, VIEW_CONTEXT } from "../lib";
import { Product } from '../lib/product';

async function getBase64(img: any): Promise<string> {
    return new Promise((res) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => res(reader.result as string));
        reader.readAsDataURL(img);
    })
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

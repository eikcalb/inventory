import { ArrowLeftOutlined, DatabaseFilled, PlusOutlined, UnorderedListOutlined, UserOutlined, WalletFilled } from "@ant-design/icons";
import { Button, Layout, Menu, message, PageHeader, Result } from "antd";
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import { electron } from '.';
import './App.css';
import { BodyFragment } from './components/body';
import { AuthGuard } from './components/guard';
import { APPLICATION_CONTEXT, VIEW_CONTEXT } from './lib';
import { LINKS } from './lib/links';
import { User } from './lib/user';
import { AccountPage } from "./pages/account";
import { AuthPage, RegisterPage } from './pages/auth';

function App() {
  const ctx = useContext(APPLICATION_CONTEXT)
  const [state, setState] = useState({ collapsed: false, loading: true })
  const [title, setTitle] = useState(' ')
  const [currentMenu, setCurrentMenu] = useState('account')
  const [user, setUser] = useState(null as null | undefined | User)
  const history = useHistory()

  const onMenuClick = useCallback(({ item, key, keyPath, domEvent }: { [key: string]: any }) => {
    //@ts-ignore
    const selected = LINKS[key]
    if (selected) {
      history.push(selected)
      setCurrentMenu(key)
    }
  }, [])

  useEffect(() => {
    //@ts-ignore
    history.push(LINKS[currentMenu])

    message.config({ duration: 3 })
    ctx.loginListener = () => setUser(ctx.user)
    ctx.logoutListener = () => setUser(null)
    ctx.ready.then(async () => {
      console.log('ready')
      setState({ ...state, loading: false })
    }).catch(e => {
      console.log(e, 'ready failed')
    })
  }, [])

  const { SubMenu } = Menu

  return (
    <VIEW_CONTEXT.Provider value={{ title, setTitle, user, setLoading: (loading) => setState({ ...state, loading }) }} >
      <Layout hasSider className='layout is-clipped'>
        <Layout.Sider collapsible collapsed={state.collapsed} width={250} onCollapse={(collapsed) => setState({ ...state, collapsed })}>
          <Menu selectedKeys={[currentMenu]} onClick={onMenuClick} mode='inline' theme='dark' >
            <SubMenu key='products' icon={<DatabaseFilled />} title='Products'>
              <Menu.Item key={'addProduct'} icon={<PlusOutlined />}>Add Product</Menu.Item>
              <Menu.Item key={'viewProduct'} icon={<UnorderedListOutlined />}>View Products</Menu.Item>
            </SubMenu>
            <SubMenu key='Transactions' icon={<WalletFilled />} title='Transactions'>
              <Menu.Item key={'addTransaction'} icon={<PlusOutlined />}>New Transaction</Menu.Item>
              <Menu.Item key={'viewTransaction'} icon={<UnorderedListOutlined />}>View Transactions</Menu.Item>
            </SubMenu>
            <Menu.Item key={'account'} icon={<UserOutlined />} >Account</Menu.Item>
            <Menu.Item danger key='Dev' onClick={async () => { electron.remote.getCurrentWindow().webContents.toggleDevTools() }} icon={<UserOutlined />} >ToggleDev</Menu.Item>
          </Menu>
        </Layout.Sider>
        <BodyFragment
          loading={state.loading}
          header={
            <PageHeader style={{ backgroundColor: '#00426b' }} onBack={history.goBack}
              backIcon={<ArrowLeftOutlined style={{ color: 'white' }} />}
              title={<span style={{ color: 'white' }}>{title}</span>} />
          }>
          <Switch >
            <AuthGuard path={LINKS.homepage} strict exact>
              <Redirect to={LINKS.viewProduct} />
            </AuthGuard>
            <AuthGuard path={LINKS.viewProduct} strict />
            <AuthGuard path={LINKS.addProduct} strict />
            <AuthGuard path={LINKS.viewTransaction} strict />
            <AuthGuard path={LINKS.addTransaction} strict />
            <AuthGuard path={LINKS.account} component={AccountPage} strict exact />

            <Route path={LINKS.login} component={AuthPage} strict />
            <Route path={LINKS.register} component={RegisterPage} strict />

            <Route>
              <Result style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', textTransform: 'uppercase' }} status='404' title="Page Not Found!" extra={<Button onClick={() => history.length > 1 ? history.goBack() : history.push(LINKS.account)} type="primary">Back</Button>} />
            </Route>
          </Switch>
        </BodyFragment>
      </Layout>
    </VIEW_CONTEXT.Provider>
  );
}

export default App;

import { auth, db } from './firebase'
import { User, UserType } from './user'
import { BaseStorage, Storage } from './storage'
import config from "./config";
import firebase from 'firebase'
import validator from 'validator'
import { createContext } from 'react'

const log = window.require('electron-log')
const usersRef = db.collection('users')

export interface IConfig {
    engine: string
}

export class Application {
    name: string = 'Inventory Application'
    version = '1.0-alpha'
    ready: Promise<boolean>
    storage: Storage
    user?: User

    loginListener?: () => any = () => console.log('Signin successful!')
    logoutListener?: () => any = () => console.log('Signout successful!')

    constructor() {
        this.storage = new BaseStorage(config)
        this.ready = new Promise(async (res, rej) => {
            try {
                await this.init()
                res(true)
            } catch (e) {
                // if an error occurred during initialization, throw the error and handle within the application
                log.error('Application initialization error', e)
                return rej(false)
            }
        })
    }

    /**
     * Initialize application dependencies.
     * 
     * Dependencies that fail to load should fail silently at this stage, unless required for application to function.
     */
    async init() {
        // check for existing user session
        try {
            await new Promise((res, rej) => {
                // Setup authentication state change listener
                auth.onAuthStateChanged(async (user) => {
                    if (user && !user.isAnonymous) {
                        await this.inflateUser(user)

                        if (this.loginListener) {
                            this.loginListener()
                        }
                    } else {
                        if (this.signedIn()) {
                            await this.logout()
                        }
                    }
                    res()
                })
            })
        } catch (e) {
            console.log(e)
        }

        return true
    }


    signedIn(): boolean {
        return this.user && this.user.fUser ? true : false
    }


    protected async inflateUser(fUser: firebase.User) {
        this.user = new User(fUser)
        return this.user
    }

    async validateNumber(phone: string) {
        if (!phone) {
            throw new Error("Phone number must be provided!")
        }
        phone = phone.trim()
        if (!phone || !validator.isMobilePhone(phone)) {
            throw new Error("Invalid phone number provided!")
        }

        return true
    }

    async register(username: string, password: string) {
        try {
            await this.validateLogin(username, password)
            // If signin is successful, the auth state listener registered above will get triggered
            const userCred = await auth.createUserWithEmailAndPassword(username, password)
            if (userCred.user) {
                usersRef.doc(userCred.user.uid).set({
                    id: userCred.user.uid,
                    type: UserType.USER,
                    dateCreated: firebase.firestore.FieldValue.serverTimestamp()
                })
            }
        } catch (e) {
            console.log('firebase auth error: ', e);
            const errorCode = e.code;
            if (errorCode === 'auth/wrong-password') {
                throw new Error('Incorrect password provided!');
            } else {
                throw e;
            }
        }
    }

    async login(username: string, password: string) {
        try {
            await this.validateLogin(username, password)
            // If signin is successful, the auth state listener registered above will get triggered
            await auth.signInWithEmailAndPassword(username, password)
        } catch (e) {
            console.log('firebase auth error: ', e);
            const errorCode = e.code;
            if (errorCode === 'auth/wrong-password') {
                throw new Error('Incorrect password provided!');
            } else {
                throw e;
            }
        }
    }

    protected async validateLogin(username: string, password: string) {
        if (!username || !password) {
            throw new Error("Credentials not provided!")
        }
        username = username.trim()

        if (!username || !validator.isEmail(username)) {
            throw new Error("Invalid email address provided!")
        }
        if (!validator.matches(password, /.{6,}/i)) {
            throw new Error("Invalid password provided (Password must be more than 6 characters)!")
        }
    }


    async logout() {
        await auth.signOut()
        this.user = undefined
        if (this.logoutListener) {
            this.logoutListener()
        }
    }

    /**
     * Check if host computer has Internet access.
     * 
     * @use sparingly to avoid performance degredation
     */
    async hasInternetConnection() {
        return new Promise((res, rej) => {
            let handled = false
            if (!window.navigator.onLine) {
                // System has already detected lack of network, return result
                return res(false)
            } else {
                // Test Internet access by making a network request.
                // Set a timeout of 30 seconds to fail test if no response yet.
                setTimeout(() => {
                    if (handled) {
                        return
                    } else {
                        handled = true
                    }
                    res(false)
                }, 30000)
                window.require('dns').resolve('www.google.com', (err: any, ips: string[]) => {
                    if (handled) {
                        return
                    } else {
                        handled = true
                    }

                    if (err) {
                        // If error occurred during lookup, assume that there is no Internet
                        console.log(err)
                        log.error(err)
                        return res(false)
                    }
                    console.log(ips)
                    if (ips.length < 1) {
                        // The provided host was not resolved, hence there is no Internet access...or Google is probbably extinct...whichever is likely
                        return res(false)
                    }
                    return res(true)
                })
            }
        })
    }
}


export const DEFAULT_APPLICATION = new Application()

/**
 * This is the application context used within the web application.
 * 
 * This context provided the application engine and is not tied to any view rendering.
 * 
 * The underlying aplication object exposes the required functions and do not modify the view.
 * This underlying object is made available to all React components via the application context.
 * 
 * All view rendering is managed in React.
 * 
 * **VIEW RENDERING SHOULD NOT DEPEND ON ANY PROPERTY OF THIS CONTEXT**
 */
export const APPLICATION_CONTEXT = createContext<Application>(DEFAULT_APPLICATION)

export const VIEW_CONTEXT = createContext({
    title: ' ',
    setTitle: (title: string) => { },
    user: null as null | undefined | User,
    setLoading: (loading: boolean) => { }
})
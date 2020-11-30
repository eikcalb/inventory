import log from 'electron-log'
import { remote } from 'electron'
import { auth } from './firebase'
import { User } from './user'
import { Storage } from './storage'

export class Application {
    name: string = 'Inventory Application'
    version = '1.0-alpha'
    ready: Promise<boolean>
    storage: Storage
    user?: User

    logoutListener?: () => any
    loginListener?: () => any

    constructor() {
        this.storage = new Storage()

        this.ready = new Promise(async (res, rej) => {
            try {
                await this.init()
                res(true)
            } catch (e) {
                // if an error occurred during initialization, throw the error and handle within the application
                log.log(e)
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
                auth.onAuthStateChanged(user => {
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


    protected async inflateUser(fbase) {
        // inflate user session
        let session: User | null = await localforage.getItem(KEYS.USER_SESSION)
        if (!session) throw new Error("No session available for user!")

        this.user = new User(session)
        return this.user
    }

    protected async persistUser() {
        if (!this.user) {
            throw new Error('No user created!')
        }

        await localforage.setItem(KEYS.USER_SESSION, this.user)
    }

    async validateNumber(phone: string) {
        if (!phone) {
            throw new Error("Phone number must be provided!")
        }
        phone = phone.trim()
        if (!phone || !validator.isMobilePhone(phone)) {
            throw new Error("Invalid phone number provided!")
        }
        if (!phone.startsWith('+')) {
            throw new Error("Phone number must begin with '+' and contain country code!")
        }

        const response = await this.initiateNetworkRequest(`/users/phone/${encodeURIComponent(phone)}`, {
            method: 'GET',
        })
        if (!response.ok) {
            throw new Error((await response.json())?.message || "Verification failed!")
        }

        const jsonResponse = await response.json()
        if (!jsonResponse.valid) {
            throw new Error('Invalid phone number (ensure phone number is associated with a user)!')
        }

        return true
    }

    async triggerVerification(phone: string, channel: string = 'sms') {
        if (!phone) {
            throw new Error("Phone number must be provided!")
        }
        phone = phone.trim()

        if (!phone || !validator.isMobilePhone(phone)) {
            throw new Error("Invalid phone number provided!")
        }
        if (!phone.startsWith('+')) {
            throw new Error("Phone number must begin with '+' and contain country code!")
        }

        const response = await this.initiateNetworkRequest('/users/sms_registration', {
            method: 'POST',
            body: JSON.stringify({ phone_number: phone, channel })
        })
        if (!response.ok) {
            throw new Error((await response.json())?.message || "Verification failed!")
        }

        return true
    }

    async login(username, code, password) {
        try {
            await this.validateLogin(username, code, password)

            const response = await this.initiateNetworkRequest('/users/login', {
                method: 'POST',
                referrerPolicy: "no-referrer",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ phone_number: username, code, password })
            })
            if (!response.ok) {
                throw new Error((await response.json())?.message || "Login failed!")
            }

            const jsonResponse = await response.json()
            if (!jsonResponse.success) {
                throw new Error("Login failed!")
            }
            this.user = await User.getUser(this, jsonResponse.userName, jsonResponse.token)
            if (this.user.role !== 'admin') {
                throw new Error("Authenticated access only allowed for administrators!")
            }

            await this.persistUser()
            if (this.loginListener) {
                this.loginListener()
            }

            return this.user

        } catch (e) {
            throw e
        }
    }

    protected async validateLogin(phone: string, code: string, password: string) {
        if (!phone || !password || !code) {
            throw new Error("Credentials not provided!")
        }
        phone = phone.trim()

        if (!phone || !validator.isMobilePhone(phone)) {
            throw new Error("Invalid phone number provided!")
        }
        if (!phone.startsWith('+')) {
            throw new Error("Phone number must begin with '+' and contain country code!")
        }
        if (!validator.matches(password, /.{6,}/i)) {
            throw new Error("Invalid password provided (Password must be more than 6 characters)!")
        }
        if (!validator.matches(code, /[0-9]{4}/)) {
            throw new Error("Invalid code provided (provided code must have 4 digits)!")
        }
    }

    // TODO
    async addAdmin(data: IRegister) {
        try {
            await this.validateRegister(data)

            const response = await this.initiateNetworkRequest('/users/new', {
                method: 'POST',
                body: JSON.stringify({
                    ...data,
                    role: 'admin',
                    // TODO: change to 'pending'
                    account_status: 'accepted'
                })
            })
            if (!response.ok) {
                throw new Error((await response.json())?.message)
            }

            const jsonResponse = await response.json()

            return jsonResponse
        } catch (e) {
            throw e
        }
    }

    protected async validateRegister(data: IRegister) {
        let { email, password, first_name, last_name, password_verify, phone_number } = data
        if (!email || !password) {
            throw new Error("Credentials not provided!")
        }
        if (password !== password_verify) {
            throw new Error('Passwords do not match!')
        }
        email = email.trim()
        first_name = first_name.trim()
        last_name = last_name.trim()
        if (!first_name || !last_name) {
            throw new Error('Firstname and lastname must be provided!')
        }
        if (!email || !validator.isEmail(email)) {
            throw new Error("Invalid username provided!")
        }
        if (!phone_number || !validator.isMobilePhone(phone_number)) {
            throw new Error("Invalid phone number provided!")
        }
        if (!phone_number.startsWith('+')) {
            throw new Error("Phone number must begin with '+' and contain country code!")
        }
        if (!validator.matches(password, /.{6,}/i)) {
            throw new Error("Invalid password provided (Password must be more than 6 characters)!")
        }
    }


    async logout() {
        this.user = undefined
        await localforage.removeItem(KEYS.USER_SESSION)
        //await localforage.removeItem(KEYS.REFRESH_TOKEN)
        if (this.logoutListener) {
            this.logoutListener()
        }
    }
}

export const DEFAULT_APPLICATION = new Application(CONFIG)
DEFAULT_APPLICATION.user = DUMMY_USER
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

}
import firebase from 'firebase'

export class User {
    username: string
    fUser: firebase.User

    constructor(fUser: firebase.User) {
        this.username = fUser.email!
        this.fUser = fUser
    }

}
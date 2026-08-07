export interface IUser {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAuthUser extends Pick<IUser, 'id' | 'email' | 'name'> {
    role: string;
}
// Here we extract most things out of the user object from the mongo db.
// Everything can be found in the jwt token, but the password is hashed.

export const getUserObjectInfo = user => {
    return {
        _id: user.get('_id'),
        name: user.get('name'),
        email: user.get('email'),
        token: user.get('token')
    };
};

export default getUserObjectInfo;

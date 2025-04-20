import bcrypt from 'bcrypt'

export const hashPassword = async (plainPass: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPass,salt);
};

export const comparePassword = async (
    plainPass: string,
    hashedPass: string
): Promise<boolean> => {
    return await bcrypt.compare(plainPass,hashedPass);
};
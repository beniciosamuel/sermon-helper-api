import argon2 from 'argon2';

export class Password {
	/**
	 * Encrypts a plain text password using argon2 algorithm
	 * @param plainPassword - The plain text password to encrypt
	 * @returns The hashed password
	 */
	async encrypt(plainPassword: string): Promise<string> {
		try {
			const hash = await argon2.hash(plainPassword, {
				type: argon2.argon2id,
				memoryCost: 65536,
				timeCost: 3,
				parallelism: 4,
			});
			return hash;
		} catch (error) {
			throw new Error(`Failed to encrypt password: ${error}`);
		}
	}

	/**
	 * Verifies a plain text password against a hash
	 * Note: Argon2 is a one-way hashing algorithm, so we verify instead of decrypt
	 * @param hash - The hashed password to verify against
	 * @param plainPassword - The plain text password to verify
	 * @returns True if the password matches, false otherwise
	 */
	async verify(hash: string, plainPassword: string): Promise<boolean> {
		try {
			return await argon2.verify(hash, plainPassword);
		} catch (error) {
			throw new Error(`Failed to verify password: ${error}`);
		}
	}
}

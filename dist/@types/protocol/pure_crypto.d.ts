/**
 * Interface that clients have to implement to use snjs
 */
export interface SNPureCrypto {
    /**
     * Derives a key from a password and salt using PBKDF2 via WebCrypto.
     * @param password - utf8 string
     * @param salt - utf8 string
     * @param iterations
     * @param length - In bits
     * @returns Hex string
     */
    pbkdf2(password: string, salt: string, iterations: number, length: number): Promise<string | null>;
    /**
     * Generates a random key in hex format
     * @param bits - Length of key in bits
     * @returns A string key in hex format
     */
    generateRandomKey(bits: number): Promise<string>;
    /**
     * Encrypts a string using AES-CBC via WebCrypto.
     * @param plaintext
     * @param iv - In hex format
     * @param key - In hex format
     * @returns Ciphertext in Base64 format.
     */
    aes256CbcEncrypt(plaintext: string, iv: string, key: string): Promise<string | null>;
    /**
     * Decrypts a string using AES-CBC via WebCrypto.
     * @param ciphertext - Base64 format
     * @param iv - In hex format
     * @param key - In hex format
     * @returns Plain utf8 string or null if decryption fails
     */
    aes256CbcDecrypt(ciphertext: string, iv: string, key: string): Promise<string | null>;
    /**
     * Runs HMAC with SHA-256 on a message with key.
     * @param message - Plain utf8 string
     * @param key - In hex format
     * @returns Hex string or null if computation fails
     */
    hmac256(message: string, key: string): Promise<string | null>;
    /**
     * @param text - Plain utf8 string
     * @returns Hex string
     */
    sha256(text: string): Promise<string>;
    /**
     * Use only for legacy applications.
     * @param text - Plain utf8 string
     * @returns Hex string
     */
    unsafeSha1(text: string): Promise<string>;
    /**
     * Derives a key from a password and salt using
     * argon2id (crypto_pwhash_ALG_DEFAULT).
     * @param password - Plain text string
     * @param salt - Salt in hex format
     * @param iterations - The algorithm's opslimit (recommended min 2)
     * @param bytes - The algorithm's memory limit (memlimit) (recommended min 67108864)
     * @param length - The output key length
     * @returns Derived key in hex format
     */
    argon2(password: string, salt: string, iterations: number, bytes: number, length: number): Promise<string>;
    /**
     * Encrypt a message (and associated data) with XChaCha20-Poly1305.
     * @param plaintext
     * @param nonce - In hex format
     * @param key - In hex format
     * @param assocData
     * @returns Base64 ciphertext string
     */
    xchacha20Encrypt(plaintext: string, nonce: string, key: string, assocData: string): Promise<string>;
    /**
     * Decrypt a message (and associated data) with XChaCha20-Poly1305
     * @param ciphertext
     * @param nonce - In hex format
     * @param key - In hex format
     * @param assocData
     * @returns Plain utf8 string or null if decryption fails
     */
    xchacha20Decrypt(ciphertext: string, nonce: string, key: string, assocData: string): Promise<string | null>;
    /**
     * Converts a plain string into base64
     * @param text - A plain string
     * @returns  A base64 encoded string
     */
    base64Encode(text: string): Promise<string>;
    /**
     * Converts a base64 string into a plain string
     * @param base64String - A base64 encoded string
     * @returns A plain string
     */
    base64Decode(base64String: string): Promise<string>;
    deinit(): void;
    /**
     * Generates a UUID string syncronously.
     */
    generateUUIDSync(): string;
    /**
     * Generates a UUID string asyncronously.
     * Can be overriden by native platforms to provide async implementation
     */
    generateUUID(): Promise<string>;
    /**
     * Constant-time string comparison
     * @param a
     * @param b
     */
    timingSafeEqual(a: string, b: string): boolean;
}

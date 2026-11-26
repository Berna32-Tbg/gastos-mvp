import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const toHex = (b: Uint8Array) => Array.from(b, x => x.toString(16).padStart(2, '0')).join('');

/** Clave de SQLCipher: 256 bits aleatorios, guardados en Keychain/Keystore. */
export async function getDbKey(): Promise<string> {
  let key = await SecureStore.getItemAsync('db_key');
  if (!key) {
    key = toHex(Crypto.getRandomBytes(32));
    await SecureStore.setItemAsync('db_key', key);
  }
  return key;
}

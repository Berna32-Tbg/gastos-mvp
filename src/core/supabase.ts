import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as aesjs from 'aes-js';

/**
 * Las sesiones JWT superan el límite de SecureStore (~2 KB). Se cifran con AES-CTR,
 * la sesión cifrada va en AsyncStorage y la clave AES en SecureStore.
 */
class LargeSecureStore {
  private async encrypt(key: string, value: string) {
    const aesKey = Crypto.getRandomBytes(32);
    const cipher = new aesjs.ModeOfOperation.ctr(aesKey, new aesjs.Counter(1));
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(aesKey));
    return aesjs.utils.hex.fromBytes(cipher.encrypt(aesjs.utils.utf8.toBytes(value)));
  }
  private async decrypt(key: string, value: string) {
    const hex = await SecureStore.getItemAsync(key);
    if (!hex) return null;
    const cipher = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(hex), new aesjs.Counter(1));
    return aesjs.utils.utf8.fromBytes(cipher.decrypt(aesjs.utils.hex.toBytes(value)));
  }
  async getItem(key: string) {
    const v = await AsyncStorage.getItem(key);
    return v ? this.decrypt(key, v) : null;
  }
  async setItem(key: string, value: string) {
    await AsyncStorage.setItem(key, await this.encrypt(key, value));
  }
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { storage: new LargeSecureStore(), autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }
);

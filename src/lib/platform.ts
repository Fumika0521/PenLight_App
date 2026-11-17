import { Capacitor } from '@capacitor/core';

/** true when running as a native iOS/Android app via Capacitor */
export const isNative = Capacitor.isNativePlatform();

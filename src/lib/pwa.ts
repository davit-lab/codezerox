// Global PWA install prompt handler
// Captures beforeinstallprompt early so it's available on any page

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let isAppInstalled = false;
const listeners: Set<() => void> = new Set();

// Capture the event as early as possible
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
  listeners.forEach((fn) => fn());
});

window.addEventListener("appinstalled", () => {
  isAppInstalled = true;
  deferredPrompt = null;
  listeners.forEach((fn) => fn());
});

if (window.matchMedia("(display-mode: standalone)").matches) {
  isAppInstalled = true;
}

export function getPWAInstallPrompt() {
  return deferredPrompt;
}

export function getIsAppInstalled() {
  return isAppInstalled;
}

export async function triggerPWAInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (deferredPrompt) {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      isAppInstalled = true;
    }
    deferredPrompt = null;
    listeners.forEach((fn) => fn());
    return outcome;
  }
  return "unavailable";
}

export function onPWAStateChange(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

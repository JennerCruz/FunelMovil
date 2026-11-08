import { useRef, useState } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { WebView as NativeWebView, type WebViewMessageEvent } from "react-native-webview";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const PORTAL_URL = "https://propio.fwy.mx/panel/Login.aspx?ReturnUrl=%2fpanel%2fhandlers%2fUserHandler.aspx%3fpg%3dlogout";
const PORTAL_USERNAME = "133400343";
const PORTAL_PASSWORD = "Generico@01";
const WebView = NativeWebView as any;

const fillLoginScript = `
(function() {
  const user = ${JSON.stringify(PORTAL_USERNAME)};
  const password = ${JSON.stringify(PORTAL_PASSWORD)};
  const find = (selectors) => selectors.map((selector) => document.querySelector(selector)).find(Boolean);
  const fill = () => {
    const username = find(['input[name*=User i]', 'input[id*=User i]', 'input[name*=Login i]', 'input[type=text]', 'input[type=email]']);
    const secret = find(['input[type=password]', 'input[name*=Pass i]', 'input[id*=Pass i]']);
    if (username) { username.value = user; username.dispatchEvent(new Event('input', { bubbles: true })); username.dispatchEvent(new Event('change', { bubbles: true })); }
    if (secret) { secret.value = password; secret.dispatchEvent(new Event('input', { bubbles: true })); secret.dispatchEvent(new Event('change', { bubbles: true })); }
    return Boolean(username || secret);
  };
  fill();
  const observer = new MutationObserver(fill);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
  true;
})();
`;

export function PortalBrowser() {
  const webViewRef = useRef<any>(null);
  const [status, setStatus] = useState("Listo para abrir el portal");
  const [showNativeBrowser, setShowNativeBrowser] = useState(false);

  const openExternal = async () => {
    setStatus("Abriendo portal…");
    if (Platform.OS === "web") {
      await WebBrowser.openBrowserAsync(PORTAL_URL);
    } else {
      setShowNativeBrowser(true);
    }
    setStatus("Portal abierto");
  };

  const onMessage = (_event: WebViewMessageEvent) => setStatus("Portal cargado");

  if (Platform.OS !== "web" && showNativeBrowser) {
    return <View style={styles.browserShell}><View style={styles.browserBar}><Pressable onPress={() => setShowNativeBrowser(false)} style={styles.backButton}><MaterialIcons name="arrow-back" size={20} color="#FFFFFF" /></Pressable><Text numberOfLines={1} style={styles.browserTitle}>Portal operativo</Text><Pressable onPress={() => webViewRef.current?.reload()} style={styles.refreshButton}><MaterialIcons name="refresh" size={20} color="#FFFFFF" /></Pressable></View><WebView ref={webViewRef} source={{ uri: PORTAL_URL }} injectedJavaScript={fillLoginScript} onLoadEnd={() => setStatus("Portal cargado; datos de acceso completados")} onMessage={onMessage} javaScriptEnabled domStorageEnabled sharedCookiesEnabled style={styles.webview} /></View>;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}><View style={styles.heroIcon}><MaterialIcons name="language" size={24} color="#6DCCB5" /></View><Text style={styles.eyebrow}>NAVEGADOR INTEGRADO</Text><Text style={styles.title}>Portal operativo</Text><Text style={styles.description}>Abre el panel de gestión sin salir de Funel. En móvil se muestra dentro de la app; en Preview/web se abre en una pestaña segura del navegador.</Text></View>
      <View style={styles.urlCard}><Text style={styles.label}>SITIO FIJO</Text><Text selectable style={styles.url}>{PORTAL_URL}</Text><View style={styles.divider} /><Text style={styles.label}>ACCESO CONFIGURADO</Text><View style={styles.credentialRow}><MaterialIcons name="person-outline" size={18} color="#355070" /><Text style={styles.credentialText}>Usuario configurado</Text><MaterialIcons name="check-circle" size={17} color="#6DCCB5" /></View><View style={styles.credentialRow}><MaterialIcons name="lock-outline" size={18} color="#355070" /><Text style={styles.credentialText}>Contraseña configurada</Text><MaterialIcons name="check-circle" size={17} color="#6DCCB5" /></View></View>
      <Pressable onPress={openExternal} style={({ pressed }) => [styles.openButton, pressed && styles.pressed]}><MaterialIcons name="open-in-browser" size={20} color="#FFFFFF" /><Text style={styles.openButtonText}>Abrir portal</Text></Pressable>
      <Text style={styles.status}>{status}</Text>
      <View style={styles.notice}><MaterialIcons name="security" size={18} color="#D99A2B" /><Text style={styles.noticeText}>El acceso está configurado para esta aplicación. No compartas el APK con personas no autorizadas.</Text></View>
      {Platform.OS === "web" ? <Pressable onPress={() => Linking.openURL(PORTAL_URL)}><Text style={styles.fallbackLink}>Abrir directamente en el navegador del dispositivo</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  hero: { minHeight: 190, padding: 19, borderRadius: 19, backgroundColor: "#355070" },
  heroIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  eyebrow: { color: "#6DCCB5", fontSize: 9, fontWeight: "900", letterSpacing: 1.3 },
  title: { color: "#FFFFFF", fontSize: 25, fontWeight: "900", marginTop: 6 },
  description: { color: "#D7E4E9", fontSize: 12, lineHeight: 18, marginTop: 8 },
  urlCard: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E5E2DA", backgroundColor: "#FFFFFF" },
  label: { color: "#71808A", fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  url: { color: "#355070", fontSize: 11, lineHeight: 16, marginTop: 7 },
  divider: { height: 1, backgroundColor: "#E5E2DA", marginVertical: 14 },
  credentialRow: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 30 },
  credentialText: { color: "#1E2A32", fontSize: 12, fontWeight: "700", flex: 1 },
  openButton: { minHeight: 49, borderRadius: 13, backgroundColor: "#355070", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  openButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  status: { color: "#71808A", textAlign: "center", fontSize: 11 },
  notice: { padding: 12, borderRadius: 13, backgroundColor: "#FFF4DD", flexDirection: "row", gap: 8, alignItems: "flex-start" },
  noticeText: { color: "#7D5B1B", fontSize: 11, lineHeight: 16, flex: 1 },
  fallbackLink: { color: "#355070", textAlign: "center", fontSize: 11, fontWeight: "800" },
  browserShell: { flex: 1, minHeight: 650, marginHorizontal: -18, marginTop: -16, backgroundColor: "#FFFFFF" },
  browserBar: { height: 52, paddingHorizontal: 12, backgroundColor: "#355070", flexDirection: "row", alignItems: "center", gap: 10 },
  backButton: { padding: 6 },
  refreshButton: { padding: 6 },
  browserTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", flex: 1 },
  webview: { flex: 1 },
  pressed: { opacity: 0.78 },
});

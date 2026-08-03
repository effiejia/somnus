function getKeyHex(): string {
	return process.env.NEXT_PUBLIC_DREAM_ENCRYPTION_KEY ?? "";
}

function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
	}
	return bytes;
}

async function getKey(): Promise<CryptoKey> {
	return crypto.subtle.importKey("raw", hexToBytes(getKeyHex()), { name: "AES-GCM" }, false, [
		"encrypt",
		"decrypt",
	]);
}

export async function encrypt(text: string): Promise<string> {
	if (!getKeyHex()) return text;
	const key = await getKey();
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const ciphertext = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		new TextEncoder().encode(text),
	);
	const combined = new Uint8Array(12 + ciphertext.byteLength);
	combined.set(iv);
	combined.set(new Uint8Array(ciphertext), 12);
	return btoa(String.fromCharCode(...combined));
}

export async function decrypt(text: string): Promise<string> {
	if (!getKeyHex()) return text;
	try {
		const key = await getKey();
		const combined = Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
		const decrypted = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv: combined.slice(0, 12) },
			key,
			combined.slice(12),
		);
		return new TextDecoder().decode(decrypted);
	} catch {
		return text; // graceful fallback for existing unencrypted rows
	}
}
